---
covers: ["public/chatbot.js", "public/chatbot-dev.js", "public/chatbot-local.js", "public/rag-*.js", "hooks/GTWY/eventHandlers/embeddingScript/embeddingScriptEventHandler.ts", "app/chatbot/layout.tsx", "types/appInfo/appInfoReduxType.ts", "types/interface/InterfaceReduxType.ts", "types/reduxCore.ts", "config/api.ts", "components/Chatbot/hooks/useChatActions.ts", "components/Chatbot/hooks/useChatEffects.ts", "components/Chatbot/hooks/useRtlayerEventManager.tsx", "store/chat/chatReducerV2.ts", "store/chat/chatSlice.ts", "store/interface/interfaceReducer.ts", "store/interface/interfaceSlice.ts", "store/index.js", "store/combineReducer.js", "utils/emitEventsToParent/emitEventsToParent.tsx", "utils/dataConvertWrappers/makeGenericDataFormatUtility.tsx", "components/Interface-Chatbot/Messages/AssistantMessage.tsx", "components/Interface-Chatbot/ChatbotTextField.tsx", "components/Interface-Chatbot/ChatbotHeader.tsx", "components/Interface-Chatbot/ChatbotDrawerParts/useComponentOverride.tsx", "components/Interface-Chatbot/Interface-Markdown/**", "components/richUI/componentRegistry.js"]
verified_at: c7ace0c
verified_on: 2026-10-20
---
# Recipes

Step-by-step for the changes this repo sees most often. Each recipe comes from real commits and was checked against the code at `c7ace0c`. The module docs explain how each part works; these recipes list which files to touch and in what order.

There is no test suite. `npm run build` does not type-check, because `next.config.ts` sets `typescript.ignoreBuildErrors`. For every recipe, run `npx tsc --noEmit` and `npm run lint`, then try the change in the browser via the [widget-boot flow](flows/widget-boot.md).

## Ship a change (branches)

Seen in the last 60 merged PRs: 36 target `testing` and 24 target `main`.

1. Branch off `testing` and open the PR against `testing`.
2. To reach `main`, open a second PR, usually from a sibling branch named `<branch>_main`. Examples: "side_pop_added_main" (#199) mirrors "side_add_in_popup" (#197), and "table_data_fix_main" (#249) mirrors "table_data_fix" (#250). Up to mid-June 2026 a whole `testing` → `main` PR was used instead (#234, #235). After it, `main` is merged back into `testing` (eb31987 "Merge branch 'main' into testing").
3. Hotfixes and reverts sometimes land on `main` only, like #242 and its revert #243, #244 and #245. Bring them back to `testing` with their own commit. `915dbb1` and `c7943ce` are the testing-side copies of #244 and #245.

> [!WARNING]
> `main` and `testing` hold the same changes under different SHAs (cherry-picked copies). At `c7ace0c`, `testing` has 164 commits that are not in `main`, and `main` has 15 that are not in `testing`. Those 15 are copies of `testing` work, plus #242 and its revert, plus `e0bf8d5` (whitespace only). Many `testing` features (test-chatbot mode #259, model switch #252, component overrides #247) are not on `main`. Before you assume a fix is live, diff the file on both branches (`git diff origin/testing origin/main -- <file>`), not the commit list.

> [!TODO] Needs a human: which branch deploys to `chatbot.gtwy.ai` and which to `dev-chatbot.gtwy.ai` (Cloudflare Pages via `build:pages`)? Is the `<branch>_main` mirror PR still the rule, or should `main` be synced from `testing` again?

## Change the host loader script
Example commits: `17cbf02` "feat: Add configurable side positioning support for popup chatbot widget (#199)", `48fe052` "add retires for loginUser api", `6adc601` (SESSION_EXPIRED relogin), `c7ace0c` (setInput).

1. Edit `public/chatbot.js`.
2. Make the same edit in `public/chatbot-dev.js` and `public/chatbot-local.js`. The three files are hand-kept copies with no build step. They differ only in `this.urls`, in the `trustedOrigins` entry for their own host, and in quote style ([embed-scripts](modules/embed-scripts.md#env-copies-and-drift)).
3. If the iframe has to react, add the receiving side in the iframe. See the next two recipes.
4. Check it: `diff public/chatbot.js public/chatbot-dev.js` must show only URL lines. Then load `public/chatbot-local.js` from a test page against `npm run dev -- -p 3001` (the origin the local copy expects).

The RAG embed follows the same rule: `public/rag-prod.js`, `public/rag-dev.js` and `public/rag-local.js` change together ([rag-embed](modules/rag-embed.md#env-copies)).

> [!WARNING]
> Forgetting a copy is the most common slip. `f2b4e80` "fix: mode added in dev also" exists only because `9c3932a` added the `mode` attribute to `public/chatbot.js` but not to `public/chatbot-dev.js`. A host that loads the dev script silently drops the attribute. Do not edit `public/chat-widget*.js`: those are MSG91 Hello loaders, and the iframe no longer handles their messages ([embed-scripts](modules/embed-scripts.md#leftover-files)).

## Add a host → iframe config option
Example commits: `61f149f` "feat: chatbot default error message (#230)", `9f5a370` "feat: mcp url and default message in chatbot done (#233)". `dc0ebf3` (#259) later moved `defaultMessage`.

A value can reach the iframe by two routes. Pick the one(s) you need:

| Source | Arrives as | Read in |
|---|---|---|
| Script-tag attribute or `SendDataToChatbot({...})` from the host page | `interfaceData` postMessage after `interfaceLoaded` | `hooks/GTWY/eventHandlers/embeddingScript/embeddingScriptEventHandler.ts:handleInterfaceData` |
| Chatbot config saved in GTWY (login API response `data.config`) | `interfaceDetails` URL parameter, once at boot | `app/chatbot/layout.tsx:ChatbotLayout` |

1. Script attribute: add the name to the `attributes` array in `public/chatbot.js:extractScriptProps`, in all three loader copies. If the value is JSON, also add it to the `JSON.parse` list right below. `SendDataToChatbot` forwards any key, so it needs no loader change.
2. Add the field to the `InterfaceData` interface and add an `if ('<key>' in receivedData)` branch in `handleInterfaceData`. Use `in`, not truthiness, so the host can send `false` or `""` to clear it.
3. Decide where the value lives, and type it:
   - per-session flags read by hooks → appInfo via `setDataInAppInfoReducer`, typed in `types/appInfo/appInfoReduxType.ts`
   - header and model-picker settings → Interface via `setDataInInterfaceRedux`, typed in `types/interface/InterfaceReduxType.ts`
   - display text and theme read by components → `ChatbotContext.chatbotConfig` via `onConfigChange`
4. Backend config: spread it from `config` in the `ChatbotLayout` effect, the same way `defaultErrorMessage` and `mcpConfig` are.
5. Read it with `useCustomSelector` keyed by the session ids ([app-shell](modules/app-shell.md#session-keys)), or from `ChatbotContext`.
6. Check it: send `window.SendDataToChatbot({ <key>: ... })` from the host console after the chatbot loads, and also set it as a script attribute.

> [!WARNING]
> The `config` key inside `interfaceData` is not general config. `handleInterfaceData` reads it as component overrides, where only entries with a `path` are used. Only `themeColor`, `chatbotTitle`, `chatbotSubtitle` and `defaultMessage` are lifted out of it into `onConfigChange`. Send a new option as a top-level key, not inside `config`. `defaultMessage` started in appInfo (`9f5a370`) and moved to `chatbotConfig` in `dc0ebf3`. `components/Chatbot/Chatbot.tsx` now reads it from context, so writing it to appInfo does nothing. Find where the consumer reads a value before you choose where to store it.

## Add a host → iframe command (window method)
Example commits: `f0e1b02` "handle events like askai, and reloadchats", `c7ace0c` "feat: add setInput support, …".

1. In all three loaders, expose the method in three places: `window.<name>`, `window.Chatbot.<name>`, and a `'<name>' in data` branch inside `window.SendDataToChatbot`. Each one calls `sendMessageToChatbot({ type: '<name>', data })`.
2. In the iframe, handle the `type` in the component that owns the state. `askAi` is handled in `components/Chatbot/hooks/useChatEffects.ts`. `setInput` is handled in `components/Interface-Chatbot/ChatbotTextField.tsx:handleMessage`.
3. Accept both payload shapes. The direct method sends a string, while `SendDataToChatbot` sends the whole object (see the comment in the `setInput` handler).
4. Add the message to the postMessage table in [api](api.md#postmessage-protocol).

## Add an iframe → host event
Example commits: `32fb416` "feat: add eevnt on the tool cal response (#237)", `06fd884` "feat: add MESSAGE_RECEIVED and MESSAGE_RECEIVED_WITH_ERROR events", `c78b1c4` (MESSAGE_SENT).

1. Add the name to `utils/emitEventsToParent/emitEventsToParent.tsx:ParentEventType`.
2. Call `emitEventToParent('<NAME>', data)` where the thing happens.
3. If the event is about an AI reply, emit it on **both** reply paths: the SSE `onEvent` switch in `components/Chatbot/hooks/useChatActions.ts:useSendMessage`, and `components/Chatbot/hooks/useRtlayerEventManager.tsx:handleMessageRTLayer`. `32fb416` adds `TOOL_CALL_RESULT` to both.
4. If the loader itself must act on it (close, fullscreen, relogin), add a `case` to `handleIncomingMessages` in all three loaders, like `SESSION_EXPIRED` in `6adc601`.
5. Add it to [api](api.md#postmessage-protocol) so host integrators know it exists.

> [!WARNING]
> A missing union member still builds, because type errors are ignored at build time. `PLANNING_ACTION` (`components/Interface-Chatbot/Messages/PlanningTasksCard.tsx`) is emitted today but is not in `ParentEventType`. `npx tsc --noEmit` catches this.

## Add a new AI stream event or message field
Example commits: `40290e6` "feat: Add review phase support with streaming reviewer analysis and response regeneration", `04d876f` "feat: image generation tool support (#227)", `7b7631b` (template_response).

1. Add the event to the `StreamEvent` union in `config/api.ts`.
2. Add a `case` to the `onEvent` switch in `useSendMessage`. Respect the local flags there (`isToolCallPending`, `isReviewStreaming`, the plan-execution flags) so text does not land in the wrong place.
3. New state: add a reducer to `store/chat/chatReducerV2.ts` (it acts on the newest message, index 0 of the sub-thread) and export the action from `store/chat/chatSlice.ts`. Do not edit `components/Chatbot/hooks/chatReducer.ts`: it is dead code left over from `2da4094`.
4. Render it in `components/Interface-Chatbot/Messages/AssistantMessage.tsx`, next to `ReasoningAccordion`, `PlanningTasksCard` and `ReviewPhaseAccordion`. Wrap cards inside the prose area in `not-prose` (66f1103).
5. If the field must survive a reload, map it from the history record in `utils/dataConvertWrappers/makeGenericDataFormatUtility.tsx`.
6. Non-stream bridges get replies over rtlayer instead. If the backend sends the event there too, add a branch to `handleMessageRTLayer`, above the catch-all `!!data` case.
7. Check it with a real streaming bridge, plus `utils/demoChatbotData.ts` (`getDemoResponse`) in test-chatbot mode for the rendering.

Details: [ai-chat](modules/ai-chat.md#sending-usesendmessage), [chat-ui](modules/chat-ui.md#assistantmessagecard-render-order).

## Add a backend (Node) API call
Example commits: `11f72dc` (#252) added `getServiceModelsApi`, and `abed550` (#236) reworked `getSubscribeChatbotDetailsApi`.

1. Add an `export async function` to `config/api.ts`. Use the `axios` imported from `utils/interceptor.ts` (it sets the auth header, sends 401 to `/error`, and retries once on a network error) and `URL` (`NEXT_PUBLIC_API_BASE_URL`). Catch errors and return `null` or the error, as the neighbouring functions do.
2. Call it from a hook in `components/Chatbot/hooks/useChatActions.ts`, and return early when `isTestChatbot` is true. Test mode has no token (`dc0ebf3`).
3. Store the result per session (next recipe) and add the route to [api](api.md#backend-calls).

> [!WARNING]
> The interceptor retries once when there is no response at all. That includes timeouts (`cea77f6`). Do not route a non-idempotent call through it if a duplicate would hurt, or set `_retry` on its config. `streamDataToAction` uses raw `fetch` and gets neither the retry nor the 401 redirect.

## Add per-session Redux state
Example commits: `11f72dc` (`setServiceModels` in Interface), `e43f526` (composite session key). Slices: `abed550` added `subscribeData` and `componentOverrides`, and `c7943ce` registered them for cross-tab sync.

1. Add a case reducer to the slice's reducer file (for example `store/interface/interfaceReducer.ts`). Read `action.urlData` and return early without `chatSessionId`/`tabSessionId`. Write to `` state[`${chatSessionId}_${tabSessionId}`] `` and create that entry from `initialState` if it is missing (copy `setServiceModels`).
2. Export the action from the slice file (`store/interface/interfaceSlice.ts`) and add the field to the type (`types/interface/InterfaceReduxType.ts`).
3. **New slice:**
   1. mount it in `store/combineReducer.js:rootReducer`
   2. add its name to `perEmbedSlices` in `store/index.js:crossTabSyncConfig`
   3. decide whether it belongs in the `rootPersistConfig` blacklist (otherwise it is persisted to localStorage)
   4. add it to `types/reduxCore.ts`

> [!WARNING]
> A slice missing from `perEmbedSlices` syncs over the BroadcastChannel to every other chatbot iframe of the same origin on the page. The other embed then fires API calls with its own user's token. `abed550` added two slices and missed this. `c7943ce` fixed it and left the explaining comment in `store/index.js`. Dispatching before `draftData.chatSessionId` and `tabSessionId` are set drops the write, because `urlData` is computed at dispatch time ([app-shell](modules/app-shell.md#store)).

## Change model-switch behaviour
Example commits: `11f72dc` "refactor: restructure AI service selection … (#252)", `46c4501` "fix: model change bugs (#258)".

1. The picker is `components/Interface-Chatbot/ChatbotHeader.tsx:AiServicesToSwitch`. It reads Interface `serviceModels` (from `getServiceModelsApi` in `useSubscribeChatbotDetails`), `modelVisibilityConfig`, `availableAiServicesToSwitch` and `modalConfig`.
2. Admin defaults come from backend `config.models`, `config.defaultModel` and `config.allowModalSwitch` (set in `ChatbotLayout`). The host overrides them with `allowModalSwitch`, `modelChanged` or `serviceChanged` through `handleInterfaceData`.
3. Keep the fallback chain: configured services → `serviceModels` → `modelVisibilityConfig`. `46c4501` added the last link because the picker was empty whenever the service-models fetch returned nothing.
4. Keep `data-testid="ai-service-switch-trigger"`.

Details: [ai-chat](modules/ai-chat.md#model-switch).

## Make a component overridable
Example commit: `12ff552` "feat: add component override system with dynamic styling support for chatbot customization (#247)". It made the header, text field, message list and message cards overridable in one change.

1. Call `useComponentOverride([...path])` (`components/Interface-Chatbot/ChatbotDrawerParts/useComponentOverride.tsx`) as the **first** hook of the component.
2. Keep every other hook above `if (Override) return <Override {...props} />`. Pass every prop and callback a replacement needs.
3. Document the path and props in [chat-ui](modules/chat-ui.md#changing-it-safely) and in the components doc.
4. Check it: `SendDataToChatbot({ config: { x: { path: [...], code: "return (<div/>);" } } })`.

## Add a richUI node type or markdown element
richUI example: `ce6f13e` "rich ui refactor". It created `components/richUI/componentRegistry.js` with 19 node types, and the registry has not changed since. Markdown examples: `860cfdb` (#200, lists and anchors) and `f82f54d` (#250, tables).

- **richUI node:** create `components/richUI/components/<Name>Component.js` and register it in `componentRegistry` under the exact, case-sensitive `type` string. A new `onAction` type must be handled in both `onAction` callbacks in `AssistantMessage.tsx`. Steps and guards: [rich-ui-renderer](modules/rich-ui-renderer.md#changing-it-safely).
- **Markdown element:** add the renderer to `components/Interface-Chatbot/Interface-Markdown/MarkdownUtitily.tsx`. Then add it to all three ReactMarkdown `components` maps: two in `AssistantMessage.tsx` and one in `components/Interface-Chatbot/Interface-Markdown/InterfaceMarkdown.tsx`. `f82f54d` had to touch all three.

> [!WARNING]
> There is no error boundary around messages. A richUI component that throws on malformed AI JSON replaces the whole chat with `app/error.tsx`. Guard every prop. Never render AI strings as HTML: `b8b7b7e` removed the raw-HTML branch that `dd99855` had added.
