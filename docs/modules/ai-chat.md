---
covers: ["components/Chatbot/**", "store/chat/**", "config/api.ts", "utils/dataConvertWrappers/**", "utils/errorFormatter.ts", "utils/demoChatbotData.ts"]
verified_at: c7ace0c
verified_on: 2026-10-20
---
# AI chat (conversation with a GTWY agent)

The iframe side of a conversation with a GTWY AI agent ("bridge"): send a message to the Python backend, read the reply as a server-sent-event (SSE) stream (or over rtlayer when streaming is off), keep messages per sub-thread in the Redux `Chat` slice, page through history, switch sub-threads and models, and fake all of it in test-chatbot mode. `components/Chatbot/Chatbot.tsx` mounts the hooks once. The components in [chat-ui](./chat-ui.md) read the `Chat` slice and call the action hooks.

| File | Role |
|---|---|
| `components/Chatbot/Chatbot.tsx` | Mounts `useChatEffects`, `useReduxEffects`, `useRtlayerEventManager`; provides `MessageContext` (`messageRef`, `timeoutIdRef`); shows the empty view or the message list. |
| `components/Chatbot/hooks/useChatActions.ts` | All network-backed hooks: send, history, paging, threads, subscribe, feedback. The busiest file in the area. |
| `components/Chatbot/hooks/useChatEffects.ts` | When to call them: subscribe, thread list, history reload, demo-mode bootstrap, `window` `message` listener for `askAi` / `refresh`. |
| `components/Chatbot/hooks/useRtlayerEventManager.tsx` | One rtlayer WebSocket client per mount; listens on the conversation channel and turns payloads into `Chat` actions. |
| `components/Chatbot/hooks/useReduxEffects.ts` | Copies `threadId`, `subThreadId`, `bridgeName`, `versionId`, `headerButtons` from `appInfo` / `Interface` into the `Chat` slice. |
| `components/Chatbot/hooks/useReduxManagement.ts` | `useReduxStateManagement`: selector returning `currentChatId` and leftovers from Hello mode. |
| `components/Chatbot/hooks/useTabData.ts` | Per-tab `appInfo` fields; used by `hoc/addUrlDataHoc.tsx`. |
| `components/Chatbot/hooks/useColor.ts`, `useScreenSize.ts` | Theme colour and `max-width: 1023px` breakpoint helpers, used across the UI. |
| `components/Chatbot/hooks/useTabVisibility.ts` | Unused. |
| `components/Chatbot/hooks/chatTypes.ts` | Only `SendMessagePayloadType` is live. The rest belongs to the dead reducer below. |
| `components/Chatbot/hooks/chatReducer.ts` | Dead. Nothing imports it (see [Why](#why-it-is-built-this-way)). |
| `store/chat/chatReducerV2.ts` | The live `Chat` state: `initialChatState` and Immer case reducers. |
| `store/chat/chatSlice.ts` | `createSlice({ name: "Chat" })` over `chatReducerV2`; exports the action creators. |
| `config/api.ts` | HTTP helpers for both GTWY backends. Seven are used by this area, `uploadImage` / `getEmebedToken` elsewhere, the rest are unused. |
| `utils/dataConvertWrappers/makeGenericDataFormatUtility.tsx` | `convertChatHistoryToGenericFormat`: history rows to `Chat` messages, rebuilding plan-mode `planning`. |
| `utils/demoChatbotData.ts` | Canned answers, starter questions and follow-ups for test-chatbot mode. |
| `utils/errorFormatter.ts` | `formatErrorMessage`. Not used by chat; only `app/rag/page.tsx` calls it. |

## How it works

### Ids and where state lives
- `chatSessionId` is the chatbot id; `tabSessionId` (from `ChatContext`) is already `${chatSessionId}_${tab_session_id}`. See [app-shell](./app-shell.md).
- Source of truth for ids and flags: `state.appInfo[tabSessionId]` (`threadId`, `subThreadId`, `bridgeName`, `versionId`, `userId`, `stream`, `image_model`, `mcpConfig`, `defaultErrorMessage`, `isTestChatbot`). The hooks read from here.
- Thread list, variables and the selected model: `state.Interface[`${chatSessionId}_${tabSessionId}`]` (`interfaceContext[bridgeName].threadList[threadId]`, `interfaceContext[bridgeName].variables`, `selectedAiServiceAndModal`).
- Messages: `state.Chat`, one global slice per iframe, keyed inside by sub-thread id. Its reducers find the sub-thread through `state.Chat.subThreadId`, which `useReduxEffects` copies from `appInfo` in an effect.

### Boot (`useChatEffects`)
1. `bridgeName` set and not test mode → `useSubscribeChatbotDetails`. It re-runs when `serviceChanged`, `modelChanged`, `versionId`, `stream`, `widget` or `image_model` change.
2. `threadId` and `bridgeName` set → `useFetchAllThreads`.
3. Whenever `threadId`, `bridgeName` or `subThreadId` changes → `useGetInitialChatHistory` (skip check is broken, see Gotchas).
4. Host `postMessage` `{ type: "refresh" }` reloads history; `{ type: "askAi", data }` calls `sendMessage` (string = message; object = `askAi`/`message`, `variables`, `threadId`, `bridgeName`, sent after 500 ms). While `Chat.loading` is true it shows "Please wait for the response from AI". Host-side API: [embed-scripts](./embed-scripts.md).

### Exported hooks in `useChatActions.ts`

| Hook | Calls | Dispatches |
|---|---|---|
| `useChatContext` | `ChatContext` | — (throws outside the provider) |
| `useFetchAllThreads` | `getAllThreadsApi` | `setThreads({ bridgeName, threadId, threadList })` |
| `useSubscribeChatbotDetails` | `getSubscribeChatbotDetailsApi`, then `getServiceModelsApi` per `supportedServices` entry | `setSubscribeChatbotDetailsInChatSession(response)`, `setDataInAppInfoReducer({ stream, isStream, files, vision, image_model, supportedServices, helloId })`, `setServiceModels`; writes localStorage `HelloAgentAuth` when the response has `helloId` and `uuid` |
| `useGetInitialChatHistory` | `getPreviousMessage(threadId, bridgeName, 1, subThreadId)` | `setChatsLoading`, `setInitialMessages`, `setData({ currentPage: 1, hasMoreMessages })`, `setStarterQuestions` |
| `useGetMoreChats` | `getPreviousMessage(..., currentPage + 1, ...)` | `setIsFetching`, `setPaginateMessages`, `setData({ currentPage, hasMoreMessages })` |
| `useSendMessage` | `streamDataToAction` or `sendDataToAction`; demo data in test mode | see below |
| `useMessageFeedback` | `sendFeedbackAction({ messageId, feedbackStatus })` | `updateSingleMessage({ messageId: reduxMsgId, data: { user_feedback } })` |
| `useChatActions` | — | thin wrappers: `setToggleDrawer`, `setLoading`, `setChatsLoading`, `setImages`, `setOptions`, `setNewMessage` |

Subscribe derives the flags from `response.mode` (array or comma string): `stream` = mode has `stream` or `response.stream`/`isStream`; same pattern for `files`, `vision`, `image_model`. Model types matching `/fine[\s_-]?tun/i` or `/^image/i` are dropped before `setServiceModels`.

### Sending (`useSendMessage`)
Callers: `ChatbotTextField.tsx` (adds `mode: "plan"` in planning mode), `StarterQuestions.tsx`, `AssistantMessage.tsx` (follow-ups, richUI `reply` buttons, plan approve / respond / revise), and `askAi`.

1. `setNewMessage(true)`, `setError(null)`. Text = `message` arg or the input ref, trimmed. `Chat.images` is split into `files` (`.pdf`) and `images` (the rest). Return if no text and no image.
2. Clear input, `setLoading(true)`, clear `options` and `images`.
3. Unless it is an inline plan request (plan approve/execute, plan revise with `skipUserEcho`, or `respond`): start a 600 000 ms timeout and add an optimistic message with `updateLastAssistantMessage({ id: tempId, isNewMessage: true, user, user_urls, content: "", wait: true })`. The user text and the reply share one message object.
4. Build the payload (shape in [Contracts](#contracts)) and emit `MESSAGE_SENT` to the host.
5. Test mode → demo branch (below), return.
6. `stream === false` or `"false"` → `sendDataToAction(payload)` (axios POST), then return. The reply comes over rtlayer.
7. Otherwise `streamDataToAction(payload, onEvent)`: `fetch` POST, read `data: {json}` lines, call `onEvent` per event.
8. If the stream call fails (not aborted): with `defaultErrorMessage` set, show it on the last message; otherwise `removeMessages({ numberOfMessages: 2 })`. Then `setError(rawErr)`.

SSE events (`StreamEvent` in `config/api.ts`) and what `onEvent` does:

| `event` | Effect |
|---|---|
| `start` | Normal send: clear timeout; replace the temp message id with `message_id`; `isStreaming: true`. Inline plan / `respond`: only `updatePlanningExecutionState`. |
| `delta` | Routed in order: review streaming → `appendReviewDelta`; execution active → execution JSON events (`task_started`, `task_completed`, `task_failed`, `task_error`, `task_waiting_for_user`, `plan_paused`, `synthesizer_start`, `synthesizer_done`); planning active or `mode === "plan"` → plan buffer; `respond` → dropped; **tool call pending → dropped**; JSON `synthesizer_chunk` or `{ message_to_user }` → dropped; text with `"state"` and `"planning"`/`"tasks"` → plan buffer; else `appendLastAssistantMessageChunk`. |
| `reasoning` | `appendReasoningChunk` |
| `tool_call` | `appendToolCall` (status `calling`); sets the pending flag |
| `tool_result` | `updateToolResult` (status `done`); clears the pending flag; emits `TOOL_CALL_RESULT` |
| `planning`, `execution`, `task_delta`, `task_reasoning` | `setPlanningData` / `updatePlanningExecutionState` on the newest message |
| `review_phase` | `setReviewData` (`reviewer_start`, `reviewer_done`, `main_rerun_start`) |
| `template_response` | Final message with `template_metadata`; `setLoading(false)` |
| `error` | Shown text: `message_to_user` from JSON error, else the raw error, overridden by `defaultErrorMessage`. Sets `error` on the message (unless a review phase ran); emits `MESSAGE_RECEIVED_WITH_ERROR`. |
| `done` | Finalize plan buffer; attach `response.data.image_urls` as `image_urls`/`llm_urls`; paused plans stay paused; else merge `response.data` into the message with `isStreaming: false`; emit `MESSAGE_RECEIVED`; `setLoading(false)`. |

The plan-mode rendering of these states is in [chat-ui](./chat-ui.md).

### Receiving over rtlayer (`useRtlayerEventManager`)
`useWebSocketClient` creates the client from `rtlayer-client` with keys hard-coded in that function (do not copy them). It closes the socket on unmount and on `pagehide` / `beforeunload`. The listener channel is:

```ts
(chatSessionId + (threadId || userId) + (subThreadId || userId)).replace(/ /g, "_")
```

It is re-attached when `chatSessionId`, `userId`, `threadId` or `subThreadId` changes. `handleMessageRTLayer` parses each message; first match wins:

| Payload | Action |
|---|---|
| `status === "connected"` | ignored |
| `event: "start"` | `updateLastAssistantMessage({ isStreaming: true, content: "", id: message_id })` |
| `event: "delta"` | `appendLastAssistantMessageChunk` (no tool-call suppression here) |
| `event: "tool_result"` | emit `TOOL_CALL_RESULT` only |
| `event: "error"` | show `defaultErrorMessage` or `error`/`fallback_error`; stop loading; clear timeout |
| `response.function_call` + `result` | emit `TOOL_CALL_RESULT` |
| `response.function_call`, no `message` | placeholder "Running " with `Name` (tool names), `wait: true` |
| `response.function_call` + `message` | placeholder with that message |
| no `response.data`, top-level `error` | error text (or `defaultErrorMessage`); stop loading |
| `data.role === "reset"`, no `data.mode` | ignored |
| `data.suggestions` defined | `setOptions(suggestions)` (follow-up chips) |
| `data.display_name` | `setThreads({ newThreadData: data, threadId: data.thread_id })`: names the new sub-thread |
| any other `data` | `updateLastAssistantMessage({ ...data, isStreaming: false, wait: false })`; emit `MESSAGE_RECEIVED`; stop loading |

### Threads and sub-threads
- A thread (`threadId`) comes from the host. It holds sub-threads; the drawer lists them as chats. The default sub-thread has `sub_thread_id === thread_id`.
- List: `setThreads` (in `store/interface/interfaceReducer.ts`) stores `threadList[threadId]`; an empty list gets one synthetic `{ thread_id, sub_thread_id: threadId, display_name: threadId }`. `store/appInfo/appInfoSlice.ts` also handles `setThreads`: it keeps the current `subThreadId` if listed, else picks one. With `newThreadData` it **always** switches `subThreadId` to that sub-thread.
- New chat (commit 6169cb7, `Sidebar.tsx` and `ChatbotHeader.tsx` `handleCreateNewSubThread`): client only. Prepends `{ sub_thread_id: createRandomId(), display_name: "New Chat", newChat }`. If the top entry is already an unused new chat, it switches to it instead of creating another. The first send has `thread_flag: true`; the backend then publishes `display_name` over rtlayer, which replaces the placeholder.
- Switch: `setDataInAppInfoReducer({ subThreadId })` → history reload and rtlayer channel change.

### History paging
- `getPreviousMessage` → `GET {NEXT_PUBLIC_API_BASE_URL}/api/history/{threadId}/{bridgeName}?sub_thread_id=&pageNo=&limit=` with `limit = PAGE_SIZE.gtwy` (40, `utils/enums.ts`). It reverses `data` so index 0 is newest and returns `starterQuestion` too.
- `hasMoreMessages = page length >= PAGE_SIZE.gtwy`. `MessageList.tsx` calls `useGetMoreChats` from its infinite scroll; `setPaginateMessages` appends older, de-duplicated ids at the end.

### Model switch
Shown when `Interface.allowModalSwitch` is true (from `config.allowModalSwitch` in `app/chatbot/layout.tsx` or the host). Options come from `serviceModels` (subscribe), `modelVisibilityConfig` (`config.models`) or defaults; `components/Interface-Chatbot/ChatbotHeader.tsx:AiServicesToSwitch` auto-selects `defaultModel` or the first option (commits 11f72dc, 46c4501). `useSendMessage` then sends `service` and `configuration.model` on every message.

### Test-chatbot mode
Loader attribute `test_chatbot="true"` → `interfaceDetails.test_chatbot` → `appInfo.isTestChatbot` (commits dc0ebf3, c3bcdae). `app/chatbot/page.tsx` accepts it without a token. Then:
- subscribe, thread list and initial history are skipped; `useChatEffects` sets `threadId = demo-thread-{chatSessionId}`, `subThreadId = demo-subthread-{chatSessionId}`, `DEMO_STARTER_QUESTIONS`.
- `sendMessage` uses `getDemoResponse`: "table"/"card" return richUI JSON, "stream" returns a long text, else markdown. With "stream" in the text it streams word by word (`isStreamingDemoRequest`, 12 ms per token); otherwise one chunk after 600 ms. Then `getDemoFollowUpSuggestions` fills the chips.

### Images and files
`ChatbotTextField.tsx` uploads each file with `uploadImage({ formData })` → `POST {NEXT_PUBLIC_PYTHON_API_BASE_URL}/image/processing/` and stores the returned `image_url` in `Chat.images`. PDFs use the same route. Commit 28c85a4 ("image compression") fixed visual squashing (`object-cover` to `object-contain`), not file size.

## Contracts

Send payload (`useSendMessage`), POSTed to `{NEXT_PUBLIC_PYTHON_API_BASE_URL}/chatbot/{chatBotId}/sendMessage` by both transports:

```ts
{
  message: string, images: string[], files: string[] /* .pdf urls */, userId: string | null,
  flag: boolean,                      // stream && !image_model
  interfaceContextData: { ...variables, ...customVariables },
  threadId: string, subThreadId: string, slugName: string,
  thread_flag: boolean,               // first message of the default or a "New Chat" sub-thread
  chatBotId: string,                  // chatSessionId
  version_id: string | null,          // "null" string becomes null
  action?: "approve" | "execute" | "respond", mode?: "plan", task_id?: string, // plan mode
  service?: string, configuration?: { model?: string, mcp_config?: { servers: mcpConfig } }
}
```

`Chat` state (`store/chat/chatReducerV2.ts:initialChatState`):

```ts
{
  messageIds: { [subThreadId]: string[] },              // index 0 = NEWEST
  msgIdAndDataMap: { [subThreadId]: { [id]: Message } },
  starterQuestions: string[], options: string[] /* follow-up chips */, images: string[],
  loading: boolean,      // reply in flight; blocks send and askAi
  chatsLoading: boolean, // first history page
  isFetching: boolean,   // next history page
  currentPage: number, hasMoreMessages: boolean /* starts true */, newMessage: boolean /* scroll to bottom */,
  threadId, subThreadId, bridgeName, bridgeVersionId: string, // mirrors of appInfo
  headerButtons: any[], isToggledrawer: boolean, error: string | null,
  messages: [], isTyping: {}, skip: 1, open?: boolean   // leftovers
}
```

One `Message` holds a user turn and its reply:

```ts
{
  id: string, message_id?: string, role: "assistant",
  user?: string, user_urls?: string[],                  // user side
  content: string, reasoning?: string, llm_message?: any, llm_urls?: string[], image_urls?: string[],
  wait?: boolean, isStreaming?: boolean, timeOut?: boolean, error?: string, finish_reason?: string,
  tools_data?: { [call_id]: { name, args, status: "calling" | "done", result: string | null } },
  planning?: { plan, rawPlan?, planHistory: [], execution: { state, tasks: { [id]: { status, result, reasoning, error } } }, currentAnswers? },
  review_phases?: { phase, round, passed?, reason?, reviewContent?, isStreaming?, snapshotContent? }[],
  template_metadata?: object, user_feedback?: number, isPlanningLoading?: boolean, isSynthesizerLoading?: boolean
}
```

Reducer invariants:
- `updateLastAssistantMessage` with `isNewMessage` prepends; without it, it replaces index 0, merges the old data in, and deletes the old id if it changed.
- `appendLastAssistantMessageChunk`, `appendReasoningChunk`, `setPlanningData`, `updatePlanningExecutionState`, `appendToolCall`, `updateToolResult`, `setReviewData`, `appendReviewDelta` all act on index 0 of `state.Chat.subThreadId`.
- `updateSingleMessage` merges into one id; it is a no-op if the id is missing.
- `setPlanningData` archives the previous plan's questions and answers into `planHistory` once `currentAnswers` is set.

Host events emitted: `MESSAGE_SENT`, `MESSAGE_RECEIVED`, `MESSAGE_RECEIVED_WITH_ERROR`, `TOOL_CALL_RESULT` (table in [api](../api.md)). Endpoints: [api](../api.md). Env vars `NEXT_PUBLIC_API_BASE_URL` (Node) and `NEXT_PUBLIC_PYTHON_API_BASE_URL` (Python): [environment](../environment.md).

Unused `config/api.ts` exports (no importer at c7ace0c): `getAllInterfaceApi`, `createInterfaceApi`, `updateInterfaceApi`, `updateInterfaceActionsApi`, `updateInterfaceDetailsApi`, `deleteInterfaceApi`, `getInterfaceByIdApi`, `deleteComponentOrGridApi`, `performChatAction`, `loginUser`, `getHelloChatsApi`, `createScripts`, `createNewThreadApi`, `sendMessage` (the api one, not the hook), `allChats`, `getAccessToken`, `getTemplateFlowList`, and the `StreamEvent` type outside the file.

## Gotchas

> [!WARNING]
> Streaming is SSE over `fetch` in `streamDataToAction`, not rtlayer. `fetch` skips `utils/interceptor.ts`: no 401 redirect, no network retry, and the `Authorization` header is set by hand from sessionStorage `interfaceToken`. rtlayer carries the reply when `stream` is false. Thread names (`display_name`) and follow-up `suggestions` are handled only by the rtlayer listener, in both modes.

> [!WARNING]
> Non-stream path: `useSendMessage` ignores the result of `sendDataToAction`. On an HTTP failure the message stays `wait: true` and `loading` stays true until an rtlayer error or the 10-minute timeout. The axios interceptor also retries once on a network error, which can send the message twice.

> [!WARNING]
> Nothing aborts a stream. `useSendMessage` never passes a `signal` to `streamDataToAction`. If the user switches sub-thread mid-reply, later deltas land on index 0 of the **new** sub-thread, because reducers read `state.Chat.subThreadId` at dispatch time.

> [!WARNING]
> The rtlayer channel string must match what the GTWY Python backend publishes to. Changing ids, their order or the space rule silently stops non-stream replies and thread renames.

> [!WARNING]
> The rtlayer `display_name` branch dispatches `setThreads({ newThreadData })`, and the appInfo extra reducer then switches `subThreadId` to that sub-thread, even if the user has since moved to another chat.

> [!WARNING]
> `useChatEffects` means to skip history for a fresh "New Chat" but checks `threadList?.[0]?.subThread_id` (typo for `sub_thread_id`). The skip never fires, so a new chat always requests empty history.

> [!WARNING]
> `getPreviousMessage` uses one module-level `AbortController`: every call aborts the one in flight (a page-2 load during a sub-thread switch). On error it returns `[]`, so destructuring gives `previousChats === undefined`; callers check `Array.isArray`.

> [!WARNING]
> The timeout dispatches `updateLastAssistantMessage` without an `id`, so index 0 becomes `undefined` and the map gets an `"undefined"` key. It renders, but `updateSingleMessage` cannot target it.

> [!WARNING]
> `defaultErrorMessage` replaces the visible error text everywhere (SSE, rtlayer, failed send). The raw error stays in `message.error` and `Chat.error`. With it unset, a failed stream call removes the optimistic message (`numberOfMessages: 2` removes two ids, but one message holds both turns, so the previous message goes too).

> [!WARNING]
> `useSubscribeChatbotDetails` always writes `stream` from the bridge's mode, and it re-runs when `stream` changes. A host `stream` override via `SendDataToChatbot` is overwritten once subscribe answers.

> [!WARNING]
> In test mode `useGetMoreChats` has no `isTestChatbot` guard and `hasMoreMessages` starts `true`, so an infinite-scroll trigger can call the real history API with demo ids and no token.

> [!WARNING]
> `latestMessageId` in `useSendMessage` is captured when the hook rendered. For a normal send it is the message **before** the new one; the synthesizer branches prefer it over `streamMessageId`.

> [!WARNING]
> `newChat` is the string `"true"` from `Sidebar.tsx` and boolean `true` from `ChatbotHeader.tsx`. Test it for truthiness, never `=== true`.

> [!WARNING]
> `chatSlice.ts` exports `setMessageTimeout`, which has no reducer in `chatReducerV2.ts`, so it is `undefined`. `setHelloId`, `setOpenHelloForm`, `setHelloEventMessage`, `setTyping`, `clearImages`, `setCurrentPage`, `setHasMoreMessages`, `resetState` remain from Hello mode or are unused. `SendMessagePayloadType.silent` and `apiCall` are ignored by `useSendMessage`.

> [!WARNING]
> `Chatbot.tsx` reads `isDefaultNavigateToChatScreen` from `useReduxStateManagement`, which does not return it, so that effect never runs.

## Why it is built this way

- **Two reducers, one live.** Chat state was once a local React useReducer over `components/Chatbot/hooks/chatReducer.ts`. Commit 2da4094 ("storing data in redux instead of useReducer") moved it to the Redux `Chat` slice (`chatReducerV2`), so hooks and components select it instead of passing it through context. Evidence the old one is dead: no file imports `chatReducer.ts`, and `store/combineReducer.js` mounts `store/chat/chatSlice.ts`. Commit abed550 (removing Hello mode) trimmed both but kept the old file. Edit `chatReducerV2.ts` only.
- **One message = user turn + reply.** Commit f0e989a moved history to `/api/history` with `user` and `llm_message` in one record, and the live path matches it (`user` on the optimistic message). `Message.tsx` splits it into two cards.
- **SSE added beside rtlayer** (commits 9fc1f40, e429c4e): token streaming, tool calls and plan events need ordered events per request. rtlayer stays for non-stream bridges and backend-pushed updates.
- **Deltas dropped during tool calls** (commit 84dbccb): text the model writes between `tool_call` and `tool_result` is intermediate and should not appear in the final answer.
- **Close the socket on unload** (commit 877926c, #261): React unmount cleanup does not run when the tab closes or the host navigates, so the rtlayer connection leaked.
- **Test-chatbot mode** (dc0ebf3, #259; c3bcdae): lets the embed run with no token or bridge and show markdown, richUI and streaming.
- **10-minute reply timeout** (commit 5f9a043, #183): raised from 4 minutes because plan execution runs many tasks in one request. Inline plan requests start no timeout at all.
- **`defaultErrorMessage`** (commit 61f149f, #230): lets the embedder hide raw backend errors from end users.

> [!TODO] Needs a human: in stream mode, does the Python backend also publish the final `response.data` on rtlayer? If yes, the catch-all rtlayer branch rewrites the message a second time.

> [!TODO] Needs a human: are the hard-coded rtlayer keys meant to be public, or should they move to env?

## Changing it safely

- New `Chat` field or action: add it to `ChatState`, `initialChatState` and a reducer in `store/chat/chatReducerV2.ts`, then export it from `store/chat/chatSlice.ts`. `Chat` is not persisted and not cross-tab synced (`store/index.js`), so it resets on reload.
- New SSE event: add it to `StreamEvent` in `config/api.ts` and a `case` in the `onEvent` switch. Decide whether `delta`s around it must be suppressed. Send `setLoading(false)` and clear `timeoutIdRef` on every terminal path.
- New rtlayer payload type: add the branch above the catch-all `!!data` case, or it is treated as the final answer.
- New payload field: add it in `useSendMessage` and confirm the Python backend accepts it. Host data should go in `interfaceContextData` (variables), not a new top-level key.
- Test-mode parity: every new network call in these hooks needs an `isTestChatbot` guard.
- Check by hand: with a stream bridge, send a message and watch one `sendMessage` request with `text/event-stream`; with `stream` false, watch the reply arrive on the WebSocket; create a new chat and see it renamed; scroll above 40 messages to load page 2; load with `test_chatbot="true"` and try "Show me streaming".

Related: [chat-ui](./chat-ui.md), [rich-ui-renderer](./rich-ui-renderer.md), [AI message flow](../flows/ai-message.md), [app-shell](./app-shell.md), [embed-scripts](./embed-scripts.md).
