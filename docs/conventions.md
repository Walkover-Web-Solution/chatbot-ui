---
covers: [".eslintrc.json", "eslint.config.mjs", ".eslintignore", "tsconfig.json", "next.config.ts", "config/**", "store/**", "utils/interceptor.ts", "utils/ChatbotUtility.ts", "utils/emitEventsToParent/**", "components/customToast.js"]
verified_at: c7ace0c
verified_on: 2026-10-20
---
# Conventions

These are the rules specific to this repo; general React and Next.js practice is assumed. Component and styling rules are in [ui/components](ui/components.md#rules) and [ui/design-system](ui/design-system.md#rules).

## Where new code goes

| Kind of code | Folder | Pattern | Example |
|---|---|---|---|
| Backend call | `config/api.ts` (chat), `config/ragApi.ts` (RAG) | one exported async function per endpoint, on the axios instance from `utils/interceptor.ts` | `config/api.ts:getAllThreadsApi` |
| Chat behaviour (send, history, threads) | `components/Chatbot/hooks/` | a `use…` hook that calls the API function and dispatches | `components/Chatbot/hooks/useChatActions.ts:useGetMoreChats` |
| Redux state | `store/<slice>/` | `createSlice` + a reducer file; register in `store/combineReducer.js` and in `perEmbedSlices` in `store/index.js` | `store/componentOverrides/componentOverridesSlice.ts` |
| Host → iframe message | `hooks/GTWY/eventHandlers/embeddingScript/embeddingScriptEventHandler.ts`, or a `message` listener in the component that owns it | handle the type, dispatch or set context | `setInput` in `components/Interface-Chatbot/ChatbotTextField.tsx` |
| Iframe → host event | `utils/emitEventsToParent/emitEventsToParent.tsx:emitEventToParent` | add the name to `ParentEventType` | `HEADER_BUTTON_PRESS` |
| Host-page API | `public/chatbot.js` and its copies `public/chatbot-dev.js`, `public/chatbot-local.js` | the same edit in all three | see [embed-scripts](modules/embed-scripts.md#changing-it-safely) |
| Rich-UI node | `components/richUI/components/` + `components/richUI/componentRegistry.js` | PascalCase type key | [rich-ui-renderer](modules/rich-ui-renderer.md#changing-it-safely) |
| Page | `app/<route>/page.tsx` | `'use client'`; add `export const runtime = 'edge'` on dynamic routes | `app/chatbot/page.tsx` |

Path alias: `@/` is the repo root (`tsconfig.json`).

## Layer rules

- **API functions** return data or throw. They never dispatch and never show toasts. One known exception: the streaming function `config/api.ts:streamDataToAction` takes callbacks.
- **Streaming** uses raw `fetch`, because axios can't read a response body as a stream. It must set `Authorization` itself from the scoped `interfaceToken`, and it gets none of the interceptor's 401 or retry handling ([ai-message](flows/ai-message.md)).
- **Hooks** own async work. The only saga (`store/interface/interfaceSaga.ts`) is empty. Don't add sagas unless you move the existing pattern with them.
- **Network guard:** every network call in a chat hook must check `isTestChatbot` first. Test mode has no token, so an unguarded call fails with a 401, and the interceptor then clears localStorage ([ai-chat](modules/ai-chat.md#gotchas)).
- **Selectors:** read objects from the store with `utils/deepCheckSelector.ts:useCustomSelector`.
- **sessionStorage:** go through the helpers in `utils/ChatbotUtility.ts`, never the raw API.
- **postMessage:** posts to the host use `"*"`, and the iframe does not check `event.origin` (a known risk, see [embed-scripts](modules/embed-scripts.md#gotchas)). Don't add new message types that carry secrets or run code.

## Errors and logging

- User-facing errors go through `components/customToast.js` (`errorToast`, `warningToast`). The interceptor already shows a toast for some failures, so check `utils/interceptor.ts` before adding another one, or the user sees two.
- In chat, an error is stored on the message (`message.error`) or in `Chat.error`. When the host set `defaultErrorMessage`, it replaces the displayed text ([ai-chat](modules/ai-chat.md)).
- Errors sent to a host page must be plain strings. `utils/errorFormatter.ts` builds them for the RAG page (PR #179).
- Logging is `console.error` / `console.log` only. There is no logger or error reporting service.

## Approved libraries

| Concern | Use | Not |
|---|---|---|
| HTTP | axios via `utils/interceptor.ts`; `fetch` only for SSE | a new axios instance |
| State | Redux Toolkit + redux-persist | React Query, Zustand |
| Realtime | `rtlayer-client` | `socket.io-client`, which is still in `package.json` but imported nowhere |
| Markdown | react-markdown 10 + remark-gfm (guarded by `utils/appUtility.js:supportsLookbehind`) | — |
| Icons | lucide-react | new `@mui/icons-material` imports |
| Dates | dayjs | — |

## Style the linter does not catch

- `.eslintrc.json` turns off `react-hooks/rules-of-hooks` and `react-hooks/exhaustive-deps`, and `.eslintignore` lists `app/` and `components/`. With ESLint 9, `eslint.config.mjs` (flat config, `next/core-web-vitals` + `next/typescript`) is the config that applies.
  > [!TODO] Needs a human: which ESLint config is intended, and should `app/` and `components/` be linted?
- `next.config.ts` sets `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds`. `npm run build` passes with type errors, and several dead files import modules that no longer exist ([ui/components](ui/components.md#dead-components)).
- Some misspellings are load-bearing; renaming any of them breaks imports or callers:
  - `hooks/coBrowser/CBManger.ts`
  - `components/Interface-Chatbot/Interface-Markdown/MarkdownUtitily.tsx`
  - the `assests/` folder
  - `getEmebedToken` in `config/api.ts`
  - `setEventsSubsribedByParent`

## Before you finish a change

There are no automated tests in this repo.

```bash
npx tsc --noEmit        # the build will not catch type errors
npm run lint
npm run dev -- -p 3001  # local loader copies expect port 3001 (see environment.md)
```

Test in the browser through a real loader script (see [environment](environment.md)), in both stream and non-stream mode, and in light and dark theme. If you touched a loader, test the edited copy.
