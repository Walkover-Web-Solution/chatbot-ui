---
covers: ["app/layout.tsx", "app/page.tsx", "app/error.tsx", "app/error/**", "app/globals.css", "app/chatbot/**", "components/AppWrapper.tsx", "components/Chatbot-Wrapper/**", "components/context.tsx", "hoc/**", "store/index.js", "store/combineReducer.js", "store/rootSaga.ts", "store/useTypedHooks.ts", "store/appInfo/**", "store/draftData/**", "store/subscribeData/**", "store/interface/**", "utils/*.ts", "utils/*.js", "utils/*.tsx", "types/**", "hooks/*.ts", "hooks/*.js", "next.config.ts"]
verified_at: c7ace0c
verified_on: 2026-10-20
---
# App shell

The Next.js 15 App Router shell that the host page's iframe loads. It holds the routes, the provider stack (`components/AppWrapper.tsx`), the Redux store (persist, cross-tab sync, saga, and a middleware that stamps every action with session keys), theme handling, the session keys every slice is indexed by, the axios instance, and shared utilities. The chat itself renders inside it; see [ai-chat](ai-chat.md) and [chat-ui](chat-ui.md).

| File | Role |
|---|---|
| `app/layout.tsx` | Root layout (server component). `<html data-theme="light">`, Geist fonts, loads the Tailwind Play CDN script at runtime, wraps children in `AppWrapper`. Metadata is still the create-next-app default. |
| `app/page.tsx` | `/`: unmodified create-next-app landing page. Not used by the widget. |
| `app/error.tsx` | Route error boundary. "Try again" calls `reset()`; "Close" posts `{ type: "CLOSE_CHATBOT" }` to `window.parent`. |
| `app/error/page.tsx` | `/error`: session-expired page that the 401 handler navigates to. "Reload Page" posts `SESSION_EXPIRED` to the parent (or reloads when not framed); "Close" posts `CLOSE_CHATBOT`. |
| `app/globals.css` | Tailwind layers, `--background`/`--foreground`, body font overrides, `.message-card-backround` (sic) with a `html[data-theme='dark']` variant. |
| `app/chatbot/layout.tsx` | Parses `interfaceDetails` and `env` from the query string, writes identity/config into `appInfo` and `Interface`, applies theme, provides `ChatbotContext`. Wrapped in `addUrlDataHoc`. |
| `app/chatbot/page.tsx` | `/chatbot` (edge): creates the tab id, stores the token, then `router.replace` to `/chatbot/<chatbot_id>`. |
| `app/chatbot/[chatbotId]/page.tsx` | `/chatbot/[chatbotId]` (edge): renders `ChatbotWrapper`. The route param is never read. |
| `components/Chatbot-Wrapper/ChatbotWrapper.tsx` | Posts `interfaceLoaded` to the parent, provides `ChatContext` (`chatSessionId`, composite `tabSessionId`), mounts the embed-script and localStorage event hooks, renders `Chatbot` once `chatSessionId` is set. |
| `components/AppWrapper.tsx` | Redux `Provider` → `PersistGate` → MUI `ThemeProvider` → `ThemeContext`. Owns theme color and light/dark/system scheme. |
| `components/context.tsx` | `ChatbotContext` default value (the real value comes from the chatbot layout). |
| `hoc/addUrlDataHoc.tsx` | HOC that injects `chatSessionId`, composite `tabSessionId`, selected `appInfo` fields and `searchParams` as props. |
| `hoc/theme.js` | `generateTheme(colorHex, mode)`: MUI theme; in dark mode the primary color is lightened in HSL. |
| `store/index.js` | `configureStore`, `customMiddleware` (adds `action.urlData`), root persist config, redux-state-sync config, saga. Exports `store`, `persistor`, `initializeStore`, `getInfoParametersFromUrl`. |
| `store/combineReducer.js` | The six slices and the nested `appInfo` persist config. |
| `store/rootSaga.ts`, `store/interface/interfaceSaga.ts` | Root saga forks `InterfaceSaga`, which is an empty generator. No saga does any work today. |
| `store/useTypedHooks.ts` | `useAppDispatch` (used) and `useAppSelector` (unused; the repo uses `useCustomSelector`). |
| `store/appInfo/**`, `store/draftData/**`, `store/subscribeData/**`, `store/interface/**` | The small slices described under [Contracts](#contracts). |
| `types/reduxCore.ts`, `types/utility.ts`, `types/appInfo/appInfoReduxType.ts`, `types/interface/InterfaceReduxType.ts` | Slice types. `UrlDataType` still lists many legacy keys (`orgId`, `scriptId`, …) nothing sets. |
| `utils/interceptor.ts` | The shared axios instance used by `config/api.ts` and `config/ragApi.ts`: `Authorization` header, 401 redirect, 5xx toast, one retry on network errors. |
| `utils/ChatbotUtility.ts` | `SetSessionStorage` / `GetSessionStorageData` / `RemoveSessionStorage` (all scoped by `getScopedKey`), `isJSONString`, plus unused `perFormAction` and `toggleSidebar`. |
| `utils/utilities.js` | Cookie helpers (scoped), `setLocalStorage`/`getLocalStorage`/`removeFromLocalStorage` (prefixed by a `widgetToken` that nothing sets), `formatTime` (dayjs short relative locale), `generateNewId` (nanoid), `linkify`, `splitNumber`, `getCurrentEnvironment`. |
| `utils/storageUtility.ts` | `STORAGE_OPTIONS.local` / `.session` for redux-persist, and `createNoopStorage` for SSR. |
| `utils/deepCheckSelector.ts` | `useCustomSelector`: `useSelector` with a deep-equal comparator. Use it for selectors that return objects. |
| `utils/enums.ts` | `EmbedVerificationStatus`, `ParamsEnums` (field names for `addUrlDataHoc`), `ALLOWED_EVENTS_TO_SUBSCRIBE`, `DEFAULT_AI_SERVICE_MODALS`, `PAGE_SIZE`, `createRandomId`, KB section enums. |
| `utils/templateEngine.ts` | Double-brace path interpolation (e.g. `item[0].id` inside double braces): `resolvePath`, `interpolate`, `resolveNode`, `resolveAction` (used by richUI components, see [rich-ui-renderer](rich-ui-renderer.md)). |
| `utils/utility.ts` | `parseNestedJson`: recursively parses double-serialised JSON strings (used by the code block renderer). |
| `utils/themeUtility.js` | `isColorLight` (canvas-based, browser only). |
| `utils/appUtility.js`, `utils/router-utility.tsx` | `supportsLookbehind` (used by markdown renderers); `CustomSuspense` and `lazyWithPreload` are unused. |
| `hooks/useDynamicMessageStyles.ts` | Listens for `UPDATE_MESSAGE_STYLES` window messages and defines `window.updateMessageStyles` at module load. |
| `hooks/useTimeUpdate.js` | Re-render tick (default 60 s) for relative timestamps. |
| `next.config.ts` | `reactStrictMode: false`, any-host remote images, ESLint and TypeScript errors ignored during build. |

`utils/errorFormatter.ts` and `utils/demoChatbotData.ts` belong to [ai-chat](ai-chat.md); `utils/embedNamespace.ts` belongs to [embed-scripts](embed-scripts.md).

## How it works

### Routes

| Route | Runtime | Renders |
|---|---|---|
| `/` | default | Next boilerplate. Unused. |
| `/chatbot` | edge | `InterfaceEmbed` in `app/chatbot/page.tsx`: spinner until verified, then redirect. The loader sets `iframe.src` to `<origin>/chatbot?interfaceDetails=<urlencoded JSON>` (see [embed-scripts](embed-scripts.md)). |
| `/chatbot/[chatbotId]` | edge | `ChatbotWrapper` → `Chatbot`. |
| `/error` | default | Session-expired / generic error card. |
| `/chatbotpreview` | edge | See [rich-ui-renderer](rich-ui-renderer.md). |
| `/rag` | default | See [rag-embed](rag-embed.md). |

`runtime = 'edge'` is there because the app deploys to Cloudflare Pages through `@cloudflare/next-on-pages` (the `build:pages` script in `package.json`), which needs dynamic routes on the edge runtime. Both `/chatbot` routes share `app/chatbot/layout.tsx`. Full route list: [ui/routes](../ui/routes.md). Boot end to end: [widget-boot](../flows/widget-boot.md).

### Boot inside the iframe

1. `app/chatbot/layout.tsx:ChatbotLayout` parses `interfaceDetails` once (`useMemo` with empty deps). Missing, the string `"undefined"`, or invalid JSON all give `{ chatbot_id: null, userId: null, token: null, config: null, test_chatbot: false }`. `?env=stage` sets `environment: 'stage'`; any other value gives `null`.
2. `app/chatbot/page.tsx:InterfaceEmbed` (a child, so its effects run first) creates the tab id (see [Session keys](#session-keys)) and dispatches `setDataInDraftReducer({ tabSessionId })`.
3. If `token` is present it stores sessionStorage `interfaceToken` and `interfaceUserId` and marks the embed `VERIFIED`. With no token but `test_chatbot`, it stores only `interfaceUserId` and is `VERIFIED` too.
4. Once verified with a `chatbot_id`, it dispatches `setDataInDraftReducer({ chatbotId, chatSessionId: chatbot_id })` and calls `router.replace('/chatbot/<chatbot_id>')`. The layout stays mounted, so the parsed query values survive the URL change.
5. The layout effect (deps include `chatSessionId`) dispatches `setDataInAppInfoReducer({ chatBotId, userId, config, isTestChatbot, defaultErrorMessage?, mcpConfig? })`, and, if `config` has `allowModalSwitch`, `models` or `defaultModel`, `setDataInInterfaceRedux({ allowModalSwitch, modelVisibilityConfig, adminDefaultAiServiceAndModal })`.
6. `config` also goes through `onConfigChange` (theme color, scheme, merged into `chatbotConfig` in context).
7. `ChatbotWrapper` posts `{ type: "interfaceLoaded" }` to `window.parent` in a `setTimeout(0)`. The host then sends `interfaceData` (handled in `hooks/GTWY/eventHandlers/embeddingScript/embeddingScriptEventHandler.ts`, see [embed-scripts](embed-scripts.md)).

`ChatbotContext` value (from the layout):

```ts
{ chatbotConfig, chatbot_id, userId, token, themeColor, onConfigChange, toggleHideCloseButton,
  isTestChatbot: !!test_chatbot, environment /* 'stage' | null */, hideToolCall: !!chatbotConfig.hide_tool }
```

`interfaceDetails` as the layout reads it (the loader builds it; other keys are ignored here):

```json
{ "chatbot_id": "…", "userId": "…", "token": "<embed JWT>", "test_chatbot": false,
  "config": { "themeColor": "#…", "theme": "light|dark|system", "hideCloseButton": true, "hide_tool": false,
              "defaultErrorMessage": "…", "mcpConfig": [{ "name": "…", "url": "…" }],
              "allowModalSwitch": true, "models": { "openai": { "gpt-4o": { "hide": true } } },
              "defaultModel": { "service": "openai", "modal": "gpt-4o" } } }
```

### Session keys

Every per-session slice is indexed by ids derived from `draftData`:

| Name | Value | Set in | Why |
|---|---|---|---|
| `chatSessionId` | the `chatbot_id` | `app/chatbot/page.tsx` via `setDataInDraftReducer` | One chat session per chatbot embed. |
| raw tab id (`draftData.tabSessionId`) | `${Date.now()}_${random7}` | `app/chatbot/page.tsx`, kept in sessionStorage `tab_session_id` | Survives a reload of the same tab; differs per tab. |
| `tabSessionId` (composite) | `${chatSessionId}_${rawTabId}` | `hoc/addUrlDataHoc.tsx:addUrlDataHoc` and `store/index.js:getInfoParametersFromUrl` | Two embeds or two tabs never share `appInfo` state. |
| `urlData` | `{ chatSessionId, tabSessionId: composite, ...appInfo[composite] }` | `store/index.js:customMiddleware` on every action | Reducers find their bucket without the caller passing ids. |

New tabs announce their id on the `BroadcastChannel` named `tab_session_sync` with `{ type: 'claim', id }`. A tab that receives a claim for its own id generates a new one and re-announces. A tab that found an existing id in sessionStorage (a reload) does not announce. This replaced a plain `Date.now()` id that collided when two tabs opened in the same millisecond (commit e43f526).

`addUrlDataHoc(Component, paramsToInject)` passes `chatSessionId`, the composite `tabSessionId`, `searchParams`, and each name in `paramsToInject` read from `useTabData` (`threadId`, `bridgeName`, `subThreadId`, `userId`, `config`, `currentChannelId`, `currentChatId`, `currentTeamId`; use `ParamsEnums` for the names).

### Store

- Slices (`store/combineReducer.js`): `Interface`, `Chat` ([ai-chat](ai-chat.md)), `draftData`, `appInfo`, `componentOverrides` ([chat-ui](chat-ui.md)), `subscribeData`.
- Middleware order: RTK defaults with `serializableCheck: false` → `customMiddleware` → saga → `createStateSyncMiddleware` (client only). `initMessageListener(store)` runs on the client.
- Persistence:

| Persist key | Storage | Contents |
|---|---|---|
| `persist:root` (key `root`, version 1) <!-- verify:ignore --> | localStorage | everything except the blacklist `appInfo`, `draftData`, `Chat` → in practice `Interface`, `componentOverrides`, `subscribeData` |
| `persist:appInfo` (key `appInfo`, version 1) <!-- verify:ignore --> | sessionStorage | the whole `appInfo` slice (nested `persistReducer`) |

  `draftData` and `Chat` are not persisted. On the server both storages are `createNoopStorage()`.
- Cross-tab sync (`crossTabSyncConfig`, channel `crossTabChannel`): the predicate drops redux-persist actions, `Hello/setUnReadCount` increments, and every action whose type prefix is in `perEmbedSlices` (`appInfo`, `draftData`, `Chat`, `Hello`, `Interface`, `subscribeData`, `componentOverrides`). That list covers every slice in the store, so no action is broadcast today. The middleware and listener are still wired; an action from a new slice would sync unless its prefix is added there.
- Sagas: `rootSaga` → `InterfaceSaga`, which is empty. Async work lives in hooks (`components/Chatbot/hooks/useChatActions.ts`).

### Theme

`AppWrapper` keeps `themeColor` and `colorScheme` and builds the MUI theme with `generateTheme`. It also sets `data-theme` on `<html>`, which DaisyUI and Tailwind (`darkMode: ["class", '[data-theme="dark"]']`) use. Priority, highest first:

1. sessionStorage `chatbotTheme` (`light`/`dark`/`system`). Read on mount by `AppWrapper` (light/dark only) and by the chatbot layout (all three). `config.theme` is applied only when this key is empty.
2. `config.theme` from `interfaceDetails`, through `onConfigChange`.
3. The OS `prefers-color-scheme`, tracked live until a manual `light`/`dark` is chosen (`manualSchemeOverride`).

`handleColorSchemeChange(scheme)` always writes `chatbotTheme`. The `interfaceData` handler writes it when the message has a valid `theme` and removes it when the message has no `theme` key. Theme color: initial `helloConfig.primary_color` from sessionStorage (legacy, nothing writes it now) or `#333333`; then `onConfigChange` sets `config.themeColor || "#000000"`. Dark mode keeps the hue and raises lightness to 55–75% and saturation to at least 45% (`hoc/theme.js`), so brand colors stay recognisable instead of washing to white.

### HTTP client

`utils/interceptor.ts` exports one axios instance:

- Request: URL containing `rag` → `Authorization: <ragToken>`; containing `image` → `ragToken` if set, else `interfaceToken`; anything else → `interfaceToken`. Tokens come from scoped sessionStorage. The header is the raw token, no `Bearer`.
- Response 401: `removeCookie(getCurrentEnvironment())`, `localStorage.clear()`, then `window.location.href = /error?error=session+expired` (the iframe navigates itself to the error page).
- Response ≥ 500: `errorToast("Server Error, Try again later")`, then rejects.
- No response and not yet retried: sets `config._retry = true` and re-sends once (commit cea77f6: the connection drops after the UI sits idle). A second failure gets `isNetworkError = true` and a fallback message.

The streaming send in `config/api.ts:streamDataToAction` uses `fetch`, not this instance, so none of the above applies to it.

## Contracts

`draftData` (not persisted, never synced):

```ts
{ chatSessionId: string   // = chatbot_id, app/chatbot/page.tsx
  tabSessionId: string    // raw tab id, app/chatbot/page.tsx
  chatbotId: string       // app/chatbot/page.tsx
  widgetToken: string     // never set
  isChatbotMinimized: boolean } // ChatbotHeader minimise button
// resetDraftDataReducer: on a full localStorage clear seen from another document (storage event, key null)
```

`appInfo[compositeTabSessionId]` (sessionStorage-persisted). `setDataInAppInfoReducer` shallow-merges the payload; it is a no-op when `urlData.tabSessionId` is missing.

```ts
{ chatBotId, userId, config, isTestChatbot, defaultErrorMessage?, mcpConfig?   // app/chatbot/layout.tsx
  threadId, helloId, versionId, bridgeName, modelChanged, serviceChanged,
  stream, image_model, widget, mode, hideCloseButton, hideFullScreenButton      // interfaceData handler
  stream, isStream, files, vision, image_model, supportedServices, helloId      // useSubscribeChatbotDetails
  threadId, subThreadId                                                          // test mode: demo-thread-<id>
  subThreadId                    // Sidebar / ChatbotHeader, and the setThreads extra-reducer
  bridgeName }                   // ChatbotHeader bridge switch
// typed but never written: currentChannelId, currentChatId, currentTeamId, isChatbotOpen, callToken
```

The `setThreads` extra-reducer in `store/appInfo/appInfoSlice.ts` picks `subThreadId`: `newThreadData.sub_thread_id` if given; else `threadId` when the list is empty; else keep the current one if it is in the list; else the first sub-thread if `threadId` is a main thread in the list, otherwise `threadId` itself.

`Interface[`${chatSessionId}_${compositeTabSessionId}`]` (localStorage-persisted). Every reducer in `store/interface/interfaceReducer.ts` builds this key from `urlData`, so the stored key is `<chatbotId>_<chatbotId>_<rawTabId>`. Readers write `${chatSessionId}_${tabSessionId}` with the composite id from `addUrlDataHoc`, so the two match.

```ts
{ allowModalSwitch?, modelVisibilityConfig?, adminDefaultAiServiceAndModal?  // layout + interfaceData (setDataInInterfaceRedux)
  chatTitle?, chatSubTitle?, chatIcon?, allowBridgeSwitch?                   // interfaceData (setDataInInterfaceRedux)
  headerButtons?: [{ type: 'history' | 'setting' }]                          // setHeaderActionButtons
  eventsSubscribedByParent?: ('MESSAGE_CLICK' | 'USER_TYPING')[]             // setEventsSubsribedByParent
  modalConfig?, availableAiServicesToSwitch?, selectedAiServiceAndModal?: { service, modal }
  serviceModels?: { [service]: { [modelType]: string[] } }                   // merged, useSubscribeChatbotDetails
  interfaceContext: { [bridgeName]: { variables, threadList: { [threadId]: Thread[] } },
                      context?: { [gridId_msgId]: { [componentId]: value } } }  // addInterfaceContext (richUI forms)
  isLoading, interfaceData, currentSelectedComponent }                       // initialState copy
```

`setThreads` replaces `threadList[threadId]` with the fetched list (adding a placeholder `{ thread_id, sub_thread_id, display_name }` = `threadId` when empty), replaces the first entry when `newThreadData.sub_thread_id` matches it, or unshifts `newThreadData`. `bridgeName` defaults to `urlData.bridgeName` then `"root"`; `threadId` defaults to `urlData.threadId`.

`subscribeData[chatSessionId]` (localStorage-persisted, keyed by the plain `chatSessionId`):

```ts
{ mode, supportedServices, vision, stream, isStream, image_model, showWidgetForm: true, isLoading: false,
  clientInfo }   // setSubscribeChatbotDetailsInChatSession (from the subscribe API response)
// setSubscribeClientInfo merges payload.clientInfo; setSubscribeKeysData shallow-merges (FormComponent sets showWidgetForm: false)
```

`mode` may be an array or a comma string; `stream` = `"stream"` in modes or `stream`/`isStream` true; `image_model` = `"files"` in modes or `image_model` true.

Storage keys: see [ui/state](../ui/state.md). All sessionStorage keys and cookies go through `getScopedKey`, which prefixes `<chatbot_id>_<userId>_` when `interfaceDetails` is in the first URL the module sees.

## Gotchas

> [!WARNING]
> Never dispatch a per-session action before `draftData.chatSessionId` and `tabSessionId` exist. `customMiddleware` builds `urlData` at dispatch time; with empty ids, `appInfo` writes land under `_<rawTabId>` and `Interface` reducers return early. The chatbot layout effect re-runs on `chatSessionId` for exactly this reason, so the first `appInfo` write goes to a stray `_<rawTabId>` key and the second to the right one.

> [!WARNING]
> `ChatbotHeader` reads `chatTitle`, `chatSubTitle`, `chatIcon` and `allowBridgeSwitch` from `state.Interface[chatSessionId]` (plain id), but `setDataInInterfaceRedux` writes them under the `<chatbotId>_<chatbotId>_<rawTabId>` key. At c7ace0c nothing writes the plain key, so these four `interfaceData` props look like they have no effect on the header. Check in a browser before relying on them, and fix the read or write side, not both.

> [!WARNING]
> A 401 from any axios call runs `localStorage.clear()` for the whole iframe origin. That wipes `persist:root` <!-- verify:ignore --> and the localStorage of every other embed and tab on the same origin. Other same-origin documents receive a `storage` event with `key === null`, reset `draftData` and `appInfo`, and emit `RELOAD_PARENT` (`hooks/CORE/eventHandlers/localStorage/localStorageEventsHandler.ts`).

> [!WARNING]
> The 401 handler calls `removeCookie(getCurrentEnvironment())`, and `getCurrentEnvironment` returns `process.env.REACT_APP_API_ENVIRONMENT`. Next.js only inlines `NEXT_PUBLIC_*` vars into client code, so this is `undefined` in the browser and the cookie removal targets a cookie named `undefined`.

> [!WARNING]
> The network-error retry checks only "no response". Axios timeouts and aborted requests (the history fetch in `config/api.ts:getPreviousMessage` aborts the previous one) also have no response, so they go through the retry path once. An aborted request fails again at once because its signal is still aborted. The comment "Do NOT retry on timeout" is not what the code does.

> [!WARNING]
> `/chatbot/[chatbotId]` only works when reached by client navigation from `/chatbot`. A hard reload at `/chatbot/<id>` has no `interfaceDetails`, so the layout gets `chatbot_id: null`, `draftData` (not persisted) has no `chatSessionId`, `ChatbotWithHooks` renders `null`, and `getScopedKey` falls back to unscoped keys.

> [!WARNING]
> `/chatbot` with no token and no `test_chatbot` spins forever: nothing sets `EmbedVerificationStatus.NOT_VERIFIED`.

> [!WARNING]
> `next.config.ts` sets `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds`. `npm run build` passes with type errors and lint errors, so a green build proves nothing about types. Run `npx tsc --noEmit` and `npm run lint` yourself.

> [!WARNING]
> redux-persist keys are not scoped per embed, and every tab writes its whole `root` state to the same localStorage key. The last tab to write wins, and `Interface` entries keyed by old tab ids pile up until something clears localStorage. A duplicated browser tab copies sessionStorage, so it starts with the same `tab_session_id` and, being treated as a reload, never broadcasts a claim.

- The `env=stage` value reaches `ChatbotContext.environment` but nothing reads it any more; its consumers (Hello socket and API) were removed in abed550.
- `app/layout.tsx` loads `https://cdn.tailwindcss.com` at runtime so component overrides (commit 12ff552) can use any Tailwind class that the build did not generate.
- The request interceptor's error handler does `Promise.reject(error)` without `return`, so a request-setup error resolves to `undefined` instead of rejecting.
- `hooks/useDynamicMessageStyles.ts` assigns `window.updateMessageStyles` as a side effect of being imported.

## Why it is built this way

- **Composite tab key.** Multi-widget support (ae38c28, 7da2ee3) moved tab ids from a persisted tabInfo slice (since deleted) into the non-persisted `draftData`, and e43f526 made reducers key by chatSessionId + "_" + tabSessionId so two embeds in one tab and two tabs of one embed never share state.
- **Cross-tab sync is effectively off.** Several iframes from the same origin on one host page share `BroadcastChannel`s. When one embed's actions reached another, the receiver fired API calls with its own auth token, which produced duplicate requests with the wrong user's token (comment in `store/index.js`, commit c7943ce). The fix excluded every per-embed slice. Before that, `Interface` was added to and then removed from the persist blacklist and the sync exclusion (02dcbd8, 6f6550a, 0148457).
- **Scoped storage keys.** Same reason: sessionStorage and cookies are shared by same-origin iframes in one tab, so `getScopedKey` prefixes them per chatbot+user (915dbb1).
- **Session theme wins.** The host can change the theme at runtime via `interfaceData`; storing it in sessionStorage keeps it across iframe reloads and stops the initial `config.theme` from overriding it (7f66df6).
- **One retry on network errors only.** Idle connections drop; AI calls can legitimately take 2–3 minutes, so timeouts and 5xx are deliberately not retried (comment in `utils/interceptor.ts`, cea77f6).
- **Session-expired page.** 6adc601 changed the 401 redirect from `/` to `/error?error=session+expired`, whose button asks the host to log in again (`SESSION_EXPIRED`).

> [!TODO] Needs a human: why are TypeScript and ESLint errors ignored in builds (`next.config.ts`, since 6bad1e6), and is there a CI step that type-checks instead?

## Changing it safely

- New per-session state: add it to an existing slice keyed through `urlData`, and add the slice name to `perEmbedSlices` in `store/index.js`. Otherwise its actions broadcast to every same-origin iframe and tab.
- New persisted slice: decide localStorage (`root`, shared across tabs) or sessionStorage (a nested `persistReducer` like `appInfo`). Add non-persisted slices to `rootPersistConfig.blacklist`.
- Reading `Interface`: use `` `${chatSessionId}_${tabSessionId}` `` with the props from `addUrlDataHoc`. Reading `appInfo`: `state.appInfo[tabSessionId]` with the same composite id. Reading `subscribeData`: the plain `chatSessionId`.
- New sessionStorage key: always go through `SetSessionStorage`/`GetSessionStorageData` so it is scoped, and list it in [ui/state](../ui/state.md).
- New `interfaceDetails.config` field: read it in `app/chatbot/layout.tsx` and dispatch it there; the loader's whitelist of config keys lives in `public/chatbot.js` ([embed-scripts](embed-scripts.md)).
- Check a change in the browser with two embeds of different chatbots on one page and with two tabs open: state, tokens and theme must stay separate.
