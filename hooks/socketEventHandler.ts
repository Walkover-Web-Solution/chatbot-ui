// useSocketEvents.ts
import { useReduxStateManagement } from '@/components/Chatbot/hooks/useReduxManagement';
import { useTabVisibility } from '@/components/Chatbot/hooks/useTabVisibility';
import { setHelloEventMessage, setTyping } from '@/store/chat/chatSlice';
import { changeChannelAssigned, setUnReadCount } from '@/store/hello/helloSlice';
import { getLocalStorage, playMessageRecivedSound, setLocalStorage } from '@/utils/utilities';
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
 */
export const useSocketEvents = ({
    fetchChannels,
    chatSessionId,
    tabSessionId,
    setLoading
}: {
    fetchChannels: () => void,
    setLoading: (data: boolean) => void
    chatSessionId: string;
    tabSessionId: string
}) => {
    const dispatch = useDispatch();
    const { currentChannelId } = useReduxStateManagement({ chatSessionId, tabSessionId });
    const { isTabVisible } = useTabVisibility();
    const addHelloMessage = (message: HelloMessage, subThreadId: string = '') => {
        dispatch(setHelloEventMessage({ message, subThreadId }));
    }
    // Handler for new messages
    const handleNewMessage = useCallback((data: any) => {
        const { response } = data;
        const { message, timetoken, company_id = null } = response || {};
        if (message && timetoken) {
            message.timetoken = timetoken;
        }
        const { type } = message || {};

        // Handle unread count updates
        if (message?.new_event && (type === 'chat' || type === 'feedback') && !message?.chat_id) {
            const channelId = message?.channel;
            dispatch(setUnReadCount({
                channelId,
                resetCount: false
            }));

        }

        switch (type) {
            case 'chat': {
                const { channel, chat_id, new_event } = message || {};
                if (new_event) {
                    if (!chat_id) {
                        setLoading(false);

                        // Play notification sound when message is received
                        playMessageRecivedSound();

                        const messageId = response.timetoken || response.id;
                        addHelloMessage({ ...message, id: messageId }, channel);
                        dispatch(setTyping({
                            subThreadId: channel,
                            data: false
                        }));
                    } else if (chat_id && !isTabVisible) {
                        const messageId = response.timetoken || response.id;
                        addHelloMessage({ ...message, id: messageId }, channel);
                    }
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
            case 'update': {
                const { channel, client_id } = message || {};
                if (message?.new_event) {
                    if (client_id) {
                        if (getLocalStorage('k_clientId')) {
                            setLocalStorage('k_clientId', client_id);
                        } else {
                            setLocalStorage('a_clientId', client_id);
                        }
                        socketManager.unsubscribe([channel]);
                        // Replace the old client id in the channel with the new client_id
                        const newUserChannel = `ch-comp-${company_id}-${client_id}`;
                        socketManager.subscribe([newUserChannel]);
                    }
                }
                break;
            }
            default:
                // Handle other types if needed
                break;
        }
    }, [currentChannelId, setLoading, addHelloMessage, fetchChannels, isTabVisible]);

    // Handler for typing events
    const handleTyping = useCallback((data: any) => {
        const { channel, type, action } = data || {};

        if (type === 'chat') {
            switch (action) {
                case 'typing':
                    // Handle typing indicator logic here
                    dispatch(setTyping({ data: true, subThreadId: channel }));
                    break;
                case 'not-typing':
                    // Handle not typing indicator logic here
                    dispatch(setTyping({ data: false, subThreadId: channel }));
                    break;
                default:
                    break;
            }
        }
    }, [currentChannelId, dispatch]);

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