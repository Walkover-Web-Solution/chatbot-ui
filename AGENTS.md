# chatbot-ui

This repo is the GTWY AI chatbot that customers embed on their sites. `public/chatbot.js` runs on the host page and opens this Next.js 15 app in an iframe. The app talks to the GTWY Node and Python backends, which live in other repos, and receives AI replies as a server-sent-event (SSE) stream or over rtlayer. The same app also serves the RAG knowledge-base embed (`/rag`).

## Commands

| Task | Command |
|---|---|
| Install | `npm install` (no lockfile is committed) |
| Run locally | `npm run dev -- -p 3001` (the local loader copies expect port 3001; see [environment](docs/environment.md#run-it-locally)) |
| Type-check | `npx tsc --noEmit` (the build ignores type errors) |
| Lint | `npm run lint` |
| Build | `npm run build`; Cloudflare Pages build: `npm run build:pages` |
| Test | none; there are no automated tests. Test through a host page with `test_chatbot="true"` ([environment](docs/environment.md#test-the-widget-locally)). |

## Read before you change

- Anything → [docs/architecture.md](docs/architecture.md)
- Loader scripts, `window.*` API, postMessage → [docs/modules/embed-scripts.md](docs/modules/embed-scripts.md), [docs/api.md](docs/api.md)
- Boot, routes, store, session keys, theme → [docs/modules/app-shell.md](docs/modules/app-shell.md), [docs/flows/widget-boot.md](docs/flows/widget-boot.md)
- Sending, streaming, rtlayer, threads, history → [docs/modules/ai-chat.md](docs/modules/ai-chat.md), [docs/flows/ai-message.md](docs/flows/ai-message.md)
- Header, input, message cards, planning cards, component overrides → [docs/modules/chat-ui.md](docs/modules/chat-ui.md)
- JSON UI in AI replies (richUI) → [docs/modules/rich-ui-renderer.md](docs/modules/rich-ui-renderer.md)
- RAG knowledge-base embed → [docs/modules/rag-embed.md](docs/modules/rag-embed.md)
- State, storage keys, routes, components, styling → [docs/ui/](docs/README.md#ui)
- A common change → [docs/recipes.md](docs/recipes.md); terms → [docs/glossary.md](docs/glossary.md)

## Rules

1. Make every loader change in all copies. `public/chatbot.js`, `chatbot-dev.js` and `chatbot-local.js` are hand-kept copies that differ only in URLs; the same holds for `public/rag-*.js` ([embed-scripts](docs/modules/embed-scripts.md#env-copies-and-drift)).
2. Don't add features to `public/chat-widget*.js` or `public/urlMonitor.js`. They are MSG91 Hello leftovers, and the iframe stopped handling their messages in abed550.
3. Run `npx tsc --noEmit` yourself. `next.config.ts` sets `ignoreBuildErrors` and `ignoreDuringBuilds`, so a green build proves nothing about types.
4. Change chat state in `store/chat/chatReducerV2.ts`. `components/Chatbot/hooks/chatReducer.ts` is dead code left over from the Redux move (2da4094).
5. One `Chat` message holds both the user turn (`user`) and the reply (`content`). `messageIds[subThreadId][0]` is the newest message, and the streaming reducers write to index 0 of the current sub-thread ([ai-chat](docs/modules/ai-chat.md)).
6. Give every new network call in the chat hooks an `isTestChatbot` guard. Test mode has no token, a 401 runs `localStorage.clear()` for the whole origin, and that resets every other embed and tab ([app-shell](docs/modules/app-shell.md#gotchas)).
7. The streaming send uses raw `fetch` (`config/api.ts:streamDataToAction`), so it skips the axios interceptor's auth, 401 redirect and retry. Handle those yourself if you change it.
8. Keep the rtlayer channel name identical to what the Python backend publishes, and keep closing the socket on `pagehide` as well as on unmount (#261). See [ai-chat](docs/modules/ai-chat.md#receiving-over-rtlayer-usertlayereventmanager).
9. Each slice is keyed differently: `appInfo` by the composite tab id, `Interface` by `<chatSessionId>_<tabSessionId>`, `subscribeData` by `chatSessionId`. Check the key a value is written under before reading it ([state](docs/ui/state.md)).
10. Register a new slice in `perEmbedSlices` in `store/index.js`. If you don't, its actions are broadcast to other same-origin embeds (c7943ce). Use the `utils/ChatbotUtility.ts` helpers for sessionStorage so keys stay scoped per embed.
11. Send iframe→host events through `emitEventToParent` and add the name to `ParentEventType`. The `interfaceData` handler is registered once and sees first-render values, so read current state from the store ([embed-scripts](docs/modules/embed-scripts.md#gotchas)).
12. Keep `export const runtime = 'edge'` on dynamic routes; Cloudflare Pages through next-on-pages needs it.
13. Never render AI text as HTML (removed on purpose in b8b7b7e). Rich-UI components must tolerate bad props, because there is no error boundary and one crash replaces the whole chat with `app/error.tsx` ([rich-ui-renderer](docs/modules/rich-ui-renderer.md#gotchas)).
14. In an overridable component, call `useComponentOverride` first and put every other hook above the early return. A new markdown renderer goes into all three react-markdown maps ([ui/components](docs/ui/components.md#rules)).
15. Use the host's brand color through `useColor()` or the MUI theme, and put `not-prose` on cards inside assistant markdown ([design-system](docs/ui/design-system.md#rules)).

## Where things are

- `public/`: host-page loader scripts and their CSS, one copy per environment.
- `app/`: routes `/chatbot`, `/chatbot/[chatbotId]`, `/rag`, `/chatbotpreview`, `/error` ([routes](docs/ui/routes.md)).
- `components/Chatbot/`: chat logic hooks (`components/Chatbot/hooks/useChatActions.ts` is the hottest file).
- `components/Interface-Chatbot/`: the chat UI. `components/richUI/`: the JSON UI renderer.
- `hooks/CORE/`, `hooks/GTWY/`: handlers for host postMessages. `utils/emitEventsToParent/`: events to the host.
- `config/api.ts`, `config/ragApi.ts`: backend calls. `utils/interceptor.ts`: axios auth, 401 and retry.
- `store/`: Redux slices, persistence, cross-tab sync.

## Docs map

See [docs/README.md](docs/README.md) for every doc and when to read it.
When you change behaviour that a doc describes, update that doc in the same change and run `/ai-docs update`.
