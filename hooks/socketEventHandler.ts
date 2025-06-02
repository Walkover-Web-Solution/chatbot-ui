// useSocketEvents.ts
import { ChatActionTypes, ChatState } from '@/components/Chatbot/hooks/chatTypes';
import { useReduxStateManagement } from '@/components/Chatbot/hooks/useReduxManagement';
import { changeChannelAssigned, setUnReadCount } from '@/store/hello/helloSlice';
import { playMessageRecivedSound } from '@/utils/utilities';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import socketManager from './socketManager';

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
 * @param options.chatState - The current chat state
 * @param options.chatDispatch - Function to dispatch chat actions
 * @param options.messageRef - Reference to message element
 * @returns timeoutIdRef - Reference to timeout for cleanup
 */
export const useSocketEvents = ({
    chatState,
    chatDispatch,
    messageRef,
    fetchChannels,
    chatSessionId,
    tabSessionId,
    setLoading
}: {
    chatState: ChatState,
    chatDispatch: (action: { type: string; payload?: any }) => void,
    messageRef: React.RefObject<HTMLDivElement>,
    fetchChannels: () => void,
    setLoading: (data: boolean) => void
    chatSessionId: string;
    tabSessionId:string
}) => {
    const dispatch = useDispatch();

    const { isToggledrawer } = chatState;
    const { currentChannelId, isSmallScreen } = useReduxStateManagement({ chatDispatch, chatSessionId , tabSessionId});
    const addHelloMessage = (message: HelloMessage, subThreadId: string = '') => {
        chatDispatch({ type: ChatActionTypes.SET_HELLO_EVENT_MESSAGE, payload: { message, subThreadId } });
    }

    function isSameChannel(channelId: string) {
        return channelId === currentChannelId;
    }
    // Handler for new messages
    const handleNewMessage = useCallback((data: any) => {
        const { response } = data;
        const { message, timetoken } = response || {};
        if (message && timetoken) {
            message.timetoken = timetoken;
        }
        const { type } = message || {};

        // Handle unread count updates
        if (message?.new_event && (type === 'chat' || type === 'feedback')) {
            const channelId = message?.channel;
            const isCurrentChannel = isSameChannel(channelId);
            const shouldResetCount = isCurrentChannel &&
                ((isToggledrawer && !isSmallScreen) || (isSmallScreen && !isToggledrawer));
            dispatch(setUnReadCount({
                channelId,
                resetCount: shouldResetCount || false
            }));
        }

        switch (type) {
            case 'chat': {
                const { channel, chat_id, new_event } = message || {};
                if (new_event && !chat_id) {
                    setLoading(false);

                    // Play notification sound when message is received
                    playMessageRecivedSound();

                    const messageId = response.timetoken || response.id;
                    addHelloMessage({ ...message, id: messageId }, channel);
                    chatDispatch({
                        type: ChatActionTypes.SET_TYPING,
                        payload: { data: false, subThreadId: channel }
                    });
                }
                break;
            }
            case 'assign': {
                const { assignee_type, channel_details, assignee_id } = message || {};
                dispatch(changeChannelAssigned({
                    assigned_type: assignee_type,
                    assignee_id,
                    channelId: channel_details?.channel
                }));
                break;
            }
            case 'feedback': {
                const { channel } = message || {};
                if (message?.new_event) {
                    const messageId = response.timetoken || response.id;
                    addHelloMessage(
                        { ...message, id: messageId },
                        channel
                    );
                }
                break;
            }
            default:
                // Handle other types if needed
                break;
        }
    }, [currentChannelId, setLoading, addHelloMessage, fetchChannels]);

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