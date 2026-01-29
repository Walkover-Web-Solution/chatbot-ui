## What is the feature?
Users can reply to a specific message inside the chat widget.

## Purpose of the feature
Helps users respond with context by linking their message to a previous message.

## Entry point : Message.tsx

## Code-level flow
- Reply button appears on message hover in `HumanOrBotMessage.tsx` and `UserMessage.tsx`.
- Clicking reply sets the reply state using `ReplyContext.tsx`.
- `ReplyPreview.tsx` shows the selected message above the input in `ChatbotTextField.tsx`.
- Sending a message passes the `replied_on` value through `useHelloIntegration.ts` to `helloApi.ts`.
- Reply state is cleared from `ReplyPreview.tsx` or automatically after sending.