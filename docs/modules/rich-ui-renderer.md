---
covers: ["components/richUI/**", "components/ComponentRenderer.tsx", "components/FormComponent.tsx", "components/Grid/**", "app/chatbotpreview/**", "components/Chatbot-Preview/**", "components/ChatbotPreview.tsx"]
verified_at: c7ace0c
verified_on: 2026-10-20
---
# Rich UI renderer (JSON in AI replies)

Turns an assistant message whose content is JSON into React UI inside the chat bubble. There are two renderers. Both are mounted only from `components/Interface-Chatbot/Messages/AssistantMessage.tsx`:

- **richUI** (`components/richUI/`): the current one. A recursive renderer over a tree of `{ type, ...props, children }` nodes, with 19 registered types (cards, rows, buttons, tables, lists, pickers). Added in ce6f13e "rich ui refactor" (2026-03-11).
- **Grid** (`components/Grid/Grid.tsx` + `components/ComponentRenderer.tsx`): the older `{ components: [...] }` format. Most of its widget map was deleted in abed550 (#236). Only `markdown` and `chatbot` are left, so it is effectively legacy.

This area also holds a static `/chatbotpreview` demo page and three files that nothing imports.

| File | Role |
|---|---|
| `components/richUI/RenderNode.js` | Recursive entry point. Looks up `node.type` in the registry, spreads the node as props, and passes `onAction`, `actionDefs` and `renderNode`. |
| `components/richUI/componentRegistry.js` | `componentRegistry`: the `type` string → component map. This is the source of truth for supported types. |
| `components/richUI/components/` | One file per node type (`ButtonComponent.js`, `CardComponent.js`, …). |
| `components/richUI/styleUtils.js` | Shared prop → class/style resolvers: `resolvePadding`, `resolveColor`, `resolveBackground`, `resolveRounded`, `resolveDimension`, `resolveBorder`, `resolveShadow`, `safeStyleObj`. |
| `utils/templateEngine.ts` | Double-brace path interpolation (e.g. item.name in braces) (`resolveNode`, `resolveAction`). Used by `ListViewComponent.js` and `ButtonComponent.js`. Owned by [app-shell](./app-shell.md). |
| `components/Grid/Grid.tsx` | Legacy entry point. Substitutes `variables.*` paths, provides `GridContext`, and lazy-loads `Viewonlygrid`. |
| `components/Grid/Viewonlygrid.tsx` | Renders one `ComponentRenderer` per item in `components`, stacked vertically. |
| `components/ComponentRenderer.tsx` | Legacy `componentMap` with only `chatbot` and `markdown`. |
| `components/Grid/ReactGridItemWrapper.tsx`, `components/Grid/Grid.css` | Leftovers from a grid editor. Nothing imports the wrapper. It imports hooks/ResizeObserverHook.tsx, which does not exist. |
| `components/FormComponent.tsx` | Old Hello "Enter your details" form. Not imported anywhere. It imports `@/config/helloApi`, which does not exist. |
| `components/ChatbotPreview.tsx`, `components/Chatbot-Preview/ChatbotPreview.tsx` | Two near-identical old preview shells. Not imported anywhere. The second imports `MessageList.jsx`, but the file is `MessageList.tsx`. |
| `app/chatbotpreview/page.tsx` | `/chatbotpreview`: a self-contained fake chat (hard-coded messages and a canned bot reply) that recolours itself on a `themeChange` postMessage. |

## How it works

### Which renderer a message gets (`AssistantMessage.tsx`)

`rawContent` is `message.chatbot_message || message.content` (or the error text). If it is already an object it is used as is. Otherwise it is parsed when `isJSONString` (`utils/ChatbotUtility.ts`) returns true. The checks run in this order:

1. The object has an `isMarkdown`, `response` or `components` key:
   - If `isMarkdown` or `response` is truthy, it renders markdown from `markdown`, or else from `JSON.stringify(response)`.
   - Otherwise it renders `<InterfaceGrid componentJson={parsedContent} msgId={message.createdAt} … />`. This is the legacy Grid.
2. The object has a `type` that is a key of `componentRegistry`: it renders `<RenderNode node={parsedContent} onAction={…} />` inside `div.richui-container`.
3. The value is an array whose **first** item has a registered `type`: it renders the whole array the same way.
4. Anything else is rendered as markdown.

The only `onAction` handler is `if (action.type === "reply" && action.text) sendMessage({ message: action.text })`. `sendMessage` is `useSendMessage` from `components/Chatbot/hooks/useChatActions.ts` (see [ai-chat](./ai-chat.md)). Every other action type that reaches it is dropped.

Where the JSON comes from: the agent's reply text, delivered like any other message (see [ai-message](../flows/ai-message.md)). In test-chatbot mode, `utils/demoChatbotData.ts:getDemoResponse` returns stringified richUI trees for "table" and "card" prompts, so it is the quickest way to see the renderer.

> [!TODO] Needs a human: which GTWY agent setting or prompt makes the backend reply with richUI JSON, and is there a published schema the model is given? Nothing in this repo defines it.

### richUI: `RenderNode`

1. `null` gives nothing. An array renders each item (key `item.id ?? index`). A non-object gives nothing.
2. `Component = componentRegistry[node.type]`. If the type is unknown, it still renders `node.children` recursively, so a bad wrapper type does not hide its content.
3. Otherwise it strips `key` and `type` and renders `<Component {...rest} onAction actionDefs renderNode={RenderNode} />`. Containers render their own `children` by calling the `renderNode` prop (as `RNode`).

### richUI node types (`componentRegistry`)

Read `components/richUI/componentRegistry.js` for the live list. Main props at c7ace0c:

| `type` | Main props | Emits via `onAction` |
|---|---|---|
| `Card` | `children[]`, `variant` (elevated/outlined/flat/ghost), `size`, `theme:"dark"`, `padding`, `bg`/`background`, `color`, `shadow`, `rounded`, `border`, `confirm`/`cancel` `{label, action}` | footer buttons: `{...action, type: action.type ?? "request.submit" / "request.discard"}` |
| `Row` / `Col` | `children[]`, `gap` (×4px), `align`, `justify` (Row), `wrap`, `width` (Col), plus the style props above | — |
| `Box` | `children[]`, `width`, `height`, `radius` (alias of `rounded`), style props. Renders as a flex spacer when it is empty and has no style props. | — |
| `Text` | `value`, `size`, `weight`, `color`, `align`/`textAlign`, `truncate`, `lines`, `italic`, `underline`, `editable: {name, placeholder, required, type}` | editable: `{type:"fieldChange", name, value}` on blur |
| `Title` | `value`, `level` 1–6, `size`, `weight`, `gradient` | — |
| `Caption`, `Badge` (`label`, `variant`, `dot`), `Divider` (`label`, `flush`, `opacity`, `spacing`), `Spacer` (`size`, `direction`), `Icon` (`name` = kebab-case lucide name, falls back to `Info`), `Image` (`src`, `alt`, `size`/`width`/`height`, `aspect`, `objectFit`) | display only | — |
| `Button` | `label`, `variant`, `size`, `disabled`, `loading`, `onClickAction`, `payload`, `actionRef`, `scope` | see [Button actions](#button-actions) |
| `ListView` | `items` (array, or an object bag with `binding`), `itemTemplate`, `itemAlias`, `idField`, `children[]`, `direction` (vertical/horizontal/grid), `gap`, `dividers`, `hover`, `emptyText` | passes through |
| `ListViewItem` | `children[]`, `divider`, `hover` | — |
| `Table` | `columns` (strings, or `{key,label,align,width}`), `data[]`, `zebra`, `compact`, `stickyHeader`, `hover`. A cell value that is an object with `type` is rendered as a node. | passes through |
| `Select` | `name`, `label`, `options: [{value,label}]`, `defaultValue`, `placeholder`, `width` | `{type:"selectChange", name, value}` |
| `DatePicker` / `DateRangePicker` | `name`, `label`, `defaultValue` (string, or `{start,end}` for a range), `min`, `max`. `DateRangePicker` is `DatePicker` with `range`. | `{type:"dateChange", name, value}` |

Style props shared by most types go through `styleUtils.js`:
- Colours accept semantic names (`muted`, `primary`, `success` …), Tailwind-like names such as `green-500` (mapped to hex), `alpha-N`, or raw `#`/`rgb`/`hsl` values.
- `bg` also accepts CSS gradients and `glass`/`surface*` presets.
- Numeric `padding` means N×4px. The named sizes are `xs`…`xl`.
- `style` is passed through as an inline style object, and `className` is appended.

Real example (from `utils/demoChatbotData.ts`):

```json
{ "type": "Card", "variant": "elevated", "children": [
  { "type": "Title", "value": "Demo Card", "level": 3 },
  { "type": "Text", "value": "This card is rendered from structured JSON ..." },
  { "type": "Divider" },
  { "type": "Row", "gap": 2, "children": [ { "type": "Badge", "label": "Demo", "variant": "ghost" } ] },
  { "type": "Button", "label": "Show me a table", "onClickAction": { "type": "reply", "text": "Show me a table" } }
]}
```

### Button actions

`components/richUI/components/ButtonComponent.js` has two paths. Action types are trimmed and lowercased.

Legacy inline `onClickAction` (the only path that works from chat today):

| `onClickAction.type` | Effect |
|---|---|
| `reply` | `onAction({type:"reply", text: text ?? value ?? label, data})`. `AssistantMessage` then sends `text` as a new user message. |
| `sendDataToFrontend` / `submit` | `emitEventToParent("FRONT_END_ACTION", X)`, where X is the first that exists of `payload.action_data.data`, `payload.action_data`, `payload`. `payload` is the node-level `payload` prop, or else the remaining keys of `onClickAction`. |
| other | `console.warn`, nothing else happens |

`onClickAction.type` may itself be an object holding the action (`{type:{type:"reply",…}}`). That object is unwrapped.

Declarative `actionRef`: `resolveAction(actionRef, actionDefs, scope)` looks up `actionDefs[actionRef]`, deep-clones it, and interpolates double-brace placeholders from `scope`. The resolved `type` is `reply` (same as above) or `event`. An `event` emits `FRONT_END_ACTION` with `payload.action_data.data` / `payload.action_data` / `{name, target, payload}`, then calls `onAction({type:"event", …})`.

Reply buttons are disabled while `state.Chat.loading` is true. A reply button that was clicked shows a "Please wait" tooltip.

`FRONT_END_ACTION` goes to `window.parent` with target origin `"*"`. Neither `public/chatbot.js` nor `public/chat-widget.js` handles it, so the host page's own `message` listener must. The message contract is in [api](../api.md) and the sender in [embed-scripts](./embed-scripts.md).

### richUI templating (`utils/templateEngine.ts`)

- `interpolate`: a string that is exactly one placeholder (`"{{a.b[0]}}"` in JSON) becomes the raw value (any type). <!-- verify:ignore --> Inline placeholders become `String(value)`. Unresolved placeholders stay as literal text.
- `ListView` with `binding` and an object `items`: the array is `items[binding]`. Each row's `itemTemplate` is resolved with `resolveNode` against scope `{[itemAlias]: row, ...otherKeysOfItems}`.
- `ListView` with a plain `items` array: it uses its own local resolver, which only understands the `item.<key>` placeholder (no nesting, no alias).
- `ListView` with no template: it auto-renders `image`/`title`/`subtitle`/`badge`/`value` per item.
- Pre-resolved `children` win over everything (the "Mode C" comment).

```json
{ "type": "ListView", "binding": "rows", "itemAlias": "r",
  "items": { "rows": [{ "id": 1, "name": "A" }] },
  "itemTemplate": { "type": "Text", "value": "{{r.name}}" } }
```

### Legacy Grid

1. `Grid` runs `replaceDynamicPaths(componentJson, componentJson)`. A string that is exactly `variables.x.y` is replaced by that value. A string that contains such a path gets it substituted as text. The lookup is against the **same JSON**, so the values must be in a top-level `variables` key.
2. It provides `GridContext = { gridContextValue: {...resolved, msgId}, componentJson }`.
3. `Viewonlygrid` maps `components` (or the value itself, if it is an array) to `ComponentRenderer` by index.
4. `ComponentRenderer` lowercases `type` and calls `componentMap[type]({props, componentId, inpreview, dragRef, action, meta, propsPath})`. Only `markdown` (renders `InterfaceMarkdown` from `props.children`/`text`/`content`/`data`) and `chatbot` (mounts the whole `Chatbot` component) exist. Unknown types render `null`.

```json
{ "components": [ { "type": "markdown", "props": { "text": "Hi variables.name" } } ],
  "variables": { "name": "Ada" } }
```

`AssistantMessage` also hides the copy button when parsed content has both `components` and `variables`.

### `/chatbotpreview`

`app/chatbotpreview/page.tsx` (edge runtime) renders a fake chat UI built from DaisyUI and lucide icons:
- three hard-coded messages
- a text box that appends the user message and a canned bot reply after 1s
- fake drawer, call and video buttons

It does not use Redux chat state, rtlayer, the real `Chatbot` component, or either renderer above. Its one input is a `message` listener: `{type:"themeChange", themeColor}` calls `ThemeContext.handleThemeChange(themeColor || "#000000")` (see [app-shell](./app-shell.md)). The listener does not check `event.origin`. The page sends nothing back.

> [!TODO] Needs a human: who iframes `/chatbotpreview`? Nothing in this repo or in the local AI-middleware-frontend checkout references it, so it may be unused.

## Contracts

- A message is rich UI only if its parsed JSON root (or its first array item) has a `type` that is an exact, case-sensitive key of `componentRegistry`. `"card"` falls through to markdown, which prints the raw JSON.
- A root with any of the keys `isMarkdown`, `response` or `components` always goes to the markdown/Grid branch, even if it also has a registered `type`.
- Every component receives every key of its node as a prop, plus `onAction`, `actionDefs` and `renderNode`. Containers must call `renderNode` for `children` and forward `onAction`.
- Text is rendered as React children (`String(value)`), never as HTML. No richUI component uses `dangerouslySetInnerHTML`, `eval` or `@babel/standalone`. Babel is used only by `components/Interface-Chatbot/ChatbotDrawerParts/useComponentOverride.tsx`, which compiles host-configured override JSX with indirect `eval` (see [chat-ui](./chat-ui.md)). It never touches AI output.
- Outbound postMessage from this area: only `FRONT_END_ACTION`.

## Gotchas

> [!WARNING]
> **`actionRef` buttons do nothing in chat today.** `AssistantMessage` never passes `actionDefs` to `RenderNode`, so `resolveAction` returns `null` and the click is silently dropped. Even with `actionDefs`, `Card`, `Row`, `Col`, `Box`, `ListViewItem` and `Table` call `RNode` without forwarding `actionDefs`. Only `RenderNode`'s array/unknown-type paths and `ListView` forward it. Use inline `onClickAction` until both are fixed.

> [!WARNING]
> **Most `onAction` events are dropped.** `AssistantMessage` handles only `reply`. Card `confirm`/`cancel` (`request.submit`/`request.discard`), `selectChange`, `dateChange`, `fieldChange` and `event` reach the handler and are ignored. So Select, DatePicker and editable Text values are never sent anywhere. Only `submit`/`sendDataToFrontend`/`event` buttons have an effect beyond `reply`: they post to the parent directly.

> [!WARNING]
> **The JSON is untrusted model output.** React escapes text, so there is no HTML injection. However, AI JSON controls:
> - `Image.src`: any URL, so it can be a tracking pixel.
> - Raw `style` and `className`: e.g. a `position:fixed` overlay covering the chat.
> - The `FRONT_END_ACTION` payload: it goes to `window.parent` with origin `"*"`.
>
> Treat `FRONT_END_ACTION` data as user-controllable on the host side. Before adding a link/href component, an HTML component or a `postMessage` target from node props, sanitize it (block `javascript:`, check the origin). HTML rendering was removed on purpose in b8b7b7e.

> [!WARNING]
> **Malformed JSON can crash the whole chat.** There is no error boundary around messages, only the route-level `app/error.tsx`. A node like `{"type":"Table","data":"x"}` (where `.map` is not a function) or `{"type":"Icon","name":5}` (where `.split` is not a function) throws during render and replaces the chatbot with the error page. Validate prop types in any new component.

> [!WARNING]
> **Dynamic Tailwind classes may not exist.** Fallbacks such as `` `text-${color}` ``, `` `bg-${bg}` ``, `` `w-${width}` ``, `` `object-${objectFit}` `` and `` `rounded-${x}` `` build class names at runtime. `tailwind.config.ts` has no safelist, so these classes work only if the same literal appears somewhere in the scanned sources. Prefer hex/semantic values, which `styleUtils.js` maps to inline styles or known classes (as its comment about purging says).

> [!WARNING]
> **The dead files would break the build if imported.** `components/FormComponent.tsx`, `components/Grid/ReactGridItemWrapper.tsx` and `components/Chatbot-Preview/ChatbotPreview.tsx` import modules that do not exist. `next.config.ts` sets `typescript.ignoreBuildErrors`, so only bundling them would fail. Delete them rather than revive them.

## Why it is built this way

- **richUI replaced the MUI `Interface-*` widgets.** ce6f13e added the registry renderer, Tailwind/DaisyUI components and `utils/templateEngine.ts`. abed550 (#236, "remove Hello/widget mode support") then deleted the `Interface-*` widgets and trimmed `componentMap` to `chatbot` and `markdown`. Grid is kept only for old `{components, variables}` replies in history.
  > [!TODO] Needs a human: can the Grid branch and the `chatbot` map entry be removed, or do live agents still emit `{components: […]}`?
- **Raw HTML replies were rejected.** b8b7b7e removed an isHTMLContent check and its `dangerouslySetInnerHTML` branch, plus a `data-action` click delegate posting CHATBOT_ACTION. Actions now go through `emitEventToParent("FRONT_END_ACTION")` only.
- **Template resolution against message.ai_response was removed** from `AssistantMessage` in 929304d. Data now has to be in the node itself (inline values or `ListView` `items`).
- **Reply buttons once used `window.postMessage({type:"askAi"})`.** They now call `sendMessage` directly (changed in 50da1d5).
- **The `action_data.data` unwrapping** in `FRONT_END_ACTION` (4fb7aee, #180, no PR body) makes the host receive the inner data object, not the wrapper.

## Changing it safely

**Add a richUI node type:**
1. Create `components/richUI/components/<Name>Component.js` with `"use client"`.
   - Destructure the props you read, plus `className`, `style`, `onAction` and `renderNode: RNode`.
   - Use `safeStyleObj` and the `styleUtils` resolvers instead of raw class interpolation.
   - Guard every array or string prop (`Array.isArray`, `typeof`) so bad AI JSON cannot throw.
2. If it has children, render `children.map((c, i) => <RNode key={c?.id ?? i} node={c} onAction={onAction} actionDefs={actionDefs} />)`. Forward `actionDefs`, unlike the existing containers.
3. Register it in `componentRegistry` under the exact PascalCase `type` string. Variants can be inline wrappers, like `DateRangePicker`.
4. If it emits a new `onAction` type that should do something, handle it in **both** `onAction` callbacks in `AssistantMessage.tsx` (object root and array root).
5. To check it, open the chatbot in test-chatbot mode, temporarily return your JSON from `getDemoResponse`, and confirm that malformed props do not crash it.

**Change button behaviour:** keep the `reply` loading guard, the `FRONT_END_ACTION` payload unwrapping (host integrations depend on it), and the lowercase type matching. If you make `actionRef` work, pass `actionDefs` from `AssistantMessage` and fix the containers in the same change.
