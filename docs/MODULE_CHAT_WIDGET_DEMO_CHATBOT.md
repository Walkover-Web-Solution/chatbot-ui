# Demo Chatbot Feature

## Overview

The Demo Chatbot feature enables a **non-persistent chat experience** within the Chat Widget.  
It is intended only for **testing and demonstration purposes**.

When this feature is active, the chat widget behaves as a temporary sandbox where no conversation data is retained.


## Feature Activation

- The frontend receives a configuration flag (`demo_widget`) as part of widget info.
- When `demo_widget` is set to `true`, the widget operates in **demo mode**.
- Demo mode behavior is entirely driven by frontend-consumed configuration.


## Frontend Behavior

When Demo Chatbot mode is enabled:

- No conversation history is persisted.
- No channels or sessions are stored.
- All chat-related data exists **only in memory** for the current page lifecycle.
- On page refresh or reload:
  - The chat widget resets completely.
  - A fresh chat experience is presented every time.

When Demo Chatbot mode is disabled:
- The widget behaves as a normal chat widget.
- Standard conversation and channel handling applies.


## State Management Rules

- Client-side state (e.g., Redux) may temporarily hold messages **only for UI rendering**.
- No demo chatbot data should be treated as durable or reusable.
- Demo mode state must be cleared automatically on reload or refresh.


## User Experience

- Users can freely interact with the chatbot.
- Conversations do not persist between sessions.
- Each page reload results in a clean, empty chat interface.
- Demo behavior is transparent to the end-user and requires no additional actions.

---

## Constraints

- Demo chatbot mode must not:
  - Persist conversations
  - Create or reuse channels
  - Store session identifiers for reuse
- Frontend must not attempt to recover or rehydrate demo chat state.

---

## AI Guidance

- Treat `demo_widget = true` as a **hard constraint**.
- Do NOT introduce persistence mechanisms for demo chatbot data.
- Do NOT reuse demo chatbot state across reloads.
- Keep demo chatbot logic isolated from normal chat flows.

---

## Testing Checklist

- [ ] Demo chatbot initializes when `demo_widget` is true
- [ ] No conversation history persists on refresh
- [ ] Channels are not reused in demo mode
- [ ] Chat resets completely on reload
- [ ] Normal behavior resumes when demo mode is disabled

---

## Conclusion

The Demo Chatbot feature provides a lightweight, non-persistent chat experience for testing and demonstrations.  
By enforcing strict non-storage behavior on the frontend, it ensures a clean and repeatable chat environment without impacting real chat workflows.
