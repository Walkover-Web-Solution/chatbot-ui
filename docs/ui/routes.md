---
covers: ["app/**/page.tsx", "app/**/layout.tsx", "app/error.tsx", "hoc/addUrlDataHoc.tsx"]
verified_at: c7ace0c
verified_on: 2026-10-20
---
# Routes and pages

Every page is loaded inside an iframe that a `public/` loader script creates. None of them is meant to be opened directly. There is no Next.js middleware file and no API route handler. The host→iframe messages each page accepts are in [api](../api.md).

| Route | File | Runtime | Opened by | Data it loads |
|---|---|---|---|---|
| `/chatbot?interfaceDetails=<json>` | `app/chatbot/page.tsx` inside `app/chatbot/layout.tsx` | edge | `public/chatbot.js` (and its env copies) | Parses `interfaceDetails` (`chatbot_id`, `userId`, `token`, `config`, `test_chatbot`), creates the tab id, stores the token, then `router.replace('/chatbot/<chatbot_id>')`. |
| `/chatbot/[chatbotId]` | `app/chatbot/[chatbotId]/page.tsx` → `components/Chatbot-Wrapper/ChatbotWrapper.tsx` | edge | client navigation from `/chatbot` only | The chat. Thread list, history and subscribe calls start from `components/Chatbot/Chatbot.tsx` ([ai-chat](../modules/ai-chat.md)). |
| `/error?error=session expired` | `app/error/page.tsx` | default | `utils/interceptor.ts` on a 401 | Nothing. Buttons post `SESSION_EXPIRED` or `CLOSE_CHATBOT` to the host. |
| `/rag` | `app/rag/page.tsx` | default | `public/rag-prod.js` (and env copies) | Knowledge-base form; config arrives by postMessage. See [rag-embed](../modules/rag-embed.md). |
| `/chatbotpreview` | `app/chatbotpreview/page.tsx` | edge | no embedder found in this repo | A static fake chat that only listens for `themeChange`. See [rich-ui-renderer](../modules/rich-ui-renderer.md). |
| `/` | `app/page.tsx` | default | nobody | create-next-app placeholder. |

`app/error.tsx` is the global error boundary: any render crash in the chat (for example a malformed rich-UI node) lands here, and its "Close" button posts `CLOSE_CHATBOT`.

## Navigation and layout

- `app/layout.tsx` wraps every page in the Redux provider, `PersistGate` and `components/AppWrapper.tsx` (MUI theme + `ThemeContext`). It also loads the Tailwind Play CDN script at runtime so class names inside host-supplied override code work ([design-system](design-system.md)).
- `app/chatbot/layout.tsx` provides `ChatbotContext` (`components/context.tsx`) and writes the `interfaceDetails` config into `appInfo` and `Interface`. Details: [app-shell](../modules/app-shell.md).
- Pages and most components are wrapped in `hoc/addUrlDataHoc.tsx:addUrlDataHoc`, which injects `chatSessionId` and the composite `tabSessionId` as props. The key formats are in [app-shell](../modules/app-shell.md#session-keys).

> [!WARNING]
> `/chatbot/[chatbotId]` works only after client navigation from `/chatbot`. A hard reload of `/chatbot/<id>` loses `interfaceDetails` and `draftData`, and the page renders nothing. The `chatbotId` route param is not read.

> [!WARNING]
> Dynamic routes need `export const runtime = 'edge'`. The app is deployed to Cloudflare Pages through `@cloudflare/next-on-pages` (`npm run build:pages`), which requires it. Keep the export on any new dynamic route.

- `?env=stage` is still parsed in `app/chatbot/layout.tsx` and put into `ChatbotContext.environment`, but nothing reads it since the Hello code was removed (abed550).
