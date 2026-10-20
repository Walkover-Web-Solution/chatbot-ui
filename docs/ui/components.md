---
covers: ["components/**"]
verified_at: c7ace0c
verified_on: 2026-10-20
---
# Components

All components live in `components/` and are imported through the `@/` alias (`@/components/...`). There is no shared primitive library: chat components use Tailwind + daisyUI classes directly, with MUI for a few controls (`TextField`, `IconButton`, `Snackbar`). How the tree fits together is in [chat-ui](../modules/chat-ui.md#tree); JSON-driven components are in [rich-ui-renderer](../modules/rich-ui-renderer.md).

## Chat components

The override path column is the key a host uses to replace that component at runtime ([chat-ui](../modules/chat-ui.md#component-overrides-12ff552-247)). Blank means it can't be overridden.

| Component | File | Use it for | Key props | Override path |
|---|---|---|---|---|
| `ChatbotHeader` | `components/Interface-Chatbot/ChatbotHeader.tsx` | Header bar: title, model picker, bridge switch, header buttons, minimize/fullscreen/close | `preview`, injected ids | `chatbotHeader`, `chatbotHeader.title`, `.closeButton`, `.minimizeButton`, `.menuIcon`, `.editIcon` |
| `AiServicesToSwitch` | `components/Interface-Chatbot/ChatbotHeader.tsx` | Model picker dropdown | `chatSessionId`, `tabSessionId` | |
| `ChatbotTextField` | `components/Interface-Chatbot/ChatbotTextField.tsx` | Input, send, uploads, emoji, suggestion chips; handles `open` and `setInput` messages | `className`, injected ids | `chatbotTextField`, `.sendButton`, `.uploadButton` |
| `EmojiSelector` | `components/Interface-Chatbot/EmojiSelector.tsx` | frimousse emoji popover | `isVisible`, `onEmojiSelect`, `onClose` | `emojiSelector` |
| `ChatbotDrawer` → `Sidebar` | `components/Interface-Chatbot/ChatbotDrawer.tsx`, `components/Interface-Chatbot/ChatbotDrawerParts/Sidebar.tsx` | Thread drawer, new chat, sub-thread switch | `preview`, ids, `subThreadId`, `bridgeName`, `threadId` | `sidebar` |
| `SidebarHeader` / `SidebarBody` / `ThreadList` / `SidebarFooter` | `components/Interface-Chatbot/ChatbotDrawerParts/` | Drawer parts | `subThreadList`, `subThreadId`, `onSelect` | `sidebar.header`, `sidebar.body`, `sidebar.body.threadList`, `sidebar.body.threadList.item`, `sidebar.footer` |
| `MessageList` | `components/Interface-Chatbot/Messages/MessageList.tsx` | Reverse-scrolling list with infinite scroll and auto-scroll while streaming | `chatSessionId`, `currentChannelId` | `messageList` |
| `Message` | `components/Interface-Chatbot/Messages/Message.tsx` | Routes one record to the right card | `message`, `prevTime`, `isLastMessage` | |
| `AssistantMessageCard` | `components/Interface-Chatbot/Messages/AssistantMessage.tsx` | AI bubble: markdown, rich UI, tool calls, reasoning, planning, review phases, feedback | `message`, `isError`, `defaultErrorMessage` | `messageList.assistantMessage` |
| `UserMessageCard` | `components/Interface-Chatbot/Messages/UserMessage.tsx` | User bubble with attachments | `message`, `backgroundColor`, `textColor` | `messageList.userMessage` |
| `HumanOrBotMessageCard` | `components/Interface-Chatbot/Messages/HumanOrBotMessage.tsx` | Legacy Human/Bot bubbles (content-less records only) | `message`, `isBot` | `messageList.humanMessage`, `messageList.botMessage` |
| `PlanningQuestionsCard` | `components/Interface-Chatbot/Messages/PlanningQuestionsCard.tsx` | Plan-mode clarifying questions | `questions`, `isHistorical`, `onSubmit` | |
| `PlanningTasksCard` | `components/Interface-Chatbot/Messages/PlanningTasksCard.tsx` | Plan tasks, execution state, approve/respond/revise | `plan`, `isStreaming`, `onAction` | |
| `ReasoningAccordion`, `WorkingAccordion`, `ToolCallAccordion`, `ReviewPhaseAccordion` | `components/Interface-Chatbot/Messages/` | Collapsible reasoning, tool calls and reviewer rounds | `reasoning`, `toolsData`, `reviewPhases`, `isStreaming` | |
| `StarterQuestions` | `components/Interface-Chatbot/Messages/StarterQuestions.tsx` | Starter cards on an empty chat | reads `Chat.starterQuestions` | |
| `ImageWithFallback` | `components/Interface-Chatbot/Messages/ImageWithFallback.tsx` | Attachment preview by extension, retry with `permanentUrl`, download | `src`, `permanentUrl`, `canDownload` | |
| `CodeBlock` | `components/Interface-Chatbot/Interface-Markdown/CodeBlock.tsx` | Highlighted code, copy, HTML preview in a sandboxed iframe | `inline`, `className`, `showCopy` | |
| Markdown renderers | `components/Interface-Chatbot/Interface-Markdown/MarkdownUtitily.tsx` | Links, lists, tables for react-markdown | standard HTML props | |
| `MoveToDownButton` | `components/Interface-Chatbot/MoveToDownButton.tsx` | Scroll-to-bottom button | `movetoDown`, `showScrollButton` | |
| toasts | `components/customToast.js` | `successToast`, `errorToast`, `warningToast`, `infoToast` (3 s, stacked, de-duplicated) | `message` | |

Rich-UI node components (`components/richUI/components/`) are listed with their props in [rich-ui-renderer](../modules/rich-ui-renderer.md#richui-node-types-componentregistry).

## Dead components

Nothing imports these. Some would break the bundle if imported, because they import files that no longer exist (TypeScript errors are ignored at build time, see [environment](../environment.md)).

| File | Problem |
|---|---|
| `components/ThreadSidebar.tsx` | empty placeholder |
| `components/Interface-Chatbot/Messages/DefaultQuestions.tsx` | broken (typo, missing CSS import) |
| `components/Interface-Chatbot/ChatbotHeaderTab.tsx` | returns `null` |
| `components/FormComponent.tsx` | imports a removed Hello API module |
| `components/Chatbot-Preview/ChatbotPreview.tsx`, `components/ChatbotPreview.tsx` | old preview shells |
| `components/Grid/ReactGridItemWrapper.tsx` | imports a removed hook |

## Rules

- In an overridable component, call `useComponentOverride` first and keep every other hook above the `if (Override) return …` early return. `SidebarHeader.tsx` breaks this today: toggling its override at runtime changes the hook order.
- Anything rendered inside assistant `prose` content needs the `not-prose` class, or the typography plugin restyles it (66f1103).
- Keep the `data-testid="chatbot-…"` attributes; external tests select on them.
- A new markdown renderer must be added to all three react-markdown component maps: the two in `AssistantMessage.tsx` and the one in `InterfaceMarkdown.tsx` (f82f54d had to touch all three).
- Copy-to-clipboard must fall back to `document.execCommand("copy")` inside the iframe, because the Permissions Policy blocks `navigator.clipboard` in cross-origin iframes (see `CodeBlock.tsx`).
- Icons: lucide-react first, `@mui/icons-material` in a few older places.
