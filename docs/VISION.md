---
covers: ["*"]
verified_at: 0afde6f
verified_on: 2026-11-04
---
# Product Vision & Strategic Direction

> [!IMPORTANT]
> Draft recovered from the repository at 0afde6f. An owner must review it before it is merged, because this file decides which requests are worked. Every "Not stated: an owner decides" line is an open question in [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md).

chatbot-ui is the GTWY AI chatbot that GTWY customers embed on their own sites: one script tag (`public/chatbot.js`) opens this Next.js app in an iframe, which talks to GTWY AI agents ("bridges") running in the GTWY Node and Python backends ([AGENTS.md](../AGENTS.md), [architecture](architecture.md)). The same app also serves a second embed, the RAG knowledge-base manager (`/rag`), through which a customer's users add documents to a GTWY knowledge base ([rag-embed](modules/rag-embed.md)).

## Authoritative Sources & Status

Sources used: [AGENTS.md](../AGENTS.md), every doc under [docs/](README.md) (verified at c7ace0c, 2026-10-20), `package.json`, the git history up to 0afde6f, and the open pull requests on 2026-11-04. `README.md` is the unchanged create-next-app template and `app/layout.tsx` still carries the template title ("Create Next App"), so neither states anything about the product. No PRD, roadmap or package description exists in the repository.

### Approved Direction

What the repository states as purpose or deliberate decisions:
- The product is an embeddable AI chat for GTWY customers' sites, configured by one script tag and loaded in an iframe ([architecture](architecture.md), [embed-scripts](modules/embed-scripts.md#why-it-is-built-this-way)).
- The host page controls the chat at runtime through script attributes, `window.*` functions (`SendDataToChatbot`, `askAi`, `setInput`) and postMessage events ([api](api.md)).
- GTWY is the only product this app serves. MSG91 Hello / widget mode was removed on purpose ("remove Hello/widget mode support", abed550, #236); its leftover loaders get no new features (AGENTS.md rule 2).
- AI text is never rendered as HTML (removed on purpose in b8b7b7e; AGENTS.md rule 13).
- Several embeds on one page or origin must not interfere with each other (embed namespace, 915dbb1; per-embed slices, c7943ce; AGENTS.md rules 9 and 10).
- The RAG knowledge-base embed is a separate feature that shares this deployment but not the chat loader, store or iframe ([rag-embed](modules/rag-embed.md)).

### Current Implementation

What the code does today, which is not necessarily intended ([architecture](architecture.md)):
- A browser-only Next.js 15 app with no server code of its own, deployed to Cloudflare Pages through next-on-pages.
- Replies arrive as an SSE stream or over rtlayer. They render as markdown, richUI JSON, tool calls, reasoning or planning cards ([ai-chat](modules/ai-chat.md), [rich-ui-renderer](modules/rich-ui-renderer.md)).
- Threads and sub-threads, history, model switching, plan mode, file and image upload, MCP config with auth headers (#265), header buttons, and host-supplied component overrides compiled in the browser (#247).
- A demo / test mode (`test_chatbot="true"`) with canned data (#259).
- The known gaps the docs list are current implementation, not direction: no origin checks on iframe listeners, `"*"` postMessage targets, type and lint errors ignored in builds, no automated tests, dead files ([embed-scripts](modules/embed-scripts.md#gotchas), [conventions](conventions.md)).

### Proposals & Roadmaps

No roadmap exists in the repository. Work in progress at 2026-11-04 (open PRs, not approved direction):
- #268 shared A/B experiment helpers.
- #260 model-switch fixes and generalized API error formatting.
- #255 deleted-chatbot error toast handling.
- #228 planning UI update.
- #226 handling of the maximum tool-call limit.
- Google Drive documents via viaSocket in the RAG embed: added on branch RAG_drive_support and reverted in ba3653f. The code is still commented out ([rag-embed](modules/rag-embed.md#unmerged-and-disabled-work)).

### Unknowns & Ambiguities

Questions the repository does not answer are listed in [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md). They include the vision-level questions this draft raises and the `[!TODO]` items already recorded in [docs/README.md](README.md#needs-a-human).

## Target Audience & Ideal Customer Profile (ICP)

**Primary persona: the GTWY customer's developer who embeds the chatbot.**
- Role: builds or runs a website or app (including React Native WebView hosts) for a business that has set up an AI agent in GTWY.
- Workflow: adds `<script id="chatbot-main-script" embedToken=… bridgeName=… threadId=…>`, signs the embed token on their own backend (or uses anonymous `interface_id` login), and then drives the chat from their page with `SendDataToChatbot`, `askAi` and the `MESSAGE_*` / `FRONT_END_ACTION` events ([api](api.md)).
- Technical level: comfortable with HTML, JavaScript and postMessage. Can sign a JWT, and can write JSX for component overrides.

**Secondary personas**
- End users of the customer's site, who chat with the agent, upload images or files, switch models when allowed, and answer plan-mode questions ([chat-ui](modules/chat-ui.md)). Their needs beyond what the code does: Not stated: an owner decides.
- The customer's users who manage knowledge-base documents through the RAG embed ([rag-embed](modules/rag-embed.md)).
- Admins and auditors: Not stated: an owner decides. Chatbot and agent configuration lives in the GTWY backend and frontend, not in this repo ([architecture](architecture.md#cross-repo-contracts)).

## Problems Solved & Value Proposition

| Customer problem | How the product solves it | What sets it apart |
|---|---|---|
| Putting a GTWY AI agent on a site without building a chat UI | One script tag opens a ready chat in an iframe, with launcher, layouts (`popup`, sliders, full space) and theme | Config is the tag itself; no build step on the host ([embed-scripts](modules/embed-scripts.md#why-it-is-built-this-way)) |
| The chat must know who the user is and what page context they are in | Signed `embedToken` login, `threadId`, `bridgeName` and `variables` from the host, updatable at runtime | The host can switch agents, threads and variables live with `SendDataToChatbot` |
| The host page must react to the chat | Iframe → host events (`MESSAGE_SENT`, `TOOL_CALL_RESULT`, `FRONT_END_ACTION`, `HEADER_BUTTON_PRESS`, …) | Agent replies can trigger host-side actions through richUI buttons ([rich-ui-renderer](modules/rich-ui-renderer.md)) |
| Replies need more than plain text | Markdown, richUI JSON components, tool-call, reasoning and planning cards, streamed as they arrive | Plan mode with clarifying questions and task plans ([ai-message](flows/ai-message.md)) |
| The chat must match the customer's brand | `themeColor`, dark mode, titles, icons, `messageStyles`, and JSX component overrides | Overrides replace chat components at runtime without a fork ([chat-ui](modules/chat-ui.md)) |
| A customer's users must feed documents to the agent's knowledge base | The RAG embed lists, adds, edits and deletes KB documents from the host page | Shares GTWY auth and backend with the chat ([rag-embed](modules/rag-embed.md)) |

Competitive differentiation against other products: Not stated: an owner decides.

## Core Principles & Design Philosophy

Each principle rests on a stated decision in the docs or git history. The trade-off it decides is given with it.

1. **The script tag is the contract.** Everything the iframe needs comes from the tag, the login response and `interfaceData`. *Trade-off:* host simplicity and backwards compatibility over clean APIs. Attributes, `window.*` names and message types are public and are not renamed casually, and every loader change goes into all copies ([embed-scripts](modules/embed-scripts.md), AGENTS.md rule 1).
2. **The host stays in control.** The host chooses agent, thread, variables, layout, theme and overrides, and hears every chat event. *Trade-off:* flexibility for the integrator over a fixed, opinionated UI. In return, overrides must not break the chat (AGENTS.md rule 14).
3. **Safe rendering of AI output.** AI text is never rendered as HTML, and rich-UI components must survive bad props. *Trade-off:* safety and resilience over richer free-form output ([rich-ui-renderer](modules/rich-ui-renderer.md#gotchas), AGENTS.md rule 13).
4. **Each embed is isolated.** Two chatbots or users on one page or origin must not share or clear each other's state. *Trade-off:* more complex keying of storage and Redux over simpler global state (AGENTS.md rules 6, 9 and 10).
5. **A thin client on GTWY backends.** The app has no server code, and agent logic, history and knowledge bases live in the GTWY backends. Cross-repo contracts (rtlayer channel, SSE event names, `interfaceDetails.config` keys) change on both sides together. *Trade-off:* this app is easy to deploy at the edge, but it cannot add capabilities the backend lacks ([architecture](architecture.md#cross-repo-contracts)). Whether "no server code" is a lasting rule or only today's state: Not stated: an owner decides.

## Strategic Priorities & Success Measures

- Top priorities: Not stated: an owner decides. The recent history (MCP auth headers, test mode, component overrides, plan mode, RAG chunk limits) shows where work has gone, not an approved ranking.
- Key success metrics: Not stated: an owner decides. The repo has no analytics, error reporting or stated targets ([conventions](conventions.md#errors-and-logging)).

## Boundaries & Non-Goals

Stated in the repository:
- No MSG91 Hello / human-support widget mode. It was removed in abed550, and `public/chat-widget*.js` and `public/urlMonitor.js` get no new features.
- No rendering of AI text as HTML.
- No backend in this repo: agent configuration, model calls, history storage and knowledge-base processing belong to the GTWY Node and Python backends.

Anti-patterns that break the vision:
- Changing a cross-repo contract (rtlayer channel name, SSE event names, `interfaceDetails.config` keys, script attributes) on one side only.
- State, storage keys or Redux actions that leak between embeds, or a network call in test mode without an `isTestChatbot` guard.
- A loader change in only one of the hand-kept copies.
- New host ↔ iframe message types that carry secrets or run code before origin checks exist ([conventions](conventions.md#layer-rules)).
- Rich-UI components or overrides that can crash the whole chat.

Whether the product should ever offer things like voice, human handoff, its own admin UI or analytics: Not stated: an owner decides.

## How Future Agents Must Evaluate Requests

1. Compare the request with the Approved Direction, the ICP, the Core Principles and the Boundaries & Non-Goals above. Do not judge it against its own wording, and do not treat Current Implementation or Proposals as approval.
2. If the request is unclear, improve it first: state the intended outcome, the persona it serves and the acceptance criteria before writing code.
3. If it conflicts with this file, explain the conflict, cite the section, and recommend declining it or changing it into a version that fits.
4. If it touches a point this file marks "Not stated: an owner decides", treat it as needing an owner decision and ask.
5. A deliberate change of direction must be explicit: update this file in the same change as the code, and never loosen it just to let a request through.
6. When a feature needs a backend capability that does not exist (a GTWY Node or Python endpoint, an rtlayer event, a config key), describe the needed contract in `docs/CONTRACTS.md` and report it as blocked. Never add mock endpoints, fake integrations or client-side stand-ins for backend behaviour.
