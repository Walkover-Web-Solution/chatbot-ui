// useSocketEvents.ts
import { useEffect, useCallback, useRef } from 'react';
import socketManager from './socketManager';
import { ChatActionTypes, ChatState } from '@/components/Chatbot/hooks/chatTypes';
import { useReduxStateManagement } from '@/components/Chatbot/hooks/useReduxManagement';
import { useChatActions } from '@/components/Chatbot/hooks/useChatActions';

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
 * @param options.chatbotId - The chatbot ID
 * @param options.chatState - The current chat state
 * @param options.chatDispatch - Function to dispatch chat actions
 * @param options.messageRef - Reference to message element
 * @returns timeoutIdRef - Reference to timeout for cleanup
 */
export const useSocketEvents = ({
    chatbotId,
    chatState,
    chatDispatch,
    messageRef
}: {
    chatbotId: string,
    chatState: ChatState,
    chatDispatch: (action: { type: string; payload?: any }) => void,
    messageRef: React.RefObject<HTMLDivElement>
}) => {
    // Reference to timeout for typing indicators
    const { setLoading } = useChatActions({ chatbotId, chatDispatch, chatState });
    const { currentChannelId } = useReduxStateManagement({ chatbotId, chatDispatch });

    const addHelloMessage = (message: HelloMessage, reponseType: any = '') => {
        chatDispatch({ type: ChatActionTypes.ADD_HELLO_MESSAGE, payload: { message, reponseType } });
    }

    // Handler for new messages
    const handleNewMessage = useCallback((data: any) => {
        const { response } = data;
        const { message } = response || {};
        const {
            channel,
            content,
            chat_id,
            from_name,
            sender_id,
            new_event,
            type,
            message_type
        } = message || {};

        if (channel === currentChannelId && new_event && type === 'chat') {
            if (!chat_id) {
                setLoading(false);

                switch (message_type) {
                    case "interactive":
                        addHelloMessage({
                            role: sender_id === "bot" ? "Bot" : "Human",
                            from_name,
                            content: content?.body?.text,
                            urls: content?.body?.attachment,
                            id: response?.id,
                        }, 'assistant');
                        break;
                    default:
                        addHelloMessage({
                            role: sender_id === "bot" ? "Bot" : "Human",
                            from_name,
                            content: content?.text,
                            urls: content?.attachment,
                            id: response?.id,
                        }, 'assistant');
                }
                chatDispatch({ type: ChatActionTypes.SET_TYPING, payload: false });
            }
        }
    }, [currentChannelId, setLoading, addHelloMessage]);

    // Handler for typing events
    const handleTyping = useCallback((data: any) => {
        const { channel, type, action } = data || {};

        if (channel === currentChannelId && type === 'chat') {
            switch (action) {
                case 'typing':
                    // Handle typing indicator logic here
                    chatDispatch({ type: ChatActionTypes.SET_TYPING, payload: true });
                    break;
                case 'not-typing':
                    // Handle not typing indicator logic here
                    chatDispatch({ type: ChatActionTypes.SET_TYPING, payload: false });
                    break;
                default:
                    break;
            }
        }
    }, [currentChannelId, chatDispatch]);

    useEffect(() => {
        // Subscribe to socket events
        socketManager.on("NewPublish", handleNewMessage);
        socketManager.on("Typing", handleTyping);

        // Clean up when component unmounts or dependencies change
        return () => {
            socketManager.off("NewPublish", handleNewMessage);
            socketManager.off("Typing", handleTyping);
        };
    }, [handleNewMessage, handleTyping, socketManager?.isConnected]);

    // Return values and methods that might be useful to the component
    return null;
};

export default useSocketEvents;