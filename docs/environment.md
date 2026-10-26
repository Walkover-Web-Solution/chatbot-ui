---
covers: ["package.json", "next.config.ts", "config/api.ts", "config/ragApi.ts", "utils/utilities.js", "public/chatbot*.js", "public/rag-*.js", ".gitignore"]
verified_at: c7ace0c
verified_on: 2026-10-20
---
# Environment

The app is a Next.js 15 (App Router) client app, deployed to Cloudflare Pages through `@cloudflare/next-on-pages`. Two env vars matter. Both are `NEXT_PUBLIC_*`, so Next inlines them into the browser bundle at build time. The loader scripts in `public/` read no env vars: each copy hard-codes its hosts (see [Loader copies](#loader-copies-and-their-hard-coded-hosts)). The routes and calls these settings feed are in [api](api.md).

## Run it locally

1. **Install.** No Node version is pinned (no `engines`, no .nvmrc) and no lockfile is committed, so `npm install` resolves the caret ranges in `package.json` fresh. Two machines can end up with different versions.
2. **Env file.** `.gitignore` ignores every .env* file and there is no example file. Create .env.local:

   ```sh
   NEXT_PUBLIC_API_BASE_URL=<GTWY Node backend origin, no trailing slash>
   NEXT_PUBLIC_PYTHON_API_BASE_URL=<GTWY Python backend origin, no trailing slash>
   ```

   Every call is built as `${URL}/api/...`, so a trailing slash produces `//api/...`. For local work, point both at the **dev** backends: `public/chatbot-local.js` logs in against the dev backend (see [Must match](#must-match-other-services)).
3. **Start on port 3001.**

   ```sh
   npm run dev -- -p 3001
   # dev = NODE_OPTIONS=--max-http-header-size=131072 next dev --turbopack
   ```

   Port 3001 matters because `public/chatbot-local.js` and `public/rag-local.js` hard-code `http://localhost:3001`. Plain `npm run dev` starts on Next's default port 3000. The `NODE_OPTIONS=...` prefix is POSIX shell syntax, so on Windows `cmd` you have to set the variable yourself.
4. **Open it through a host page**, not directly. A bare `/chatbot` has no `interfaceDetails` (no token, not a test chatbot), so it shows a spinner forever.

### Test the widget locally

Serve this page from any static server on another port (for example `python3 -m http.server 8080` in a scratch folder):

```html
<!doctype html>
<html><head>
  <script id="chatbot-main-script" src="http://localhost:3001/chatbot-local.js"
          test_chatbot="true" config='{"chatbotTitle":"Local test"}'></script>
</head><body></body></html>
```

- `test_chatbot="true"` skips the login call and runs the iframe in demo mode, with canned answers from `utils/demoChatbotData.ts`. Most backend calls are skipped (see [ai-chat](modules/ai-chat.md#test-chatbot-mode)). Use it for UI work.
- For a real conversation, replace `test_chatbot` with an `embedToken` issued for the **dev** environment, and set both env vars to the dev backends.
- `public/chatbot-local.js` trusts messages from `http://localhost:3001`, so close, fullscreen and the `interfaceLoaded` handshake work with this setup.
- RAG: `<script id="rag-main-script" src="http://localhost:3001/rag-local.js" embedToken="...">`. This copy logs in at `localhost:7072`, so it needs a local GTWY Node backend on that port.
- To try the deployed dev build instead, load `public/chatbot-dev.js` from https://dev-chatbot.gtwy.ai. The hosts live in the file, not in the deployment: `public/chatbot.js` points at production wherever it is served from.

## Build and deploy

| Script | Command | Notes |
|---|---|---|
| `dev` | `NODE_OPTIONS=--max-http-header-size=131072 next dev --turbopack` | The header-size flag was added in 46c4501 ("fix: model change bugs (#258)") with no reason given |
| `build` | `next build` | Type and lint errors do not fail it (see below) |
| `start` | `next start` | |
| `lint` | `next lint` | |
| `build:pages` | `npx @cloudflare/next-on-pages` | Cloudflare Pages build. Dynamic routes need `export const runtime = 'edge'` (`app/chatbot/page.tsx`, `app/chatbot/[chatbotId]/page.tsx`, `app/chatbotpreview/page.tsx`) |
| `preview` | `npm run pages:build && wrangler pages dev` | **Broken**: there is no `pages:build` script |
| `deploy` | `npm run pages:build && wrangler pages deploy` | **Broken**, same reason |

> [!WARNING]
> `preview` and `deploy` fail with "Missing script: pages:build". The script was renamed to `build:pages` in 0a8b760 (2025-03-06), and these two were not updated. `wrangler` is not a dependency either, and there is no wrangler config in the repo. Call `npm run build:pages` directly.

> [!WARNING]
> `next.config.ts` sets `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true` (since 6bad1e6, no reason recorded). A green build says nothing about types. The tree already has type errors that only build because of this: `PLANNING_ACTION` is missing from `ParentEventType`, and `components/FormComponent.tsx` imports a missing `@/config/helloApi`. Run `npx tsc --noEmit` and `npm run lint` yourself, and compare the output with the base branch (`testing`).

Other `next.config.ts` settings:
- `reactStrictMode: false`, so effects run once in dev too. Several `message` listeners are registered once with an empty dependency list.
- `images.remotePatterns` allows any https host.
- A commented-out `setupDevPlatform` call is the only reference to `NODE_ENV`.

> [!TODO] Needs a human: how are production and dev deployed (a Cloudflare Pages Git integration running `build:pages`?), and where are `NEXT_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_PYTHON_API_BASE_URL` set for each environment? Why does `dev` need the 128 KB header limit (a long `interfaceDetails` query string is a guess)?

## Variables

| Var | Required | Default | Read in | Purpose / effect if missing |
|---|---|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | yes | none | `config/api.ts` (`URL`), `config/ragApi.ts` (`URL`) | GTWY Node backend origin: history, threads, subscribe, service models, feedback, RAG resources. **Reaches the browser.** If missing, every URL starts with "undefined/" and resolves relative to the iframe page, so all those calls 404 and the chat shows no history or agent settings |
| `NEXT_PUBLIC_PYTHON_API_BASE_URL` | yes | none | `config/api.ts` (`PYTHON_URL`) | GTWY Python backend origin: send message (SSE and non-stream) and file upload. **Reaches the browser.** If missing, no message can be sent |
| `REACT_APP_API_ENVIRONMENT` | no | none | `utils/utilities.js:getCurrentEnvironment` | Used only as the cookie name that the 401 handler in `utils/interceptor.ts` removes. It is not `NEXT_PUBLIC_*`, so it is `undefined` in the browser and the handler removes a cookie named "undefined". Dead |
| `NODE_ENV` | no | set by Next | `next.config.ts` (commented-out code only) | No effect |
| `NODE_OPTIONS` | dev only | `--max-http-header-size=131072` | `package.json` `dev` script | Raises Node's HTTP header limit for the dev server. Not an app variable |

Values are inlined at build time. Changing one needs a rebuild, and one bundle cannot switch environments at runtime. The `?env=stage` query parameter on `/chatbot` only sets `ChatbotContext.environment`. It does not change any API host.

No secrets are read from env. The rtlayer keys are hard-coded in `components/Chatbot/hooks/useRtlayerEventManager.tsx:useWebSocketClient`, and the Hello loaders contain a hard-coded Cobrowse license key. Do not copy either into docs.

## Loader copies and their hard-coded hosts

Each copy is a hand-maintained duplicate. A behaviour change must be made in every copy of the same family ([embed-scripts](modules/embed-scripts.md#env-copies-and-drift), [rag-embed](modules/rag-embed.md#env-copies)).

<!-- verify:ignore-start -->
| File | Iframe URL | CSS URL | Login URL | Other |
|---|---|---|---|---|
| `public/chatbot.js` | https://chatbot.gtwy.ai/chatbot | https://chatbot.gtwy.ai/chatbot-style.css | POST https://db.gtwy.ai/api/chatbot/loginuser | trusts http://localhost:3000, https://chatbot.gtwy.ai, own origin |
| `public/chatbot-dev.js` | https://dev-chatbot.gtwy.ai/chatbot | https://dev-chatbot.gtwy.ai/chatbot-style.css | POST https://dev-db.gtwy.ai/api/chatbot/loginuser | trusts http://localhost:3000, https://dev-chatbot.gtwy.ai, own origin |
| `public/chatbot-local.js` | http://localhost:3001/chatbot | http://localhost:3001/chatbot-style.css | POST https://dev-db.gtwy.ai/api/chatbot/loginuser (the localhost:7072 line is commented out) | trusts http://localhost:3000, http://localhost:3001, own origin |
| `public/rag-prod.js` | https://chatbot.gtwy.ai/rag | https://chatbot.gtwy.ai/rag.css | GET https://db.gtwy.ai/api/rag/embed/login | list: https://db.gtwy.ai/api/rag/resource |
| `public/rag-dev.js` | https://dev-chatbot.gtwy.ai/rag | https://dev-chatbot.gtwy.ai/rag.css | GET https://dev-db.gtwy.ai/api/rag/embed/login | list: https://dev-db.gtwy.ai/api/rag/resource |
| `public/rag-local.js` | http://localhost:3001/rag | http://localhost:3001/rag.css | GET http://localhost:7072/api/rag/embed/login | list: http://localhost:7072/api/rag/resource |
<!-- verify:ignore-end -->

The `public/chat-widget*.js` loaders point at MSG91 hosts and are legacy ([embed-scripts](modules/embed-scripts.md#leftover-files)).

## Must match other services

- **Login host ↔ `NEXT_PUBLIC_API_BASE_URL` ↔ `NEXT_PUBLIC_PYTHON_API_BASE_URL`.** The loader logs in at its hard-coded host, and the iframe sends the resulting token to both API hosts. All three must be the same environment. A mismatch gives a 401, which clears the origin's localStorage and sends the iframe to `/error`. `public/chatbot-local.js` uses the dev login, so a local build must use the dev API hosts.
- **RAG list ↔ RAG form.** The `docsApi` host in `public/rag-*.js` and `NEXT_PUBLIC_API_BASE_URL` of the deployment it loads must be the same backend, or the list and the form show different knowledge bases.
- **Iframe origin ↔ `trustedOrigins`.** To serve the app from a new domain, change both `this.urls` and `trustedOrigins` in the matching `public/chatbot*.js` copy. Without the `trustedOrigins` change, `interfaceLoaded`, close and fullscreen are silently ignored.
- **rtlayer.** The keys in `useWebSocketClient` and the channel formula ([api](api.md#rtlayer-ai-replies)) must match what the GTWY Python backend publishes to.
