// useSocketEvents.ts
import { useEffect, useCallback, useRef, useContext } from 'react';
import socketManager from './socketManager';
import { ChatActionTypes, ChatState } from '@/components/Chatbot/hooks/chatTypes';
import { useReduxStateManagement } from '@/components/Chatbot/hooks/useReduxManagement';
import { useChatActions } from '@/components/Chatbot/hooks/useChatActions';
import { useDispatch } from 'react-redux';
import { changeChannelAssigned } from '@/store/hello/helloSlice';
import { MessageContext } from '@/components/Interface-Chatbot/InterfaceChatbot';

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
    messageRef,
    fetchChannels
}: {
    chatbotId: string,
    chatState: ChatState,
    chatDispatch: (action: { type: string; payload?: any }) => void,
    messageRef: React.RefObject<HTMLDivElement>,
    fetchChannels: () => void
}) => {
    const dispatch = useDispatch();
    // Reference to timeout for typing indicators
    const { setLoading } = useChatActions({ chatbotId, chatDispatch, chatState });
    const { currentChannelId } = useReduxStateManagement({ chatbotId, chatDispatch });
    const addHelloMessage = (message: HelloMessage) => {
        chatDispatch({ type: ChatActionTypes.SET_HELLO_EVENT_MESSAGE, payload: { message } });
    }

    function isSameChannel(channelId: string) {
        return channelId === currentChannelId;
    }
    // Handler for new messages
    const handleNewMessage = useCallback((data: any) => {
        const { response } = data;
        // console.log(data, 'data')
        const { message } = response || {};
        const { type } = message || {};
        
        if (!isSameChannel(message?.channel) && message?.new_event && type === 'chat') {
            // fetch channels when message is in a different channel
            fetchChannels()
        }

        switch (type) {
            case 'chat':
                const { channel, chat_id, new_event } = message || {};
                if (isSameChannel(channel) && new_event) {
                    if (!chat_id) {
                        setLoading(false);

                        // Play notification sound when message is received
                        const notificationSound = new Audio('/notification-sound.mp3'); // Path to notification sound file in public folder
                        notificationSound.volume = 0.2;
                        notificationSound.play().catch(error => {
                            console.error("Failed to play notification sound:", error);
                        });


                        addHelloMessage({ ...message, id: response.id })
                        chatDispatch({ type: ChatActionTypes.SET_TYPING, payload: { data: false, subThreadId: channel } });
                    }
                }
                break;
            case 'assign':
                const { assignee_type, channel_details, assignee_id } = message || {};
                if (isSameChannel(channel_details?.channel)) {
                    dispatch(changeChannelAssigned({ assigned_type: assignee_type, assignee_id }));
                }
                break;
            case 'feedback':
                if(message?.new_event){
                    addHelloMessage({ ...message, id: response.id })
                }
                break;
            default:
                // Handle other types if needed
                break;
        }
    }, [currentChannelId, setLoading, addHelloMessage,fetchChannels]);

    // Handler for typing events
    const handleTyping = useCallback((data: any) => {
        const { channel, type, action } = data || {};

        if (type === 'chat') {
            switch (action) {
                case 'typing':
                    // Handle typing indicator logic here
                    chatDispatch({ type: ChatActionTypes.SET_TYPING, payload: { data: true, subThreadId: channel } });
                    break;
                case 'not-typing':
                    // Handle not typing indicator logic here
                    chatDispatch({ type: ChatActionTypes.SET_TYPING, payload: { data: false, subThreadId: channel } });
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