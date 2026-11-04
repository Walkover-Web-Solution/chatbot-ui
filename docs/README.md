---
verified_at: c7ace0c
verified_on: 2026-10-20
---
# Docs index

These docs are written for AI coding agents and new engineers. Every claim was checked against the code at the commit in each doc's frontmatter. Run `/ai-docs check` to see what has drifted since. Start with [AGENTS.md](../AGENTS.md) for commands and rules.

| Doc | Read it when |
|---|---|
| [architecture.md](architecture.md) | First, for any change: the two halves (loaders + iframe app), layers, backends, cross-repo contracts |
| [api.md](api.md) | Script attributes, `window.*` functions, every postMessage type, every backend call |
| [environment.md](environment.md) | Env vars, running and testing the widget locally, build and deploy, the hosts hard-coded in each loader copy |
| [conventions.md](conventions.md) | Where new code goes, layer rules, errors, approved libraries, checks before you finish |
| [recipes.md](recipes.md) | Making a common change: loader feature, host config key, richUI node, override target, stream chunk type, API call |
| [glossary.md](glossary.md) | Terms that mislead: bridge, thread vs sub-thread, `interfaceDetails` vs `interfaceData`, the stream flags |

## Modules

| Doc | Read it when |
|---|---|
| [modules/embed-scripts.md](modules/embed-scripts.md) | Changing `public/chatbot*.js`, the host↔iframe protocol, or the iframe's message handlers; deciding about the legacy `public/chat-widget*.js` |
| [modules/app-shell.md](modules/app-shell.md) | Routes, providers, store setup (persist, cross-tab sync, `urlData`), session keys, theme, axios interceptor |
| [modules/ai-chat.md](modules/ai-chat.md) | Sending, SSE streaming, rtlayer, the `Chat` slice, threads and sub-threads, history, model switch, test mode |
| [modules/chat-ui.md](modules/chat-ui.md) | Header, drawer, input box, message routing and cards, planning cards, markdown, component overrides |
| [modules/rich-ui-renderer.md](modules/rich-ui-renderer.md) | JSON UI in AI replies (richUI registry, button actions), the legacy Grid, `/chatbotpreview` |
| [modules/rag-embed.md](modules/rag-embed.md) | The RAG knowledge-base embed: `public/rag-*.js`, `/rag`, `config/ragApi.ts` |

## Flows

| Doc | Read it when |
|---|---|
| [flows/widget-boot.md](flows/widget-boot.md) | Anything between the host page loading the script and the first rendered chat, including the 401 and re-login path |
| [flows/ai-message.md](flows/ai-message.md) | Anything between the user pressing send and the reply being rendered, on both the stream and non-stream paths |

## UI

| Doc | Read it when |
|---|---|
| [ui/routes.md](ui/routes.md) | Adding or changing a page |
| [ui/state.md](ui/state.md) | Reading or writing Redux, contexts, or browser storage |
| [ui/components.md](ui/components.md) | Finding a component, its override path, or the dead files to avoid |
| [ui/design-system.md](ui/design-system.md) | Colors, dark mode, daisyUI vs MUI, the runtime Tailwind CDN |

## Needs a human

Questions the code could not answer. Each one is marked `[!TODO]` in the linked doc.

- **Deploy and branches:**
  - how prod and dev are deployed, and where the env vars are set per environment ([environment](environment.md#build-and-deploy))
  - which branch deploys where, and how `main` and `testing` are kept in sync ([recipes](recipes.md))
- **Build:**
  - why TypeScript and ESLint errors are ignored in builds, and whether CI type-checks ([app-shell](modules/app-shell.md#why-it-is-built-this-way))
  - which ESLint config is intended ([conventions](conventions.md#style-the-linter-does-not-catch))
- **Legacy files:**
  - whether `public/chat-widget*.js`, `public/urlMonitor.js`, `hooks/coBrowser/` and `public/loader.html` can be deleted ([embed-scripts](modules/embed-scripts.md#leftover-files))
  - why the prod loader trusts `http://localhost:3000`, and why `interface_id` is used instead of `interfaceId` ([embed-scripts](modules/embed-scripts.md#why-it-is-built-this-way))
- **Backend contracts:**
  - where the rtlayer channel is built in the Python backend, and whether the hard-coded rtlayer keys are meant to be public ([api](api.md#rtlayer-ai-replies), [ai-chat](modules/ai-chat.md#why-it-is-built-this-way))
  - whether the backend also publishes stream replies on rtlayer ([ai-message](flows/ai-message.md), [ai-chat](modules/ai-chat.md#why-it-is-built-this-way))
  - whether an anonymous re-login returns the same `userId` ([widget-boot](flows/widget-boot.md))
- **Rich UI:**
  - what makes an agent reply with richUI JSON, and whether a schema exists ([rich-ui-renderer](modules/rich-ui-renderer.md#which-renderer-a-message-gets-assistantmessagetsx))
  - who embeds `/chatbotpreview`, and whether the legacy Grid branch can go ([rich-ui-renderer](modules/rich-ui-renderer.md))
- **Chat UI:**
  - whether the duplicate tree in the `Sidebar` drawer is intended ([chat-ui](modules/chat-ui.md#gotchas))
  - whether host `messageStyles` should apply to the current message cards ([chat-ui](modules/chat-ui.md#why-it-is-built-this-way))
- **RAG:**
  - whether Drive (viaSocket) support is coming back ([rag-embed](modules/rag-embed.md#unmerged-and-disabled-work))
  - which backend owns `/api/rag/*` and whether it enforces the chunk limits ([rag-embed](modules/rag-embed.md#why-it-is-built-this-way))
