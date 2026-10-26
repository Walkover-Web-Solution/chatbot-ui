---
covers: ["store/**", "utils/ChatbotUtility.ts", "utils/utilities.js", "utils/embedNamespace.ts", "utils/deepCheckSelector.ts", "components/context.tsx", "components/AppWrapper.tsx"]
verified_at: c7ace0c
verified_on: 2026-10-20
---
# State

All client state is Redux Toolkit (`store/index.js`), plus three React contexts and a set of browser-storage keys. There is no React Query or SWR cache. This page is the map; the store wiring (middleware, persist config, cross-tab sync, session-key formats) is described once in [app-shell](../modules/app-shell.md#store).

## Server state

- API clients are plain axios functions in `config/api.ts` (GTWY Node and Python APIs) and `config/ragApi.ts` (knowledge base), all on the shared instance in `utils/interceptor.ts`. The full endpoint list is in [api](../api.md).
- Hooks in `components/Chatbot/hooks/` call them and dispatch the result into a slice (mostly `useChatActions.ts` and `useChatEffects.ts`, see [ai-chat](../modules/ai-chat.md)). Sagas exist but are empty (`store/interface/interfaceSaga.ts`).
- The streaming send uses raw `fetch`, not axios, so it bypasses the interceptor's auth header, 401 redirect and retry ([ai-message](../flows/ai-message.md)).
- Realtime: non-stream replies, thread renames and suggestions arrive over rtlayer (`components/Chatbot/hooks/useRtlayerEventManager.tsx`) and land in `Chat`.

## Client state

### Redux slices

| Slice | Keyed by | Persisted | Owner doc | Holds |
|---|---|---|---|---|
| `Chat` | sub-thread id inside the slice | no | [ai-chat](../modules/ai-chat.md) | messages per sub-thread, loading/streaming flags, options, starter questions, images |
| `appInfo` | composite `tabSessionId` | sessionStorage `persist:appInfo` <!-- verify:ignore --> | [app-shell](../modules/app-shell.md) | ids (`threadId`, `subThreadId`, `bridgeName`, `versionId`), embed config, `stream`/`vision`/`image_model`, `mode`, `defaultErrorMessage` |
| `Interface` | `<chatSessionId>_<composite tabSessionId>` | localStorage `persist:root` <!-- verify:ignore --> | [app-shell](../modules/app-shell.md) | model-switch config, header buttons, subscribed events, thread lists, rich-UI context |
| `subscribeData` | plain `chatSessionId` | localStorage `persist:root` <!-- verify:ignore --> | [app-shell](../modules/app-shell.md) | the subscribe API response (`mode`, `supportedServices`, `vision`, `stream`, …) |
| `componentOverrides` | not keyed (one tree) | localStorage `persist:root` <!-- verify:ignore --> | [chat-ui](../modules/chat-ui.md#component-overrides-12ff552-247) | the host-supplied override tree |
| `draftData` | not keyed | no | [app-shell](../modules/app-shell.md) | `chatSessionId`, raw `tabSessionId`, `chatbotId`, `isChatbotMinimized` |

> [!WARNING]
> Each slice uses a different key. `Interface` is stored under the long key (the chatbot id appears twice), but `ChatbotHeader` reads `chatTitle`, `chatSubTitle`, `chatIcon` and `allowBridgeSwitch` from `Interface[chatSessionId]`, which is never written. Check which key a value is written under before reading it.

### React contexts

| Context | File | Value |
|---|---|---|
| `ThemeContext` | `components/AppWrapper.tsx` | `themeColor`, `handleThemeChange`, `handleColorSchemeChange` |
| `ChatbotContext` | `components/context.tsx`, provided by `app/chatbot/layout.tsx` | `chatbotConfig`, `chatbot_id`, `userId`, `token`, `isTestChatbot`, `hideToolCall`, `onConfigChange`, `toggleHideCloseButton`, `environment` |
| `ChatContext` | `components/Chatbot-Wrapper/ChatbotWrapper.tsx` | `chatSessionId`, composite `tabSessionId`; read through `useChatContext` |
| `MessageContext` | `components/Interface-Chatbot/InterfaceChatbot.tsx` | `messageRef`, `timeoutIdRef` |

### Browser storage keys

sessionStorage keys go through `utils/ChatbotUtility.ts` (`SetSessionStorage`, `GetSessionStorageData`, `RemoveSessionStorage`), which prefixes them with `<chatbot_id>_<userId>_` via `utils/embedNamespace.ts:getScopedKey` so two embeds on one page do not collide. The redux-persist keys and localStorage keys are not scoped.

| Key | Storage | Written by | Read by | Purpose |
|---|---|---|---|---|
| `tab_session_id` | session (scoped) | `app/chatbot/page.tsx` | same | raw tab id, survives a reload |
| `interfaceToken` | session (scoped) | `app/chatbot/page.tsx` | `utils/interceptor.ts`, `config/api.ts` (stream) | embed JWT, sent raw as `Authorization` |
| `interfaceUserId` | session (scoped) | `app/chatbot/page.tsx` | nothing found | — |
| `ragToken` | session (scoped) | `app/rag/page.tsx` | `utils/interceptor.ts` (URLs with `rag` or `image`) | RAG embed token |
| `chatbotTheme` | session (scoped) | `components/AppWrapper.tsx`, `hooks/GTWY/eventHandlers/embeddingScript/embeddingScriptEventHandler.ts` | `components/AppWrapper.tsx`, `app/chatbot/layout.tsx` | `light`, `dark` or `system`; beats `config.theme` |
| `conversationMode` | session (scoped) | `components/Interface-Chatbot/ChatbotTextField.tsx` | nothing found | — |
| `persist:appInfo` <!-- verify:ignore --> | session | redux-persist | redux-persist | `appInfo` slice |
| `persist:root` <!-- verify:ignore --> | local | redux-persist | redux-persist | `Interface`, `componentOverrides`, `subscribeData` |
| `HelloAgentAuth` | local | `components/Chatbot/hooks/useChatActions.ts` | `config/api.ts` | `<helloId>:<uuid>` from the subscribe response |

Legacy keys that are read but never written in this repo: `helloConfig`, `widgetToken` (session) and `k_clientId`, `a_clientId` (local, only in the unused `hooks/coBrowser/CBManger.ts`).

> [!WARNING]
> A 401 from any axios call runs `localStorage.clear()` for the whole iframe origin. That wipes `persist:root` <!-- verify:ignore --> for every embed and tab, and other open tabs reset `draftData`/`appInfo` and post `RELOAD_PARENT` to their host. Details: [app-shell](../modules/app-shell.md#gotchas).

## Rules

- Read objects from the store with `utils/deepCheckSelector.ts:useCustomSelector` (deep-equal comparison). `useAppSelector` in `store/useTypedHooks.ts` exists but is unused.
- Dispatch per-session actions only after `draftData.chatSessionId` and `draftData.tabSessionId` are set. `store/index.js:customMiddleware` builds `urlData` at dispatch time, and an empty id writes to the wrong bucket or is dropped.
- A new slice must be added to `perEmbedSlices` in `store/index.js` (and to the persist blacklist if it must not persist). Otherwise its actions are broadcast to every same-origin iframe on `crossTabChannel`. That is how actions from one embed once fired API calls with another user's token (c7943ce).
- Use the `utils/ChatbotUtility.ts` helpers for sessionStorage, never raw `sessionStorage`, so keys stay scoped per embed (915dbb1).
- Several action creators exported by `store/interface/interfaceSlice.ts` and `setMessageTimeout` in `store/chat/chatSlice.ts` have no reducer and are `undefined`. Check that a reducer exists before dispatching an exported action.
