# Reply to Message Feature

## Overview
The reply to message feature allows users to reply to specific messages in the chatbot interface. When a user replies to a message, the `replied_on` field is sent to the API with the message ID of the message being replied to.

## Architecture

### Components Created/Modified

#### 1. **ReplyPreview Component** (`/components/Interface-Chatbot/ReplyPreview.tsx`)
- Displays a preview of the message being replied to
- Shows sender name (Bot/User/Agent name)
- Truncates long messages with ellipsis
- Includes close button to cancel reply
- Styled with blue theme for visual clarity

#### 2. **ReplyContext** (`/components/Interface-Chatbot/contexts/ReplyContext.tsx`)
- React Context for managing reply state across components
- Provides `replyToMessage`, `setReplyToMessage`, and `clearReply` functions
- Manages the currently selected message for reply

#### 3. **HumanOrBotMessage Component** (Modified)
- Added hover-triggered reply button
- Reply button appears on message hover with smooth animation
- Clicking reply button sets the message in reply context
- Extracts message ID from `message_id` or `id` field

#### 4. **ChatbotTextField Component** (Modified)
- Integrated ReplyPreview component
- Shows reply preview above input when replying
- Passes reply message ID to send message hooks
- Clears reply state after sending message

#### 5. **ChatbotWrapper Component** (Modified)
- Wrapped with ReplyProvider to provide reply context to all child components

### API Integration

#### 6. **sendMessageToHelloApi Function** (Modified in `/config/helloApi.ts`)
- Added `replied_on` parameter to function signature
- Includes `replied_on` in API payload when provided
- Maintains backward compatibility when no reply is specified

#### 7. **Hello Integration Hooks** (Modified in `/components/Chatbot/hooks/useHelloIntegration.ts`)
- Updated `useOnSendHello` to accept `repliedOn` parameter
- Updated `useSendMessageToHello` to accept `replyToMessageId` parameter
- Passes reply message ID through the entire send message flow

## API Format

When replying to a message, the API request includes the `replied_on` field:

```json
{
    "type": "widget",
    "message_type": "text",
    "content": {
        "text": "This is a reply message",
        "attachment": null
    },
    "chat_id": 917068,
    "replied_on": "6878a2ea221947b37a92297e",
    "session_id": null,
    "user_data": {},
    "is_anon": false,
    "sessionVariables": {}
}
```

The `replied_on` field contains the message ID of the message being replied to.

## User Experience

### How it Works:
1. **Hover to Show Reply Button**: When hovering over any message, a reply button appears
2. **Click to Reply**: Clicking the reply button sets the message for reply
3. **Reply Preview**: A preview appears above the text input showing which message is being replied to
4. **Send Reply**: Typing and sending includes the `replied_on` field in the API request
5. **Clear Reply**: Reply can be cancelled by clicking the X button or automatically cleared after sending

### Visual Design:
- **Reply Button**: Circular white button with reply icon, appears on hover
- **Reply Preview**: Blue-themed bar with sender name, message preview, and close button
- **Smooth Animations**: Fade in/out effects for better user experience
- **Responsive Design**: Works on both desktop and mobile devices

## Implementation Details

### State Management
- Uses React Context for global reply state management
- Reply state is cleared automatically after sending a message
- Reply state persists until manually cleared or message is sent

### Message ID Handling
- Supports both `message_id` and `id` fields for message identification
- Automatically extracts the appropriate ID based on message structure
- Passes the ID through the entire send message pipeline

### Error Handling
- Gracefully handles missing message IDs
- Maintains existing functionality when no reply is set
- Backward compatible with existing message sending flow

### Performance Considerations
- Uses React.memo for component optimization
- Efficient hover state management
- Minimal re-renders through proper dependency arrays

## Usage Examples

### Basic Reply Flow:
1. User hovers over a message → Reply button appears
2. User clicks reply button → Reply preview shows above input
3. User types response → Message is linked to original via `replied_on`
4. User sends message → Reply is cleared automatically

### Programmatic Usage:
```tsx
// Access reply context in any child component
const { replyToMessage, setReplyToMessage, clearReply } = useReplyContext();

// Set a message for reply
setReplyToMessage({
  id: "message_id_here",
  content: "Original message content",
  from_name: "Sender Name",
  is_auto_response: false
});

// Clear reply
clearReply();
```

## Future Enhancements

### Potential Improvements:
1. **Reply Threads**: Visual indication of reply relationships in chat
2. **Multiple Replies**: Support for replying to replies (threaded conversations)
3. **Reply Notifications**: Highlight when someone replies to your message
4. **Reply Context**: Show original message context in replies
5. **Keyboard Shortcuts**: Quick reply shortcuts (e.g., Ctrl+R)

### Integration Possibilities:
1. **Analytics**: Track reply usage patterns
2. **Agent Tools**: Enhanced reply management for support agents
3. **Bot Responses**: Allow bots to reply to specific user messages
4. **Mobile App**: Extend reply functionality to mobile applications

## Testing Checklist

- [ ] Reply button appears on message hover
- [ ] Reply button correctly sets reply context
- [ ] Reply preview shows correct message details
- [ ] Reply preview can be closed manually
- [ ] Message sending includes `replied_on` parameter
- [ ] Reply context clears after sending
- [ ] Works with different message types (text, attachments, etc.)
- [ ] Mobile responsive design
- [ ] Keyboard navigation support
- [ ] Error handling for edge cases

## Conclusion

The reply feature provides a comprehensive solution for contextual messaging in the chatbot interface. It maintains the existing codebase structure while adding powerful reply functionality that enhances user communication capabilities.
