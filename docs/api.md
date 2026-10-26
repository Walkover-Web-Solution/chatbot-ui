---
covers: ["app/**/page.tsx", "app/chatbot/layout.tsx", "public/chatbot*.js", "public/rag-*.js", "config/api.ts", "config/ragApi.ts", "utils/interceptor.ts", "utils/emitEventsToParent/**", "hooks/GTWY/eventHandlers/embeddingScript/**"]
verified_at: c7ace0c
verified_on: 2026-10-20
---
# API (external surface)

This repo serves no backend routes. Its external surface has four parts:

1. **Pages** the Next.js app serves, mostly as iframe targets.
2. **Host-page JavaScript API**: script-tag attributes and `window.*` functions of the loaders in `public/`.
3. **postMessage protocol** between the host page and the iframe.
4. **Backend calls** the app and the loaders make to the GTWY Node backend, the GTWY Python backend and rtlayer.

Auth is the same everywhere: the raw token goes in the `Authorization` header, with no `Bearer` prefix. The loader gets the token from a login call. The iframe stores it in scoped sessionStorage (`interfaceToken` for chat, `ragToken` for RAG), and `utils/interceptor.ts` picks the header per URL. Env vars and the hard-coded per-environment hosts are in [environment](environment.md).

## Page routes

| Route | Runtime | Who loads it | Doc |
|---|---|---|---|
| `/chatbot?interfaceDetails=<urlencoded JSON>[&env=stage]` | edge | iframe created by `public/chatbot.js` | [app-shell](modules/app-shell.md#routes) |
| `/chatbot/[chatbotId]` | edge | client-side `router.replace` from `/chatbot`. A hard reload renders nothing | [app-shell](modules/app-shell.md#routes) |
| `/error?error=session expired` | default | the 401 redirect in `utils/interceptor.ts` | [app-shell](modules/app-shell.md) |
| `/rag` | default | iframe created by `public/rag-prod.js` | [rag-embed](modules/rag-embed.md) |
| `/chatbotpreview` | edge | unknown embedder | [rich-ui-renderer](modules/rich-ui-renderer.md#chatbotpreview) |
| `/` | default | nobody (Next boilerplate) | |

Static files in `public/` are served from the app origin too, so the loaders are fetched from the same host they point their iframe at (for example `https://chatbot.gtwy.ai/chatbot.js`). Route details and render trees: [ui/routes](ui/routes.md).

## Host-page API: `public/chatbot.js`

The production loader. `public/chatbot-dev.js` and `public/chatbot-local.js` are copies with other URLs ([environment](environment.md#loader-copies-and-their-hard-coded-hosts)). `public/chat-widget*.js` are legacy MSG91 Hello loaders whose messages the iframe no longer handles. Do not document new features against them ([embed-scripts](modules/embed-scripts.md#leftover-files)).

### Script tag attributes

The tag must have `id="chatbot-main-script"`. `ChatbotEmbedManager.extractScriptProps` reads a fixed list. Every value found is buffered and sent to the iframe as `interfaceData` after the handshake. `*` = `JSON.parse`d (on a parse error the raw string is sent).

| Attribute | Used by | Effect |
|---|---|---|
| `embedToken` | loader | Login with `Authorization: <embedToken>` |
| `interface_id` | loader | Anonymous login body `{isAnonymousUser: true, interface_id}` when there is no `embedToken`. Not in the forwarded list |
| `test_chatbot` | loader + iframe | `"true"`: no login call. `buildDemoChatbotDetails` returns `{chatbot_id: 'demo-chatbot', userId: 'demo-user', token: null, test_chatbot: true, config}` built from the `config` attribute. Demo answers come from `utils/demoChatbotData.ts` |
| `threadId`, `bridgeName`, `variables`* | iframe | Thread, agent slug, and variables sent with every message |
| `config`* | iframe (+ loader, see warning) | `themeColor`, `chatbotTitle`, `chatbotSubtitle`, `defaultMessage`, and component overrides (`reset`, `tree`, `<name>: {path, code}`) |
| `headerButtons`*, `eventsToSubscribe`*, `modalConfig`*, `mcpConfig`* | iframe | Header buttons, opt-in events (`MESSAGE_CLICK` only), model-switch config, MCP config |
| `allowModalSwitch`, `chatTitle`, `chatIcon`, `hideFullScreenButton`, `theme`, `mode`, `defaultMessage`, `defaultErrorMessage` | iframe | See the `interfaceData` field table below |
| `hideCloseButton` | iframe | Hides the header close button |
| `hideIcon` | loader | Hides the launcher `#interfaceEmbed` |
| `fullScreen` | loader | Adds `full-screen-interfaceEmbed` and sends `hideFullScreenButton` |
| `parentId` | loader | Mounts the container inside that element (else `#interface-chatbot`, else `<body>`) |
| `defaultOpen` | loader | `"true"`: opens the chat after the handshake |
| `interfaceId`, `onOpen`, `onClose`, `className`, `style`, `environment` | nobody | Forwarded, then ignored |
| `iconColor` | loader | Throws: `setPropValues` uses `AI_WHITE_ICON` / `AI_BLACK_ICON`, which are not defined |

The launcher layout (`type`, `width`, `height`, `side`, `buttonName`, `iconUrl`, ...) comes from the **login response** `data.config`. `processChatbotDetails` merges it over the defaults in the constructor.

> [!WARNING]
> The `config` attribute is not used for the first layout. After login, `updateProps(tempDataToSend)` replaces `props.config` with the attribute value. The `ResizeObserver` then calls `applyConfig(this.props.config)` on the next host resize of 600px or wider, so a page that sets layout keys in the attribute sees the layout jump on resize. Send layout changes with `SendDataToChatbot({config})`, which merges with the defaults.

### `window` functions

| Function | Effect |
|---|---|
| `SendDataToChatbot(obj \| JSON string)` | `parentId` moves the container. `hideCloseButton`, `hideIcon`, `iconColor`, `fullScreen` update the host props. Always posts `interfaceData` with the whole object. Also posts `askAi` if `obj.askAi` is truthy, and `setInput` if the `setInput` key is present. `config` is merged into the layout and applied. Also forwards `{type: 'data', data}` to `window.ReactNativeWebView` |
| `openChatbot()` / `Chatbot.open()` | Shows the container, hides the launcher, posts `open` to the iframe, to `window.parent` and to `ReactNativeWebView` |
| `closeChatbot()` / `Chatbot.close()` | Fades out, posts `close` to `window.parent` and `ReactNativeWebView`, shows the launcher again unless `hideIcon` |
| `Chatbot.show()` / `Chatbot.hide()` | Shows or hides the launcher only |
| `reloadChats()` / `Chatbot.reloadChats()` | Posts `refresh` |
| `askAi(text)` / `Chatbot.askAi(text)` | Posts `askAi` with a string |
| `setInput(text)` / `Chatbot.setInput(text)` | Posts `setInput`: fills the text box, does not send (c7ace0c) |
| `Chatbot.sendData(obj)` | Same as `SendDataToChatbot` |

`SendDataToChatbot` before the handshake only buffers. The buffer is flushed by `sendInitialData` on `interfaceLoaded`.

## Host-page API: `public/rag-prod.js`

The RAG knowledge-base embed. `public/rag-dev.js` and `public/rag-local.js` differ only in `this.urls`. Behaviour is described in [rag-embed](modules/rag-embed.md).

| Attribute on `<script id="rag-main-script">` | Effect |
|---|---|
| `embedToken` | `GET <login>` with `Authorization: <embedToken>`. The returned `data.token` is used for the document list and sent to the iframe |
| `parentId` | Embeds the form and list in that element instead of a modal |
| `theme` | `dark` switches the list styles. Also forwarded to the iframe |
| `defaultOpen` | Shows the document list after the first `INITIAL_CONFIG` |
| `hideIcon` | Only affects a `#ragInterfaceEmbed` element that the host itself creates |
| `chunkingType`, `hideConfig` | Read by the `/rag` form (default chunking strategy, hide the settings block) |
| `listPage`, `onOpen`, `onClose`, `className`, `config` | Forwarded in `INITIAL_CONFIG`, read by nothing |

| Global | Effect |
|---|---|
| `window.ragEmbed.{openRag, closeRag, showDocuments, closeDocuments, updateConfig, destroy}` | Public API object |
| `window.openRag`, `window.closeRag`, `window.showDocuments`, `window.closeDocuments`, `window.updateConfig`, `window.destroy` | The same functions as bare globals. They can overwrite host functions with the same names |
| `window.RagEmbedManager` | The `RagEmbedManager` instance |

> [!WARNING]
> `updateConfig` calls `sendInitialData`, which returns early once `iframe.dataset.initialDataSent` is `'true'`. After the first load, `updateConfig` changes host props only; the iframe never sees the new values.

## postMessage protocol

Every message in both directions is posted with target origin `"*"`. Only the chatbot loader checks `event.origin`, and only for iframe → host messages (`trustedOrigins` in `setupMessageListeners`: `http://localhost:3000`, the copy's own chatbot origin, and the host page's own origin). The iframe listeners and the RAG loader accept any sender.

> [!WARNING]
> Any frame that can reach the chatbot iframe can post `interfaceData`. Its `config.<name>.code` strings become component overrides that run as code inside the iframe ([chat-ui](modules/chat-ui.md)). Do not add more privileged fields to `interfaceData` without an origin check.

### `/chatbot`: host → iframe

| `type` | Payload | Sent by | Handled in |
|---|---|---|---|
| `interfaceData` | `data`: script attributes or the `SendDataToChatbot` object | `sendInitialData`, `processDataProperties`, `setPropValues` (fullScreen) | `hooks/GTWY/eventHandlers/embeddingScript/embeddingScriptEventHandler.ts` |
| `askAi` | `data`: a string, or `{askAi \| message, variables, threadId, bridgeName}` | `askAi()`, `SendDataToChatbot({askAi})` | `components/Chatbot/hooks/useChatEffects.ts`. A string is sent at once; an object after 500 ms. While a reply is loading, the user gets a toast instead |
| `setInput` | `data`: a string, or `{setInput \| message}` | `setInput()`, `SendDataToChatbot({setInput})` | `components/Interface-Chatbot/ChatbotTextField.tsx` |
| `refresh` | `{reload: true}` at the top level | `reloadChats()` | `useChatEffects`: reloads history |
| `open` | none | `openChatbot()` | `ChatbotTextField`: focuses the input |
| `UPDATE_MESSAGE_STYLES` | `styles` at the top level | the iframe to itself, when `interfaceData.messageStyles` is set | `hooks/useDynamicMessageStyles.ts` |

`interfaceData` fields (handler `useHandleGtwyEmbeddingScriptEvents`):

| Field | Effect |
|---|---|
| `theme` (`light`/`dark`/`system`) | Sets session theme. A message **without** `theme` removes the stored session theme |
| `threadId`, `bridgeName`, `version_id`, `stream`, `image_model`, `widget`, `mode`, `modelChanged`, `serviceChanged`, `hideCloseButton`, `hideFullScreenButton`, `mcpConfig`, `defaultErrorMessage`, `helloId` | `setDataInAppInfoReducer`. `version_id` is stored as `versionId`; `mode` becomes a boolean |
| `variables` (+ `bridgeName`) | `addDefaultContext`: per-agent variables |
| `themeColor`, `chatbotTitle`, `chatbotSubtitle`, `defaultMessage` (top level or in `config`) | `onConfigChange` in `app/chatbot/layout.tsx` |
| `allowModalSwitch`, `chatTitle`, `chatIcon`, `chatSubTitle`, `allowBridgeSwitch` | `setDataInInterfaceRedux` |
| `headerButtons` (array) | `setHeaderActionButtons` |
| `eventsToSubscribe` (array) | Filtered by `ALLOWED_EVENTS_TO_SUBSCRIBE`, then `setEventsSubsribedByParent` |
| `modalConfig` | `setModalConfig` |
| `messageStyles` | Re-posted to the iframe itself as `UPDATE_MESSAGE_STYLES` |
| `config.reset`, `config.tree`, `config.<name>` | Component overrides ([chat-ui](modules/chat-ui.md)) |

Where each field lands in Redux: [embed-scripts](modules/embed-scripts.md#messages-this-area-handles-or-sends).

### `/chatbot`: iframe → host

Events sent through `emitEventToParent` arrive as `{type, data}`. The ones marked "raw" are posted with `window.parent.postMessage` and have no `data`.

| `type` | `data` | Sender | Handled by `public/chatbot.js` |
|---|---|---|---|
| `interfaceLoaded` | raw | `components/Chatbot-Wrapper/ChatbotWrapper.tsx` on mount | yes: `sendInitialData` |
| `CLOSE_CHATBOT` | raw | header close, `app/error.tsx`, `app/error/page.tsx` | yes: `closeChatbot` |
| `ENTER_FULL_SCREEN_CHATBOT`, `EXIT_FULL_SCREEN_CHATBOT` | raw | header fullscreen toggle | yes: `toggleFullscreen` |
| `SESSION_EXPIRED` | raw | Reload button on `app/error/page.tsx` | yes: logs in again and sets a new iframe `src` |
| `MESSAGE_SENT` | message text | `components/Chatbot/hooks/useChatActions.ts` | no |
| `MESSAGE_RECEIVED` | `response.data` (stream `done`, rtlayer) or `{content}` (demo) | `useChatActions.ts`, `components/Chatbot/hooks/useRtlayerEventManager.tsx` | no |
| `MESSAGE_RECEIVED_WITH_ERROR` | One of: `{status}`; `{message, status, statusText, data}`; `{message_id, error}`, where `message_id` holds the whole SSE event; or the raw rtlayer error | `config/api.ts`, `useChatActions.ts`, `useRtlayerEventManager.tsx` | no |
| `TOOL_CALL_RESULT` | tool result content | `useChatActions.ts`, `useRtlayerEventManager.tsx` | no |
| `HEADER_BUTTON_PRESS` | the button item (+ `selectedOption`) | `components/Interface-Chatbot/ChatbotHeader.tsx` | no |
| `BRIDGE_SWITCH` | the selected agent object | `ChatbotHeader.tsx` | no |
| `MESSAGE_CLICK` | the message | `components/Interface-Chatbot/Messages/UserMessage.tsx`, only if subscribed | no |
| `FRONT_END_ACTION` | button payload: `action_data.data`, else `action_data`, else the payload | `components/richUI/components/ButtonComponent.js` | no |
| `PLANNING_ACTION` | `{action: 'execute' \| 'respond' \| 'update', plan?, task_id?, answer?, message?}` | `components/Interface-Chatbot/Messages/PlanningTasksCard.tsx` | no |
| `MINIMIZE_CHATBOT` | `null` | `ChatbotHeader.tsx` | no |
| `RELOAD_PARENT` | `null` | `hooks/CORE/eventHandlers/localStorage/localStorageEventsHandler.ts`, when localStorage is fully cleared | no |
| `downloadAttachment` | raw, `{url}` | `components/Interface-Chatbot/Messages/ImageWithFallback.tsx` | no |
| `setDataInLocal` | raw, `{key, payload}` | `utils/utilities.js:setLocalStorage`, which nothing calls | no |

`FRONT_END_ACTION` and `PLANNING_ACTION` exist for the customer's own `message` listener. No loader in `public/` handles them.
- `PLANNING_ACTION` is missing from the `ParentEventType` union in `utils/emitEventsToParent/emitEventsToParent.tsx`. It compiles only because `next.config.ts` ignores type errors.
- `PLANNING_ACTION` is never actually sent: `PlanningTasksCard` emits it only when it has no `onAction` prop, and `AssistantMessage.tsx` always passes one.
- The `ParentEventType` union also lists Hello-era types that nothing emits: `PUSH_NOTIFICATION`, `uuid`, `ENABLE_DOMAIN_TRACKING`, `SET_BADGE_COUNT`, `OPEN_CHATBOT`, `SHOW_STARTER_QUESTION`, `HIDE_STARTER_QUESTION`.

The loader also re-broadcasts `{type: 'open' | 'close', data: {}}` to its own `window.parent`, for pages that are themselves embedded.

### `/rag`: both directions

| Direction | `type` | Payload | Handler |
|---|---|---|---|
| host → iframe | `INITIAL_CONFIG` | `{...scriptAttrs, token, isEmbedded, timestamp}` | `app/rag/page.tsx` stores it, and writes `token` to sessionStorage `ragToken` |
| host → iframe | `OPEN_ADD_DOCUMENT` | `{action: 'add_new', token}` | resets the form |
| host → iframe | `EDIT_DOCUMENT` | `{action: 'edit', document, token, timestamp}` | fills the form for edit |
| host → iframe | `DELETE_DOCUMENT` | `{action: 'delete', document, token, timestamp}` | deletes `document._id` |
| iframe → host | `ragLoaded` | none | loader sends `INITIAL_CONFIG` once per iframe |
| iframe → host | `rag` | `{status: 'create' \| 'update' \| 'delete', data}` | success toast, list refresh (embedded or `defaultOpen` only) |
| iframe → host | `iframe-message-rag` | `{status: 'create' \| 'delete', error}` | error toast. Update failures also use `status: 'create'` |
| iframe → host | `closeRag` (`CLOSE_RAG` also accepted) | none | closes the modal |
| any → host | `OPEN_RAG`, `SHOW_DOCUMENT_LIST` | none | `openRag()`, `showDocumentList()` |
| loader → `window.parent` | `open`, `close` | `{data: {}}` | for wrapping pages |

`sendMessageToIframe` adds `token` and `timestamp` to `data` and posts after 500 ms. The loader drops a message identical to the previous one (`lastProcessedMessage`).

### `/chatbotpreview`: host → iframe

| `type` | Payload | Effect |
|---|---|---|
| `themeChange` | `themeColor` at the top level | `handleThemeChange(themeColor \|\| "#000000")`. The page sends nothing back |

## Backend calls

`{API}` = `NEXT_PUBLIC_API_BASE_URL` (GTWY Node backend) and `{PY}` = `NEXT_PUBLIC_PYTHON_API_BASE_URL` (GTWY Python backend). Both are baked into the client bundle at build time ([environment](environment.md#variables)). Axios calls go through `utils/interceptor.ts`, which sets `Authorization` like this:
- URL contains `rag` → `ragToken`.
- URL contains `image` → `ragToken` if set, else `interfaceToken`.
- Anything else → `interfaceToken`.

A 401 clears all localStorage and sends the iframe to `/error`. A call with no response is retried once.

| Function | Method + URL | Auth | Used by |
|---|---|---|---|
| `config/api.ts:streamDataToAction` | POST {PY}/chatbot/{chatBotId}/sendMessage (fetch, SSE) | `interfaceToken`, set by hand. No interceptor: no 401 redirect, no retry | `useChatActions.ts` `useSendMessage` (stream mode) |
| `config/api.ts:sendDataToAction` | POST {PY}/chatbot/{chatBotId}/sendMessage | interceptor | `useSendMessage` when `stream` is false. The reply arrives on rtlayer |
| `config/api.ts:uploadImage` | POST {PY}/image/processing/ or POST {PY}/image/processing/upload (`isVedioOrPdf`), multipart | interceptor (`image` rule) | `ChatbotTextField.tsx` (always the first form, PDFs included), `app/rag/page.tsx` |
| `config/api.ts:getPreviousMessage` | GET {API}/api/history/{threadId}/{bridgeName}?sub_thread_id=&pageNo=&limit= | interceptor | history load and paging in `useChatActions.ts`. One module-level `AbortController` cancels the previous call |
| `config/api.ts:getAllThreadsApi` | GET {API}/api/thread/{threadId}?slugName={bridgeName} | interceptor | `useChatActions.ts` (thread list) |
| `config/api.ts:getSubscribeChatbotDetailsApi` | POST {API}/api/chatbot/subscribe, body `{slugName, threadId?, helloId?, versionId?}` | interceptor | `useChatActions.ts` (agent capabilities) |
| `config/api.ts:getServiceModelsApi` | GET {API}/api/service/{service} | interceptor | `useChatActions.ts` (model switch) |
| `config/api.ts:sendFeedbackAction` | PUT {API}/api/v1/config/status/{feedbackStatus}, body `{message_id}` | interceptor | `useChatActions.ts` (thumbs up/down) |
| `config/ragApi.ts:createKnowledgeBaseEntry` | POST {API}/api/rag/resource | `ragToken` | `app/rag/page.tsx` |
| `config/ragApi.ts:updateKnowBaseData` | PUT {API}/api/rag/resource/{id} | `ragToken` | `app/rag/page.tsx` |
| `config/ragApi.ts:deleteKnowBaseData` | DELETE {API}/api/rag/resource/{id}, body `{id}` | `ragToken` | `app/rag/page.tsx` |
| `config/ragApi.ts:getAllKnowBaseData` | GET {API}/api/rag/resource | `ragToken` | unused (the loader fetches the list itself) |
| `config/api.ts:getEmebedToken` | GET {API}/api/rag/get-emebed-token | `ragToken` | imported by `app/rag/page.tsx`; the call is commented out |
| `public/chatbot.js:fetchChatbotDetails` | POST <db host>/api/chatbot/loginuser | `embedToken` header, or anonymous body | loader boot and `SESSION_EXPIRED`. Up to 4 attempts, 1 s apart, on network errors only |
| `public/rag-prod.js:authenticateUser` | GET <db host>/api/rag/embed/login | `embedToken` | RAG loader boot |
| `public/rag-prod.js:fetchDocuments` | GET <db host>/api/rag/resource | token from RAG login | document list |

`<db host>` is hard-coded per loader copy ([environment](environment.md#loader-copies-and-their-hard-coded-hosts)). The chat send payload and the SSE event list are in [ai-chat](modules/ai-chat.md#contracts).

Unused exports in `config/api.ts`, kept from older products. Nothing imports them:
- `getAllInterfaceApi`, `createInterfaceApi`, `updateInterfaceApi`, `updateInterfaceActionsApi`, `updateInterfaceDetailsApi`, `deleteInterfaceApi`, `getInterfaceByIdApi`, `deleteComponentOrGridApi`: interface builder CRUD under `{API}/projects/...`.
- `performChatAction` (POST `{PY}/chatbot/{id}/resetchat`), `loginUser` (POST `{API}/api/chatbot/login`), `createNewThreadApi` (POST `{API}/api/thread/`).
- `createScripts`, `sendMessage`, `allChats`, `getAccessToken`.
- `getHelloChatsApi`: a raw axios call to the phone91 Hello history API with localStorage `HelloAgentAuth`.
- `getTemplateFlowList`: a `fetch` to the viaSocket flow API.

`components/FormComponent.tsx` imports `@/config/helloApi`, which does not exist. Nothing renders that component.

### rtlayer (AI replies)

`components/Chatbot/hooks/useRtlayerEventManager.tsx:useWebSocketClient` creates one `rtlayer-client` connection per iframe. Its keys are hard-coded in that function; do not copy them into docs or other files. The listener channel is:

```ts
(chatSessionId + (threadId || userId) + (subThreadId || userId)).replace(/ /g, "_")
// chatSessionId = chatbot_id from interfaceDetails
```

The GTWY Python backend publishes non-stream replies, tool-call progress and sub-thread renames (`display_name`) on that channel, so the formula must match the backend's publish channel. Payload handling: [ai-chat](modules/ai-chat.md#receiving-over-rtlayer-usertlayereventmanager).

> [!TODO] Needs a human: where in the Python backend is the rtlayer channel built, and are the hard-coded rtlayer keys meant to be public?

### Other runtime hosts

The app also loads these at runtime:
- Tailwind Play CDN, from `app/layout.tsx`. Runtime Tailwind classes in component overrides depend on it.
- Cloudflare Images launcher icons, from `public/chatbot.js:makeImageUrl`.
- Two icon URLs in `components/Interface-Chatbot/Messages/HumanOrBotMessage.tsx` and `ImageWithFallback.tsx`.
