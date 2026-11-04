---
covers: ["public/chatbot*.js", "public/chat-widget*.js", "public/urlMonitor.js", "public/chatbot-style.css", "public/chat-widget-style.css", "public/loader.html", "hooks/CORE/**", "hooks/GTWY/**", "hooks/coBrowser/**", "utils/emitEventsToParent/**", "utils/embedNamespace.ts"]
verified_at: c7ace0c
verified_on: 2026-10-20
---
# Embed scripts and the host ↔ iframe protocol

A customer page loads `public/chatbot.js` (or its `-dev` / `-local` copy). The script draws a launcher button, logs in against the GTWY backend, and mounts an iframe that points at this app's `/chatbot` route. After that, the host page and the iframe talk only through `window.postMessage`. Inside the iframe, `hooks/CORE/` and `hooks/GTWY/` turn host messages into Redux and context updates, and `utils/emitEventsToParent/emitEventsToParent.tsx:emitEventToParent` sends events back to the host.

| File | Role |
|---|---|
| `public/chatbot.js` | Production GTWY loader: `ChatbotEmbedManager` class, the `window.*` API and the host-side message listener |
| `public/chatbot-dev.js`, `public/chatbot-local.js` | Hand-maintained copies of the loader. They differ only in their URLs (see [Env copies](#env-copies-and-drift)) |
| `public/chatbot-style.css` | Launcher and container styles, loaded by the script from `<origin>/chatbot-style.css`. Holds one class pair per `config.type` |
| `public/chat-widget.js`, `public/chat-widget-dev.js`, `public/chat-widget-local.js`, `public/chat-widget-prodtesing.js` | MSG91 Hello widget loaders. **Leftovers**: the iframe no longer handles their Hello messages (see [Leftover files](#leftover-files)) |
| `public/chat-widget-style.css`, `public/urlMonitor.js` | Stylesheet and the "open these URLs in a side iframe" helper. Only the Hello loaders load them |
| `public/loader.html` | Static "Loading..." spinner page. Nothing in the repo references it |
| `hooks/CORE/eventHandlers/embeddingScript/embeddingScriptEventHandler.ts` | `useEmbeddingScriptEventHandler`: one `message` listener plus a registry that maps a message `type` to its handler |
| `hooks/GTWY/eventHandlers/embeddingScript/embeddingScriptEventHandler.ts` | Registers the single `interfaceData` handler and maps every field to a Redux action or context call |
| `hooks/CORE/eventHandlers/localStorage/localStorageEventsHandler.ts` | `useLocalStorageEventHandler`: when localStorage is fully cleared, it resets the draftData and appInfo slices and emits `RELOAD_PARENT` |
| `utils/emitEventsToParent/emitEventsToParent.tsx` | `emitEventToParent(type, data)` and the `ParentEventType` union |
| `utils/embedNamespace.ts` | `getScopedKey`: prefixes sessionStorage and cookie keys with `<chatbot_id>_<userId>_` |
| `hooks/coBrowser/CBManger.ts` | Cobrowse.io injector for the iframe. **Dead code**: nothing has imported it since abed550 |

Both CORE hooks are mounted once, in `components/Chatbot-Wrapper/ChatbotWrapper.tsx`. Boot order is covered in [widget-boot](../flows/widget-boot.md).

## How it works

### Host side (`public/chatbot.js`)

1. **The script tag is the config.** `extractScriptProps` reads a fixed list of attributes from `<script id="chatbot-main-script">`. The JSON-valued ones (`config`, `headerButtons`, `eventsToSubscribe`, `modalConfig`, `variables`, `mcpConfig`) are `JSON.parse`d. Every value is also buffered in `state.tempDataToSend`, to be sent to the iframe later.
2. **DOM setup.** `loadContent` runs on `DOMContentLoaded`, or straight away if `<body>` already exists. It appends the launcher `#interfaceEmbed` (an `<img>` plus a text `<span>`), the stylesheet `#chatbotEmbed-style` and the container `#iframe-parent-container`, which holds `iframe#iframe-component-interfaceEmbed` (sandbox `allow-scripts allow-same-origin allow-popups allow-forms`, microphone and camera allowed). The container goes inside the element named by `parentId`, else inside `#interface-chatbot`, else at the end of `<body>` (`changeContainer`).
3. **Login.** `fetchChatbotDetails` calls `POST <login>` with `Authorization: <embedToken>` when the `embedToken` attribute is set. Without it, the body is `{isAnonymousUser: true, interface_id}`. It makes up to 4 attempts, 1 s apart (added in 48fe052). With `test_chatbot="true"` it skips the network and builds a demo response (`buildDemoChatbotDetails`).
4. **Iframe URL.** `processChatbotDetails` sets `iframe.src = <chatbotUrl>?interfaceDetails=<encodeURIComponent(JSON.stringify(response.data))>`. It then merges `response.data.config` over the defaults and calls `applyConfig`.
5. **Layout.** `applyConfig` sets the launcher text or icon (`buttonName`, `iconUrl`), swaps the `<type>-parent-container` and `<type>-interfaceEmbed` classes, sets width and height, and calls `applyPositioning`, which sets `left` or `right` from `config.side`. A `ResizeObserver` forces 100% × 100% when the host viewport is narrower than 600px.
6. **Handshake.** The iframe posts `interfaceLoaded`. `sendInitialData` then shows the launcher (unless `hideIcon`), posts `{type: 'interfaceData', data: tempDataToSend}`, opens the chatbot if `defaultOpen` is set, and sets `tempDataToSend = null`.
7. **Runtime.** The `window.*` methods post more messages, and the listener reacts to `CLOSE_CHATBOT`, `ENTER_FULL_SCREEN_CHATBOT`, `EXIT_FULL_SCREEN_CHATBOT`, `interfaceLoaded` and `SESSION_EXPIRED`. A `SESSION_EXPIRED` message runs the login again and sets a new iframe `src`. If the host page removes the script tag from `<head>`, a `MutationObserver` deletes the launcher, the container and the stylesheet (`cleanupChatbot`).

`openChatbot` and `closeChatbot` also post `{type: 'open' | 'close'}` to the host's own `window.parent` and, as a JSON string, to `window.ReactNativeWebView`. This lets a page or React Native app that wraps the host page track open and closed state.

### Iframe side

1. `ChatbotWrapper` posts `{type: 'interfaceLoaded'}` to `window.parent` on mount.
2. `useEmbeddingScriptEventHandler` creates an `EmbeddingScrpitEventRegistry` and calls `useHandleGtwyEmbeddingScriptEvents(registry)`, which registers `interfaceData`. A message whose `type` is not registered is ignored by this listener.
3. Other message types have their own `message` listeners in other components: `askAi` and `refresh` in `components/Chatbot/hooks/useChatEffects.ts`, `setInput` and `open` in `components/Interface-Chatbot/ChatbotTextField.tsx`, and `UPDATE_MESSAGE_STYLES` in `hooks/useDynamicMessageStyles.ts`.
4. Outgoing events use `emitEventToParent`. A few senders still call `window.parent.postMessage` directly (close, fullscreen, `SESSION_EXPIRED`, `downloadAttachment`, `setDataInLocal`).

## Contracts

### Script tag

```html
<script id="chatbot-main-script"
        embedToken="<signed JWT from the customer's backend>"   <!-- or interface_id="..." for anonymous -->
        bridgeName="support_bot" threadId="user-42"
        variables='{"plan":"pro"}'
        config='{"type":"popup","width":"480","widthUnit":"px","height":"80","heightUnit":"%","side":"right","buttonName":"Help"}'
        defaultOpen="false" hideIcon="false" theme="system" mode="true"
        src="https://chatbot.gtwy.ai/chatbot.js"></script>
```

- The `id` must be exactly `chatbot-main-script`. Every lookup uses `getElementById`.
- `config.type` is one of `popup` (default), `pop_over`, `all_available_space`, `left_slider` or `right_slider`. Each one maps to classes in `public/chatbot-style.css`.
- The full attribute list, the `window.*` API and the message tables are in [api](../api.md).

### `interfaceDetails` (iframe URL parameter)

```ts
// = login response .data, parsed in app/chatbot/layout.tsx and utils/embedNamespace.ts
{ chatbot_id: string; userId: string; token: string | null; config?: Record<string, any>; test_chatbot?: boolean }
```

### Messages this area handles or sends

| Direction | `type` | Handled in | Effect |
|---|---|---|---|
| host → iframe | `interfaceData` | GTWY `handleInterfaceData` | Field-by-field dispatch, see below |
| host → iframe | `askAi` | `useChatEffects` | A string is sent at once. An object (`{askAi, variables, threadId, bridgeName}`) is sent after 500 ms. While a reply is loading, the user gets a toast instead |
| host → iframe | `setInput` | `ChatbotTextField` | Fills the textarea without sending |
| host → iframe | `refresh`, `open` | `useChatEffects`, `ChatbotTextField` | Reloads history. Focuses the input |
| iframe → host | `interfaceLoaded`, `CLOSE_CHATBOT`, `ENTER_FULL_SCREEN_CHATBOT`, `EXIT_FULL_SCREEN_CHATBOT`, `SESSION_EXPIRED` | `public/chatbot.js:handleIncomingMessages` | Handshake, close, fullscreen, re-login |
| iframe → host | `MESSAGE_SENT`, `MESSAGE_RECEIVED`, `MESSAGE_RECEIVED_WITH_ERROR`, `TOOL_CALL_RESULT`, `HEADER_BUTTON_PRESS`, `BRIDGE_SWITCH`, `MESSAGE_CLICK`, `FRONT_END_ACTION`, `PLANNING_ACTION`, `MINIMIZE_CHATBOT`, `RELOAD_PARENT` | not by the loader | For the customer's own `message` listener. `MESSAGE_CLICK` is sent only when the host passed it in `eventsToSubscribe` |

`handleInterfaceData` writes to these places (full field table in [api](../api.md)):

| Field(s) in `data` | Goes to |
|---|---|
| `threadId`, `helloId`, `version_id`, `bridgeName`, `modelChanged`, `serviceChanged`, `stream`, `image_model`, `widget`, `mode`, `hideCloseButton`, `hideFullScreenButton`, `mcpConfig`, `defaultErrorMessage` | `setDataInAppInfoReducer` (`store/appInfo/appInfoSlice.ts`) |
| `bridgeName` + `variables` | `addDefaultContext` (`store/interface/interfaceSlice.ts`) |
| `allowModalSwitch`, `chatTitle`, `chatSubTitle`, `chatIcon`, `allowBridgeSwitch` | `setDataInInterfaceRedux` |
| `headerButtons`, `eventsToSubscribe`, `modalConfig` | `setHeaderActionButtons`, `setEventsSubsribedByParent` (filtered by `ALLOWED_EVENTS_TO_SUBSCRIBE`), `setModalConfig` |
| `themeColor`, `chatbotTitle`, `chatbotSubtitle`, `defaultMessage` (at the top level or inside `config`) | `onConfigChange` from `ChatbotContext` (`app/chatbot/layout.tsx`) |
| `theme` | sessionStorage `chatbotTheme` (scoped) and `handleColorSchemeChange` |
| `messageStyles` | Re-posted to the iframe's own window as `UPDATE_MESSAGE_STYLES` |
| `config.reset`, `config.tree`, `config.<name>: {path, code}` | Component overrides (`store/componentOverrides/componentOverridesSlice.ts`) |

## Gotchas

> [!WARNING]
> **Three loader copies, edited by hand.** `public/chatbot.js`, `public/chatbot-dev.js` and `public/chatbot-local.js` must stay identical except for their URLs. Every behaviour commit so far has touched all three (17cbf02 side positioning, 48fe052 login retries, 6adc601 `SESSION_EXPIRED`, c7ace0c `setInput`). Run `diff public/chatbot.js public/chatbot-dev.js` after an edit. The only lines that should differ are those in [Env copies](#env-copies-and-drift).

> [!WARNING]
> **The host only listens to allow-listed origins.** `setupMessageListeners` drops any message whose `event.origin` is not `http://localhost:3000`, the copy's own chatbot origin, or `window.location.origin`. If the iframe moves to a new domain, close, fullscreen and the `interfaceLoaded` handshake stop working without any error, and the iframe never receives its attributes. The prod copy also trusts `http://localhost:3000`.

> [!WARNING]
> **The iframe has no origin check, and `config` code is executed.** Every `postMessage` in both directions uses targetOrigin `"*"`, and no iframe listener reads `event.origin`. `interfaceData.config.<name>.code` is compiled with Babel and run through an indirect `eval` (`components/Interface-Chatbot/ChatbotDrawerParts/useComponentOverride.tsx`). Any window that holds a reference to the iframe can therefore run code inside it. Outgoing events, including message text and tool results, go to whatever page is the parent. Do not put secrets in events, and add an origin check before giving `interfaceData` new powers.

> [!WARNING]
> **`config` means two things.** On the host, `config` is the layout (`type`, `width`, `side`, …). The whole attribute set, `config` included, is also forwarded as `interfaceData`, where `config` is read as context keys (`themeColor`, `chatbotTitle`, …) and as a component-override map. A layout key named `reset: true` or `tree`, or any entry that has an array `path`, changes the overrides.

> [!WARNING]
> **Anonymous login reads `interface_id`, not `interfaceId`.** `fetchChatbotDetails` calls `getAttribute('interface_id')`. The `interfaceId` attribute in the props list is forwarded to the iframe and then ignored. Both spellings date back to the first commit, 09427de.

> [!WARNING]
> **`iconColor` throws.** `setPropValues` uses `AI_WHITE_ICON` and `AI_BLACK_ICON`, which are not defined anywhere. They exist in all 7 loader copies. Passing `iconColor`, as an attribute or through `SendDataToChatbot`, raises a `ReferenceError` inside `updateProps`, and the rest of that call is skipped. Use `config.iconUrl` instead. The host-side `hideCloseButton` branch targets `#close-button-interfaceEmbed`, which the script never creates; the iframe still honours the flag.

> [!WARNING]
> **`tempDataToSend` is emptied after the first handshake.** After a `SESSION_EXPIRED` re-login, the next `interfaceLoaded` re-sends only what `SendDataToChatbot` added since then. The original script attributes (`bridgeName`, `threadId`, `variables`, …) and `defaultOpen` are not sent again.

> [!WARNING]
> **Every `interfaceData` without `theme` clears the stored theme.** `handleInterfaceData` calls `RemoveSessionStorage('chatbotTheme')` whenever the key is missing. A later `SendDataToChatbot({threadId})` therefore drops a theme the host set earlier. Re-send `theme` with each call if it matters.

> [!WARNING]
> **The `interfaceData` handler is a first-render closure.** The GTWY hook registers `handleInterfaceData` in a `useEffect(..., [])`, and the CORE listener is also attached once. The handler therefore keeps the first render's `onConfigChange` and `currentThemeColor`; `themeColor` falls back to that first value. Read live values from the store or a ref if you add logic here.

> [!WARNING]
> **`ParentEventType` is not enforced.** `PLANNING_ACTION` is emitted but is missing from the union. It only builds because `next.config.ts` sets `typescript.ignoreBuildErrors`. Eight members (`PUSH_NOTIFICATION`, `uuid`, `ENABLE_DOMAIN_TRACKING`, `SET_BADGE_COUNT`, `OPEN_CHATBOT`, `SHOW_STARTER_QUESTION`, `HIDE_STARTER_QUESTION`, and `CLOSE_CHATBOT` through this helper) are never emitted. They are left over from Hello.

> [!WARNING]
> **Global name clash with the Hello loader.** `public/chat-widget*.js` also defines `window.SendDataToChatbot`, `window.askAi` and `window.reloadChats`. If a page loads both loaders, the one that runs last wins.

## Env copies and drift

| Copy | `chatbotUrl` / `styleSheet` origin | `login` | Extra trusted origin |
|---|---|---|---|
| `public/chatbot.js` | `https://chatbot.gtwy.ai` | `https://db.gtwy.ai/api/chatbot/loginuser` | `https://chatbot.gtwy.ai` |
| `public/chatbot-dev.js` | `https://dev-chatbot.gtwy.ai` | `https://dev-db.gtwy.ai/api/chatbot/loginuser` | `https://dev-chatbot.gtwy.ai` |
| `public/chatbot-local.js` | `http://localhost:3001` | the **dev** backend (the `localhost:7072` line is commented out) | `http://localhost:3001` |

At c7ace0c there is no other behaviour drift between the three copies: the remaining diffs are one quote style and a trailing newline. Every URL is hard-coded in the copy's `this.urls`, and no env var feeds the loaders. The launcher icons are hard-coded Cloudflare Images URLs (`makeImageUrl`).

## Leftover files

- **`public/chat-widget*.js`: Hello loaders, not served to anything this app handles.** They point their iframes at MSG91 hosts (`blacksea.msg91.com`, `ctest.msg91.com`, `shubhendraagrawal.msg91.com`, `localhost:3001`). They post `helloData`, `CHATBOT_OPEN`, `ADD_COBROWSE_SCRIPT`, `parent-route-changed`, `SET_VARIABLES_FOR_BOT` and similar messages. The iframe handlers for these lived in a hooks/HELLO folder that was deleted in abed550 (2026-06-18, "remove Hello/widget mode support"). Today only the shared types (`interfaceData`, `askAi`, `refresh`) would still be handled. The last change to these files was 4bdcda1 (2026-05-05, a rename). The four copies have also drifted from each other: the prod copy does not trust its own `blacksea.msg91.com` origin, while the dev copy adds `ctest.msg91.com`. They also contain a hard-coded Cobrowse license key in `CobrowseManager`.
- **`public/urlMonitor.js`** is loaded only by `addUrlMonitor` in the Hello loaders, when `initChatWidget({urlsToOpenInIFrame})` is called. It patches `window.open`, `history.pushState` and `history.replaceState` on the host page. It was last changed in aae4118 (2025-08-08).
- **`hooks/coBrowser/CBManger.ts`**: its only caller, the `ADD_COBROWSE_SCRIPT` handler, was removed in abed550.
- **`public/loader.html`** has had no references since it was added in da811c3.

> [!TODO] Needs a human: are `public/chat-widget*.js` and `public/urlMonitor.js` still fetched by any live MSG91 Hello page from this app's deployment, or can they (and `hooks/coBrowser/`, `public/loader.html`) be deleted? The Hello side now lives in the sibling chat-widget repo.

## Why it is built this way

- **Script-tag attributes and an iframe.** The customer adds one tag. Everything the iframe needs reaches it either through the URL (`interfaceDetails`, so login data is there at first render) or later through `interfaceData`, which can be re-sent at runtime with `SendDataToChatbot`.
- **The `interfaceLoaded` handshake** exists because the iframe cannot receive messages before its listeners mount. The loader buffers everything in `tempDataToSend` until the handshake arrives.
- **The `askAi` 500 ms delay** (comment in `useChatEffects.ts`): `SendDataToChatbot({bridgeName, askAi})` posts `interfaceData` and `askAi` back to back. The delay lets the `bridgeName` and `variables` dispatches land before the message is sent.
- **The embed namespace** (915dbb1, comment in `utils/embedNamespace.ts`): two chatbot iframes for different users or chatbots on one parent page shared sessionStorage and cookies (same origin) and overwrote each other. Keys are now prefixed with `<chatbot_id>_<userId>_` whenever both values are present in `interfaceDetails`.
- **`SESSION_EXPIRED` re-login** (6adc601, #240): when the session expires, the iframe shows `app/error/page.tsx`, and its Reload button asks the host to log in again rather than reloading the iframe with the stale token in its URL.
- **Registry pattern in `hooks/CORE/`**: CORE held the generic dispatcher, and the product folders (`GTWY`, and formerly `HELLO`) registered their handlers into it. After Hello was removed, GTWY is the only product left.

> [!TODO] Needs a human: why does the production `public/chatbot.js` trust `http://localhost:3000`, and why does anonymous login use `interface_id` while the documented attribute is `interfaceId`?

## Changing it safely

- **New script attribute or `SendDataToChatbot` field:**
  1. Add it to the attribute list in `extractScriptProps`, and to the JSON-parse list if it holds an object, in all three `public/chatbot*.js` files.
  2. Add the field to `InterfaceData` and handle it in `handleInterfaceData`.
  3. Document it in [api](../api.md).

  Examples: 61f149f (`defaultErrorMessage`) and 9f5a370 (`mcpConfig`, `defaultMessage`).
- **New `window.*` method or host → iframe message:**
  1. Add it to `window.Chatbot` and as a bare `window.<name>` in all three loaders.
  2. Add a `message` listener in the component that owns the behaviour.

  c7ace0c (`setInput`) is the model.
- **New iframe → host event:** add the type to `ParentEventType`, emit it with `emitEventToParent`, and document the payload in [api](../api.md). Host pages read it with their own `window.addEventListener('message', ...)`.
- **New domain:** change `this.urls` and `trustedOrigins` in the matching copy only.
- **Check it:** serve the app on `localhost:3001` (the origin `public/chatbot-local.js` expects), load `chatbot-local.js` from a test HTML page with `id="chatbot-main-script"`, and check three things: the handshake (`interfaceData` arrives), open, close and fullscreen, and that `window.Chatbot.askAi("hi")` sends a message. Then diff the three copies.

Related: [app-shell](app-shell.md) (layout parses `interfaceDetails`), [ai-chat](ai-chat.md) (`askAi`, `MESSAGE_*` events), [chat-ui](chat-ui.md) (header buttons, overrides, `setInput`), [rich-ui-renderer](rich-ui-renderer.md) (`FRONT_END_ACTION`), [rag-embed](rag-embed.md) (separate postMessage protocol for `/rag`).
