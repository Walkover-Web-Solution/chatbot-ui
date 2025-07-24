// useNotificationSocketEventHandler.ts
import { setHelloEventMessage } from '@/store/chat/chatSlice';
import { useAppDispatch } from '@/store/useTypedHooks';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import { emitEventToParent } from '@/utils/emitEventsToParent/emitEventsToParent';
import { generateNewId } from '@/utils/utilities';
import { useCallback, useEffect } from 'react';
import socketManager from './notificationSocketManager';

// Define types for better type safety
export interface HelloMessage {
    role: string;
    from_name: string;
    content: string;
    urls?: any;
    id: string;
}

/**
 * Hook for handling socket events
 * @param options - Options for socket events
 * @param options.messageRef - Reference to message element
 */
export const useNotificationSocketEventHandler = ({ chatSessionId }: { chatSessionId: string }) => {
    // Handler for new messages
    const dispatch = useAppDispatch();
    const conversations = useCustomSelector((state) => state.Hello?.[chatSessionId]?.channelListData?.channels || [])
    const addHelloMessage = (data) => {
        conversations?.forEach((conversation) => {
            const messageObj = {
                "message_type": "pushNotification",
                "type": "chat",
                "session_id": "",
                "content": {
                    "text": data?.content,
                    "attachment": []
                },
                "sender_id": "bot",
                "chat_id": null,
                "channel": conversation?.channel,
                "new_event": true,
                "id": generateNewId()
            }
            dispatch(setHelloEventMessage({ message: messageObj, subThreadId: conversation?.channel }));
        })
    }

    const handleNewMessage = useCallback((data: any, acknowledgement: any) => {
        const { response } = data;
        const { message } = response || {};
        const { type, message_type } = message || {};
        switch (type) {
            case 'notification':
                if (message_type === 'Popup') {
                    emitEventToParent('PUSH_NOTIFICATION', message)
                } else if (message_type === 'Message') {
                    addHelloMessage(message)
                }
                // sending acknowledgement to server that push-notification is received
                if (acknowledgement && typeof acknowledgement === 'function') {
                    acknowledgement(message)
                }
            default:
                // Handle other types if needed
                break;
        }
    }, [addHelloMessage]);

    useEffect(() => {
        // Subscribe to socket events
        socketManager.on("NewPublish", handleNewMessage);

        // Clean up when component unmounts or dependencies change
        return () => {
            socketManager.off("NewPublish", handleNewMessage);
        };
    }, [handleNewMessage, socketManager?.isConnected]);

    // Return values and methods that might be useful to the component
    return null;
};

export default useNotificationSocketEventHandler;