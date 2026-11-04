---
covers: ["app/chatbot/**", "hoc/addUrlDataHoc.tsx", "store/index.js", "utils/embedNamespace.ts", "components/Chatbot/hooks/useChatActions.ts", "components/richUI/**", "utils/enums.ts"]
verified_at: c7ace0c
verified_on: 2026-10-20
---
# Glossary

| Term | Meaning | In code |
|---|---|---|
| bridge / slug | A GTWY AI agent. The host passes `bridgeName`; it is sent to the backend as `slugName`. Defaults to `root`. | `appInfo[tab].bridgeName`, `components/Chatbot/hooks/useReduxEffects.ts` |
| chatbot / interface | The embeddable chat configuration in GTWY that wraps one or more bridges. "Interface" in Redux means this config, not a UI. | `chatbot_id`, `Interface` slice (`store/interface/interfaceSlice.ts`) |
| thread | A conversation container chosen by the host (`threadId`). | `appInfo[tab].threadId` |
| sub-thread | One chat inside a thread, shown as an item in the drawer. The default sub-thread has the same id as the thread. "New Chat" is a client-only placeholder until the backend names it. | `appInfo[tab].subThreadId`, `Chat.subThreadId` |
| `interfaceDetails` | URL query parameter on `/chatbot`: JSON of the login response (`chatbot_id`, `userId`, `token`, `config`, `test_chatbot`). | `app/chatbot/layout.tsx` |
| `interfaceData` | The host→iframe postMessage type that carries the script attributes and `SendDataToChatbot` payloads. Different from `interfaceDetails`. | `hooks/GTWY/eventHandlers/embeddingScript/embeddingScriptEventHandler.ts` |
| `chatSessionId` | The `chatbot_id`: one session per embedded chatbot. | `draftData.chatSessionId` |
| `tabSessionId` | Two forms: the raw tab id in `draftData`, and the composite `<chatSessionId>_<rawTabId>` that components receive. See [app-shell](modules/app-shell.md#session-keys). | `hoc/addUrlDataHoc.tsx` |
| `urlData` | `{ chatSessionId, tabSessionId, ...appInfo[tab] }`, attached to every Redux action by middleware so reducers find their bucket. | `store/index.js:customMiddleware` |
| embed namespace | `<chatbot_id>_<userId>` prefix on sessionStorage keys so two embeds on one page don't collide. | `utils/embedNamespace.ts:getScopedKey` |
| test chatbot | Demo mode (`test_chatbot` in `interfaceDetails`): no token and canned replies. Subscribe, thread list, history and send are skipped. rtlayer still connects, and `useGetMoreChats` is not guarded ([ai-chat](modules/ai-chat.md#test-chatbot-mode)). | `appInfo[tab].isTestChatbot`, `utils/demoChatbotData.ts` |
| stream / `isStream` / `flag` | Three separate switches. `appInfo.stream` picks SSE versus rtlayer. `flag` (= `stream && !image_model`) is what the backend is told. `appInfo.isStream` gates plan mode. See [ai-message](flows/ai-message.md). | `components/Chatbot/hooks/useChatActions.ts:useSendMessage` |
| plan mode | `mode: "plan"` on sends. The backend replies with clarifying questions and a task plan, rendered as planning cards. | `components/Interface-Chatbot/Messages/PlanningTasksCard.tsx` |
| richUI | The JSON node-tree format (`{ type, ...props, children }`) that AI replies can use to render UI. | `components/richUI/RenderNode.js`, `components/richUI/componentRegistry.js` |
| component override | Host-supplied JSX that replaces a chat component at runtime, compiled in the browser. | `components/Interface-Chatbot/ChatbotDrawerParts/useComponentOverride.tsx` |
| Hello / chat-widget | MSG91's separate human-support widget. Its loaders (`public/chat-widget*.js`) are still in `public/`, but the iframe no longer supports it (removed in abed550). | `public/chat-widget.js` |
| `helloId` | Returned by the GTWY subscribe API, not by MSG91 Hello directly. Together with a uuid it forms the `HelloAgentAuth` localStorage value that `config/api.ts` sends. | `appInfo[tab].helloId`, `components/Chatbot/hooks/useChatActions.ts:useSubscribeChatbotDetails` |
| RAG / KB | The separate knowledge-base embed: a customer's users upload documents to a GTWY knowledge base. | `public/rag-prod.js`, `app/rag/page.tsx` |

## Id spaces

- `chatbot_id` (= `chatSessionId`) identifies the embed. `bridgeName` identifies the agent inside it. `threadId` and `subThreadId` identify conversations. All four go into the rtlayer channel name, so they must match what the backend uses.
- `userId` comes from the login response. When `threadId` or `subThreadId` is empty, `userId` takes its place in the rtlayer channel name. That is why the channel changes after the first thread list arrives ([widget-boot](flows/widget-boot.md)).
