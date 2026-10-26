---
covers: ["components/Interface-Chatbot/**", "store/componentOverrides/**", "components/ThreadSidebar.tsx", "components/customToast.js"]
verified_at: c7ace0c
verified_on: 2026-10-20
---
# Chat UI (component tree inside the iframe)

The React components that draw the chat inside the iframe: header, thread sidebar, message list, message bubbles (assistant, user, tool calls, planning, reasoning, review), markdown, the input box, and the runtime component-override system. `components/Chatbot/Chatbot.tsx` (owned by [ai-chat](./ai-chat.md)) mounts this tree. State, sending and streaming live in ai-chat. This area only reads the `Chat`, `Interface`, `appInfo` and `draftData` slices and calls ai-chat hooks.

| File | Role |
|---|---|
| `components/Interface-Chatbot/InterfaceChatbot.tsx` | `MessageContext`: `{ messageRef, timeoutIdRef }`. `Chatbot.tsx` provides it. `messageRef` is the single handle to the input box. |
| `components/Interface-Chatbot/ChatbotHeader.tsx` | Header bar (title, new chat, drawer toggle, fullscreen, minimize, close, host-defined buttons, bridge switch). Also exports `AiServicesToSwitch` (model picker used by the text field) and `ChatbotHeaderPreview`. |
| `components/Interface-Chatbot/ChatbotTextField.tsx` | Input box: send, attachments, emoji, model picker, plan-mode flag, suggestion chips, `setInput` listener. |
| `components/Interface-Chatbot/ChatbotDrawer.tsx` | Thin wrapper around `Sidebar`, with URL data injected. |
| `components/Interface-Chatbot/ChatbotDrawerParts/` | `Sidebar.tsx` (daisyUI drawer, new chat, thread switch), `SidebarHeader.tsx`, `SidebarBody.tsx`, `ThreadList.tsx`, `SidebarFooter.tsx` ("Powered by GTWY"), `useComponentOverride.tsx`. |
| `components/Interface-Chatbot/Messages/MessageList.tsx` | Scroll container (column-reverse), infinite scroll for older history, auto-scroll while streaming, scroll-to-bottom button. |
| `components/Interface-Chatbot/Messages/Message.tsx` | Routes one stored message to the right card(s), plus a `DateGroup` divider. |
| `components/Interface-Chatbot/Messages/AssistantMessage.tsx` | Assistant bubble: images, reasoning/working accordions, planning cards, tool calls, review phases, content (markdown / rich UI / legacy grid), copy and feedback buttons. |
| `components/Interface-Chatbot/Messages/UserMessage.tsx` | User bubble with attachments. Emits `MESSAGE_CLICK` to the host when subscribed. |
| `components/Interface-Chatbot/Messages/HumanOrBotMessage.tsx` | Legacy `Human`/`Bot` role bubble. Renders `pushNotification` HTML in a shadow root and runs its `<script>` tags. |
| `components/Interface-Chatbot/Messages/PlanningQuestionsCard.tsx` | Clarifying-question form for plan mode. Also renders read-only Q&A history. |
| `components/Interface-Chatbot/Messages/PlanningTasksCard.tsx` | Plan task list with live execution status, human queries, and Proceed / Update / Respond / Retry actions. |
| `components/Interface-Chatbot/Messages/ReasoningAccordion.tsx`, `WorkingAccordion.tsx`, `ToolCallAccordion.tsx`, `ReviewPhaseAccordion.tsx` | Collapsible streaming panels (see [Accordions](#accordions)). |
| `components/Interface-Chatbot/Messages/StarterQuestions.tsx` | Starter-question cards on the empty view. Clicking one sends it. |
| `components/Interface-Chatbot/Messages/ImageWithFallback.tsx` | Attachment renderer (image, video, audio, pdf, other) with a `permanentUrl` fallback and a download button. |
| `components/Interface-Chatbot/Messages/ToolsCallMessage.tsx`, `VoiceCallMessage.tsx`, `DateGroup.tsx`, `MessageTime.tsx` | Legacy `tools_call` / `voice_call` rows, day divider, relative time with a tooltip. |
| `components/Interface-Chatbot/Interface-Markdown/MarkdownUtitily.tsx` | The react-markdown component map: `Code`, `Anchor`, lists, `Table`/`TableHead`/`TableRow`/`TableHeaderCell`/`TableCell`. |
| `components/Interface-Chatbot/Interface-Markdown/CodeBlock.tsx` | Syntax highlighting (Prism light build, 13 languages), JSON pretty-print, copy, HTML preview in a sandboxed iframe. |
| `components/Interface-Chatbot/Interface-Markdown/InterfaceMarkdown.tsx` | Standalone markdown wrapper. Used only by the legacy `components/ComponentRenderer.tsx`. |
| `components/Interface-Chatbot/EmojiSelector.tsx`, `MoveToDownButton.tsx`, `ChatbotHeaderTab.tsx` | Emoji picker (frimousse), scroll-to-bottom button, a header tab that always returns `null`. |
| `components/Interface-Chatbot/InterfaceChatbot.css`, `components/Interface-Chatbot/Messages/Message.css` | Plain CSS: `.move-to-down-button`, the `.loading-indicator` pulsing dot, slide animations, thinking pill. |
| `store/componentOverrides/componentOverridesSlice.ts` | Redux slice holding the override tree. |
| `components/customToast.js` | `successToast` / `errorToast` / `warningToast` / `infoToast`: MUI Snackbars mounted into new `alert-container-N` divs, auto-closed after 3 s, de-duplicated by severity+message. |
| `components/ThreadSidebar.tsx` | Placeholder that nothing imports. |

## How it works

### Tree

```text
Chatbot.tsx (ai-chat)  ── MessageContext.Provider
├─ div[data-testid=chatbot-sidebar] (w-0 when closed or < 1024px)
│   └─ ChatbotDrawer → Sidebar            override ["sidebar"]
│       ├─ drawer-content (lg:hidden)     ChatbotHeader + MessageList + ChatbotTextField  ← second copy, see Gotchas
│       └─ drawer-side
│           ├─ SidebarHeader              ["sidebar","header"]
│           ├─ SidebarBody → ThreadList → ThreadItem   ["sidebar","body"] / [...,"threadList"] / [...,"threadList","item"]
│           └─ SidebarFooter              ["sidebar","footer"]
├─ ChatbotHeader                          ["chatbotHeader"] (+ title, closeButton, minimizeButton, menuIcon, editIcon)
├─ ChatbotHeaderTab                       (returns null)
└─ EmptyChatView ["emptyChatView"]  or  ActiveChatView
     ├─ ChatbotTextField                  ["chatbotTextField"] (+ sendButton, uploadButton) → EmojiSelector ["emojiSelector"]
     ├─ StarterQuestions                  (empty view only)
     └─ MessageList                       ["messageList"]
          └─ Message → UserMessageCard ["messageList","userMessage"]
                     → AssistantMessageCard ["messageList","assistantMessage"]
                     → HumanOrBotMessageCard ["messageList","humanMessage" | "botMessage"]
                     → ToolsCallMessage / VoiceCallMessage
```

`EmptyChatView` shows while the current sub-thread has no message ids. Most components are wrapped in `hoc/addUrlDataHoc.tsx:addUrlDataHoc`, which injects `chatSessionId`, a composite `tabSessionId` (`<chatSessionId>_<tabSessionId>`), and the requested params (`subThreadId`, `threadId`, `bridgeName`, …). See [app-shell](./app-shell.md).

### Message routing (`components/Interface-Chatbot/Messages/Message.tsx`)

The Chat slice stores **one record per turn**: the user text in `user`, and the assistant reply in `content` / `llm_message` / `chatbot_message`. On send, `useSendMessage` writes `{ role: "assistant", user, user_urls, content: "", wait: true }` (see [ai-chat](./ai-chat.md)). `Message` decides what to render:

1. If `message.user || message.llm_message || message.content` (the combined format):
   - `UserMessageCard` with `content: message.user` and `urls: message.user_urls`. It is skipped when the message has `planning` and `user` matches `PLAN_ANSWER_PREFIX_RE` (`q1: …`). That text is a plan-answer echo that the Q&A card already shows.
   - `AssistantMessageCard` when there is `content`, `llm_message`, `error`, `planning` or `isStreaming`. Its `content` is forced to `""` when `planning` is set, and `urls` comes from `llm_urls`.
2. Otherwise it switches on `role`: `user`, `assistant`, `Human`, `Bot`, `tools_call` (hidden when `ChatbotContext.hideToolCall`), and `voice_call`.

`MessageList` passes `isLastMessage` only to the newest `Human`/`Bot` message. It opens with its timestamp showing.

### AssistantMessageCard render order

1. `message.wait`: the `Name[]` chips plus `content` (for example "Running "), then the pulsing `.loading-indicator`.
2. `message.timeOut`: "Timeout reached".
3. Otherwise, top to bottom: `image_urls` (via `ImageWithFallback`, with a "View Full Image" link), then `WorkingAccordion` (if `planning`) or `ReasoningAccordion`, then `planning.planHistory` Q&A cards, then `plan.message_to_user` and a live `PlanningQuestionsCard`, then the "Planning…" / "Preparing output…" loaders (`isPlanningLoading`, `isSynthesizerLoading`), then `PlanningTasksCard` (if `planning`) or `ToolCallAccordion`, then `ReviewPhaseAccordion`, then the content.
4. The content is suppressed while `planning` exists and `planning.execution.state !== "completed"`. Otherwise it goes to markdown, rich UI or the legacy Grid. The dispatch rules are in [rich-ui-renderer](./rich-ui-renderer.md#which-renderer-a-message-gets-assistantmessagetsx). With `isError`, the text is `appInfo.defaultErrorMessage` when that is set, else `message.error`.
5. The footer shows the copy button and, when `message_id` is set, thumbs up/down. It is hidden while `wait`, `isStreaming`, `timeOut` or `error`, or while a plan is not completed. Feedback strips a trailing `_user` / `_llm` from `message_id` before calling `useMessageFeedback`.

### Planning cards

Plan mode turns on in `ChatbotTextField`. When `appInfo.mode === true` and `appInfo.isStream === true`, every send adds `mode: "plan"` (the Planning/Fast menu is commented out, and `conversationMode` defaults to `"planning"`). The payload the cards read is `message.planning`, which ai-chat builds from stream events, or `utils/dataConvertWrappers/makeGenericDataFormatUtility.tsx` builds from history:

```ts
planning: {
  plan: {                                   // "new format"
    message_to_user?: string,
    questions?: { id: string; question: string; options?: string[] }[],
    plan?: { state?: "paused" | ..., tasks: Task[] | Record<string, Task> }
  },                                        // legacy: plan is the task plan itself, or a JSON string
  planHistory?: { message_to_user?, questions?, answers?: Record<qId, string>, timestamp? }[],
  execution?: { state: "idle"|"queued"|"running"|"executing"|"paused"|"updating"|"completed"|"error",
                tasks: Record<taskId, { status, title?, result?, error?, reasoning?, is_error? }> },
  currentAnswers?: Record<qId, string>      // set by savePlanningAnswers
}
Task = { id, title?, task_description?, status?, dependencies?: string[],
         human_query?, human_options?: string[], allow_custom_response?, human_response?, error? }
```

**`PlanningQuestionsCard`** shows one row per question: option chips plus "Other" (free text), or only a text input when the question has no `options`. Submit stays disabled until every question has an answer. On submit it dispatches `savePlanningAnswers({ answers })` (`store/chat/chatSlice.ts`) and calls `onSubmit("q1: <answer>\nq2: <answer>")`. `AssistantMessage` turns that into `sendMessage({ message, mode: "plan", skipUserEcho: true, silent: true })`. With `isHistorical` it renders read-only from the `answers` prop.

**`PlanningTasksCard`** normalises `tasks` (an array, or an object keyed by id) and merges each task with `execution.tasks[id]`. A task's status picks its icon: in_progress, done/completed, error/failed, waiting_for_user, or pending. While executing, the in-progress task is auto-opened and scrolled into view, and a done/total progress bar shows. Its buttons call `onAction`, which `AssistantMessage.handlePlanningAction` turns into sends:

| Button (when shown) | `onAction` | What `sendMessage` gets |
|---|---|---|
| Proceed (not paused, no notes, not executing or streaming) | `"proceed"` | `{ message: "Please execute this plan", action: "approve", mode: "plan", skipUserEcho, silent }` |
| Retry (paused after a task error) / Retry failed | `"proceed"` | same as Proceed |
| Respond (execution paused on a `waiting_for_user` task) | `"respond"` with `humanQueryAnswers: { [taskId]: answer }` | `{ message: answer, action: "respond", mode: "plan", task_id, skipUserEcho, silent }`. Only the **first** waiting task is sent. |
| Update (plan paused before execution, or "Suggest changes" notes typed) | `"revise"` with `updateMessage` | `{ message: "task_id:<id>, answer:<a>\ntask_id:<id>, query:<note>", mode: "plan", skipUserEcho, silent }`. If the message is empty, the input box is focused instead. |

Human-query answers are keyed `<taskId>_<index>` in local state. If no `onAction` prop is given, the card instead calls `emitEventToParent("PLANNING_ACTION", { action: "execute" | "respond" | "update", ... })`. `AssistantMessage` always passes `onAction`, so in this tree that branch never runs.

### Accordions

| Component | Shows when | Behaviour |
|---|---|---|
| `ReasoningAccordion` | `message.reasoning` is non-empty and there is no `planning` | Auto-opens while streaming. Auto-closes once streaming ends and content exists. If the user closed it by hand, it stays closed. Sticks to the bottom while text streams in. Also reused per task in `PlanningTasksCard` with `label="Task Reasoning"`. |
| `WorkingAccordion` | `planning` is set and there is reasoning or `tools_data` | Same open/close rules. Reasoning plus a "Tools used" `ToolCallAccordion` (hidden by `hideToolCall`). The chip counts the tools. |
| `ToolCallAccordion` | `tools_data` (`Record<callId, { name, args, status: "calling" \| "done", result: string \| null }>`) has entries | One row per call. It expands only when `done`, and shows the args and the JSON-parsed result. |
| `ReviewPhaseAccordion` | `message.review_phases` is a non-empty array of `{ phase: "reviewer_start" \| "reviewer_done" \| "main_rerun_start", round, isStreaming?, passed?, reason?, reviewContent?, snapshotContent? }` | `reviewer_start` entries are skipped. `main_rerun_start` draws a "Regenerating · Round N" separator. Other entries show passed/failed plus the reviewer analysis and an "Outdated response" snapshot. `ChatbotTextField` shows "Under review…" while the last phase is streaming. |

### ChatbotTextField

- **Input.** A MUI multiline `TextField` with `inputRef={messageRef}` and `key={subThreadId || currentTeamId}`, so it remounts when the thread changes. React state `inputValue` mirrors the DOM value. `useSendMessage` reads the text from `messageRef.current.value` when no `message` is passed. Enter sends, Shift+Enter adds a newline.
- **Send is disabled** (`buttonDisabled`) when any of these holds:
  - a plan is executing (the last message's `planning.execution.state` is executing, running or queued; the input itself is disabled too)
  - `Chat.loading`
  - an upload is in progress
  - the input is empty and there are no attachments
  - a PDF is attached but there is no text (5721d92 "file support fix")
- **Attachments.** Uploading is allowed when `appInfo.image_model` or `appInfo.vision` is true (`true` or `"true"`). Images need either flag. PDFs need `image_model`. Limits: `MAX_IMAGES` = 4 images, `MAX_UPLOAD_SIZE_MB` = 10 MB per file, and no video or audio. Each file is posted to `uploadImage` (`config/api.ts`) as form field `image`. The returned `image_url`s go into `Chat.images` through `setImages`. Errors show through `errorToast`.
- **Model picker.** `AiServicesToSwitch` renders when `Interface[<key>].allowModalSwitch`. The service list is the first non-empty of `availableAiServicesToSwitch`, the keys of `serviceModels`, or the keys of `modelVisibilityConfig`. When `modalConfig.aiServices` is set, the list is narrowed to it. Models are grouped by type from `serviceModels[service]`. If that is missing it falls back to `modelVisibilityConfig[service]`, then to `DEFAULT_AI_SERVICE_MODALS`. Models with `hide` are filtered out, and `value` is used as the label. When nothing valid is selected it auto-selects `modalConfig.defaultSelected`, else `adminDefaultAiServiceAndModal`, else the first option. Selecting dispatches `setSelectedAIServiceAndModal`. The model-switch flow is described in [ai-chat](./ai-chat.md).
- **Suggestion chips.** The first 3 of `Chat.options` render as chips. Clicking one sends it.
- **Host messages.** The text field listens for `window` `message` events. `{ type: "open" }` focuses the input. `{ type: "setInput", data }` (c7ace0c) fills the input without sending. `data` is either a string or `{ setInput }` / `{ message }`. The host-side API is in [api](../api.md).

### Header

- **Title.** `Interface[chatSessionId].chatTitle`, else `chatbotConfig.chatbotTitle`, else "AI Assistant". The subtitle shows only when `chatbotConfig.chatbotSubtitle` is set. `chatIcon` is an optional image.
- **Left side.** The drawer toggle shows when there is more than one sub-thread. The New Chat button shows unless there is a single sub-thread with no messages.
- **Right side.** The bridge `<select>` (needs both `Interface.allowBridgeSwitch` and `chatbotConfig.allowBridgeSwitch`, and emits `BRIDGE_SWITCH`). Then the host buttons from `Chat.headerButtons`: `setting`, `history` and `verticalThreeDots` emit `HEADER_BUTTON_PRESS`; `sectionDropdown` emits it with `selectedOption`. Then fullscreen, which posts `ENTER_FULL_SCREEN_CHATBOT` / `EXIT_FULL_SCREEN_CHATBOT` to the parent. It is hidden by `hideFullScreenButton`, by `isMobileSDK`, or when width is `1200%`.
- **Close vs minimize.** Close posts `CLOSE_CHATBOT`. On `isMobileSDK` the close button is replaced by minimize, which toggles `draftData.isChatbotMinimized` and emits `MINIMIZE_CHATBOT`.
- **New chat**, in both the header and `Sidebar`, reuses an existing empty "New Chat" at `threadList[0].newChat` instead of adding another (6169cb7, #254). Otherwise it dispatches `setThreads` with a random `sub_thread_id`. Switching threads sets `appInfo.subThreadId` and clears `options`.

Event names and payloads: [api](../api.md).

## Component overrides (12ff552, #247)

A host can replace any of the components marked with an override path in the [Tree](#tree), at runtime, with JSX source sent in `SendDataToChatbot`. The handler is `hooks/GTWY/eventHandlers/embeddingScript/embeddingScriptEventHandler.ts`, owned by [embed-scripts](./embed-scripts.md).

```js
// host page
window.SendDataToChatbot({ config: {
  header: { path: ["chatbotHeader", "title"], code: "return <b className='text-red-500'>{props.title}</b>;" },
  send:   { path: ["chatbotTextField", "sendButton"], code: "return <button onClick={props.onSend} disabled={props.disabled}>Go</button>;" },
  old:    { path: ["sidebar", "footer"], clear: true },   // or code: null
}});
window.SendDataToChatbot({ config: { tree: { sidebar: { subcomponents: { footer: { code: "return null;" } } } } } }); // replace whole tree
window.SendDataToChatbot({ config: { reset: true } });     // remove all
```

Slice shape (`store/componentOverrides/componentOverridesSlice.ts`):

```ts
state.componentOverrides = { tree: Record<string, { code?: string; subcomponents?: Record<string, Node> }> }
// ["sidebar","header"] → tree.sidebar.subcomponents.header.code
```

`components/Interface-Chatbot/ChatbotDrawerParts/useComponentOverride.tsx:useComponentOverride` reads `code` at a path. It wraps the code as `(function(React, props){ <code> })`, compiles it with `@babel/standalone` (preset `react`), `eval`s it, and memoises the result per code string. A compile error logs `[componentOverride] compile failed` and falls back to the default UI. The override is rendered as a component, so `React.useState` and similar hooks work inside it. Each component passes its own props. For example, `chatbotHeader.title` gets `{ title, subtitle, chatIcon, isChatbotMinimized, lastMessage }`, `sendButton` gets `{ onSend, disabled, inputValue }`, and `emptyChatView` gets `{ ChatbotTextField }`. The full prop list per path is in the component inventory in the notes and in [components](../ui/components.md).

`app/layout.tsx` loads the Tailwind Play CDN so that Tailwind classes in override code that the build never saw still get CSS.

## Styling

- **Three systems at once.**
  - **Tailwind 3 + daisyUI 4** classes (`bg-base-100`, `btn`, `drawer`, `tooltip`, `collapse`, `prose` from `@tailwindcss/typography`) for layout and most surfaces.
  - **MUI 6** for `TextField`, `IconButton`, `Snackbar`, `Grid`, `LinearProgress`, and for colors read from `useTheme()`.
  - **Inline styles** for anything driven by a runtime color.
- **Primary color.** `components/AppWrapper.tsx` builds the MUI theme with `hoc/theme.js:generateTheme` and sets `data-theme` on `<html>`. In dark mode `getDarkModePrimary` raises the lightness of the host color (to between 55% and 75% HSL) so a dark brand color stays visible (c7ace0c). Chat UI reads it through `components/Chatbot/hooks/useColor.ts:useColor` (`backgroundColor` = `palette.primary.main`, plus a contrasting `textColor`). The user bubble, send button, scroll button and loading dot (`--primary-main`) all use it.
- **Dark mode.** `tailwind.config.ts` sets `darkMode: ["class", '[data-theme="dark"]']`, so `dark:` variants follow the same `data-theme` attribute as daisyUI. `CodeBlock` watches that attribute with a `MutationObserver` to switch between the `oneDark` and `oneLight` Prism themes. Components that hard-code light colors (`'#ffffff'`, `'#e5e7eb'`) branch on `theme.palette.mode`.
- **Host message styles.** `hooks/useDynamicMessageStyles.ts` (owned by [app-shell](./app-shell.md)) returns `{ containerBg, userBubbleBg, botBubbleBg, … textFieldBg, textFieldBorder, textFieldColor }`. Its values come from `UPDATE_MESSAGE_STYLES` window messages, which the GTWY handler posts when `SendDataToChatbot({ messageStyles })` arrives. Chat UI applies them as follows: `MessageList` uses `containerBg`, `ChatbotTextField` uses the three `textField*` keys, and `HumanOrBotMessageCard` uses the bubble keys. `UserMessageCard` and `AssistantMessageCard` **ignore** the bubble keys; they use the theme primary color.
- **daisyUI semantic colors in inline styles.** `ReviewPhaseAccordion` and the review pill write `oklch(var(--p) / 0.06)`, `oklch(var(--er))`, `oklch(var(--su))`, `oklch(var(--wa))` and `oklch(var(--b1))`. These are daisyUI 4 CSS variables.
- **Content inside `prose`.** Assistant content sits inside `prose dark:prose-invert`. Cards rendered inside it add `not-prose` (66f1103, #201) so the typography plugin does not restyle them.

## Gotchas

> [!WARNING]
> The combined-format branch in `Message.tsx` wins for any message with `content`. After abed550 (#236) added `|| message?.content`, a stored `role: "Human"`, `"Bot"` or `"voice_call"` record that has `content` renders as an **assistant** bubble, not through `HumanOrBotMessageCard` / `VoiceCallMessage`. The role switch only runs for content-less records. Check this before you add a new role.

> [!WARNING]
> The markdown component map (`code`, `a`, `ul`, `ol`, `li`, `table`, `thead`, `tr`, `th`, `td`) is copied in **three** places: the two `ReactMarkdown` calls in `AssistantMessage.tsx` and the one in `InterfaceMarkdown.tsx`. f82f54d (#250) had to add the table renderers to all three. The reasoning, review and working accordions use bare `ReactMarkdown` with no map. Every call passes `remarkGfm` only when `supportsLookbehind()` is true, because remark-gfm needs regex lookbehind, which some browsers (older Safari) lack (58780b2 "bug fix for remark-gfm plugin"). Without gfm, tables and strikethrough render as plain text.

> [!WARNING]
> react-markdown 10 no longer passes an `inline` prop to the `code` renderer. `CodeBlock` branches on `inline`, so it is always `undefined`, and inline backtick code also takes the block branch (header bar, copy button, highlighter).

> [!WARNING]
> `Sidebar` renders a second `ChatbotHeader`, `MessageList` and `ChatbotTextField` inside `drawer-content` (lg:hidden), on top of the ones `Chatbot.tsx` renders. CSS hides them, but they stay mounted. Both text fields bind the same `messageRef`, both listen for `setInput`, and both `AiServicesToSwitch` effects can dispatch. This copy came in with the abed550 refactor; the pre-refactor drawer had no such children.
> [!TODO] Needs a human: is the duplicate tree in `Sidebar` `drawer-content` intended (mobile layout) or a leftover of #236?

> [!WARNING]
> Override hooks must be called before any other hook that sits behind the `if (Override) return`. `SidebarHeader` calls `useTheme()` **after** its override early-return. When an override at `["sidebar","header"]` is added or cleared at runtime, the hook count changes and React throws. `components/Interface-Chatbot/ChatbotHeader.tsx:renderIconsByType` calls `useState` / `useEffect` inside a `switch` case of a plain function, so the `sectionDropdown` header button only works while the list of header buttons stays stable.

> [!WARNING]
> Override code is `eval`ed with full iframe privileges, so it can read the iframe's localStorage and session tokens. The `componentOverrides` slice is **not** in the redux-persist blacklist (`store/index.js`), so overrides survive reloads in `localStorage` (`persist:root`) until `{ config: { reset: true } }` arrives. It is excluded from cross-tab sync.

> [!WARNING]
> `useDynamicMessageStyles` holds its state per component instance, starting from `DEFAULT_STYLES`. A component that mounts **after** the `UPDATE_MESSAGE_STYLES` message arrived (a new bubble, a remounted text field) shows the defaults until the host sends styles again.

> [!WARNING]
> Classes such as `bg-base-50`, `dark:bg-base-700`, `dark:border-base-500`, `dark:bg-base-800/60` (planning cards, accordions, markdown tables) are not daisyUI colors. daisyUI 4 only defines `base-100`, `base-200`, `base-300` and `base-content`. These classes produce no CSS, so the dark-mode tints they intend do not apply.

> [!WARNING]
> `ImageWithFallback` picks the renderer from the URL extension only. A URL without a known extension shows a generic file icon even when it points to an image. Its download button posts `{ type: "downloadAttachment", data: { url } }` to `window.parent`. Only the `public/chat-widget*.js` loaders handle it; `public/chatbot.js` does not, so on a chatbot.js embed the download button does nothing.

- `sendMessage` ignores `silent: true`, which the planning actions pass. It is in `SendMessagePayloadType` but not destructured. Echo suppression comes from `skipUserEcho` plus the `PLAN_ANSWER_PREFIX_RE` filter.
- `PLAN_ANSWER_PREFIX_RE` sits at module scope on purpose. The Message.tsx comment says that the same regex literal inside a multi-line `const` made Turbopack emit `<invalid>` in the Edge SSR bundle.
- In `PlanningTasksCard`, `humanQueryMessage` and `queryMessage` are computed but never used. `humanQueryMessage` also reads answers with the wrong key (the task id instead of `<taskId>_0`). The real payload is built in `handleAction`.
- The header's New Chat writes `newChat: true`. Sidebar's writes `newChat: "true"`. Both are only checked for truthiness.
- `DefaultQuestions.tsx` is dead and broken: it references an undefined `resposne` and imports a CSS file that does not exist. Every import of it is commented out. `ThreadSidebar.tsx` and `ChatbotHeaderTab.tsx` render nothing useful.
- `HumanOrBotMessage` uses `dangerouslySetInnerHTML` with `linkify`, and for `pushNotification` it re-executes `<script>` tags. The content must come from a trusted source.

## Why it is built this way

- **Override system (12ff552, #247).** Customers wanted to restyle and replace header, input and message parts without a release. The PR added runtime JSX compilation, the Tailwind Play CDN (so arbitrary classes resolve), and `useDynamicMessageStyles` for colors. Each component checks its own path, so an override can be as narrow as `["chatbotTextField","sendButton"]`.
- **Planning UI.** It grew across #193–#221. Task reasoning came in #193, the error retry in #195/#196, `waiting_for_user` human queries in #198, review phases in #207, and the Planning/Fast menu was removed in b4993b8 (plan mode is now the default whenever `mode` is enabled). The answer echo is hidden, and its answers are parsed back out of `q1: …` text in history, because the backend stores the answer as a normal user message.
- **Copy uses `execCommand` inside the iframe.** In `CodeBlock`, `navigator.clipboard` is used only when `window.self === window.top`, because the Permissions Policy blocks the clipboard API inside cross-origin iframes.
- **HTML preview sandbox.** The preview iframe uses `sandbox="allow-scripts allow-modals"`, and an injected script cancels clicks on links and buttons and form submits, so preview HTML cannot navigate or crash the chat.

> [!TODO] Needs a human: should host `messageStyles` bubble colors also apply to `UserMessageCard` / `AssistantMessageCard`, or only to the legacy Human/Bot bubbles as now?

## Changing it safely

- **New message field.** Read it in `AssistantMessage.tsx`, and check the gate in `Message.tsx`: a record with only your new field and no `content`, `user` or `planning` renders nothing. Add it to the history converter in `utils/dataConvertWrappers/makeGenericDataFormatUtility.tsx` too, or reloaded threads lose it.
- **New markdown element.** Add the renderer to `MarkdownUtitily.tsx` and to all three component maps.
- **New overridable component.**
  1. Call `useComponentOverride([...path])` as the **first** hook.
  2. Keep every other hook above `if (Override) return <Override {...props} />`.
  3. Pass every prop a replacement needs, including callbacks.
  4. Record the path and props in the notes and the components doc.
- **Plan actions.** Keep the payloads in `handlePlanningAction` in step with `useSendMessage` in `components/Chatbot/hooks/useChatActions.ts`. `mode: "plan"` with `action` `approve`, `execute` or `respond`, or with `skipUserEcho` and no action, is treated as an inline plan request: no new bubble and no timeout timer.
- **daisyUI upgrade.** The `oklch(var(--p))` strings and the `drawer` / `collapse` / `tooltip` markup are daisyUI 4 specific. Search for `oklch(var(` before you bump to v5.
- **Check visually.** Run the iframe through the [widget-boot flow](../flows/widget-boot.md) in light and dark (`data-theme`), on a screen under 1024px (drawer overlay) and on a wide one. Test with plan mode on (`appInfo.mode` + `isStream`), and send `SendDataToChatbot({ config: {...} })` to try overrides. The `data-testid` attributes (`chatbot-send-button`, `chatbot-message-input`, `chatbot-user-message`, …) are what the tests select on. Keep them when you change markup.
