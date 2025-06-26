// useSocketEvents.ts
import { useReduxStateManagement } from '@/components/Chatbot/hooks/useReduxManagement';
import { setHelloEventMessage, setTyping } from '@/store/chat/chatSlice';
import { changeChannelAssigned, setUnReadCount } from '@/store/hello/helloSlice';
import { useCustomSelector } from '@/utils/deepCheckSelector';
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
 * @param options.messageRef - Reference to message element
 */
export const useSocketEvents = ({
    messageRef,
    fetchChannels,
    chatSessionId,
    tabSessionId,
    setLoading
}: {
    messageRef: React.RefObject<HTMLDivElement>,
    fetchChannels: () => void,
    setLoading: (data: boolean) => void
    chatSessionId: string;
    tabSessionId: string
}) => {
    const dispatch = useDispatch();
    const { currentChannelId, isSmallScreen } = useReduxStateManagement({ chatSessionId, tabSessionId });
    const { isToggledrawer } = useCustomSelector((state) => ({
        isToggledrawer: state.Chat.isToggledrawer
    }))
    const addHelloMessage = (message: HelloMessage, subThreadId: string = '') => {
        dispatch(setHelloEventMessage({ message, subThreadId }));
    }

    function isSameChannel(channelId: string) {
        return channelId === currentChannelId;
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
            const isCurrentChannel = isSameChannel(channelId);
            const shouldIncreaseCount = isCurrentChannel ? (isSmallScreen && isToggledrawer) : true
            if (shouldIncreaseCount) {
                dispatch(setUnReadCount({
                    channelId,
                    resetCount: false
                }));
            }
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
                    dispatch(setTyping({
                        subThreadId: channel,
                        data: false
                    }));
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
    }, [currentChannelId, setLoading, addHelloMessage, fetchChannels]);

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