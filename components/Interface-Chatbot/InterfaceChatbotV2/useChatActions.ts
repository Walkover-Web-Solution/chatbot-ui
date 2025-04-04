// hooks/useChatActions.ts
import { Dispatch } from 'react';
import { ChatAction, ChatState } from './chatTypes';
import { sendDataToAction } from '@/config/api';

export const useChatActions = (state: ChatState, dispatch: Dispatch<ChatAction>) => {
    const addMessage = async (message: string, images: string[] = [], isHuman: boolean = false) => {
        const newMessage = {
            content: message,
            role: 'user' as const,
            urls: images,
            createdAt: new Date().toISOString(),
        };

        if (isHuman) {
            dispatch({ type: 'ADD_HELLO_MESSAGE', payload: newMessage });
        } else {
            dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
            dispatch({
                type: 'ADD_MESSAGE', payload: {
                    role: 'assistant',
                    wait: true,
                    content: 'Talking with AI'
                }
            });
        }

        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            await sendDataToAction({
                message,
                images,
                threadId: state.threadId,
                bridgeName: state.bridgeName,
                // ... other required params
            });
        } catch (error) {
            // Handle error and rollback message
            dispatch({ type: 'SET_MESSAGES', payload: state.messages.slice(0, -2) });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
            dispatch({ type: 'SET_IMAGES', payload: [] });
        }
    };

    const loadMoreMessages = async () => {
        if (!state.hasMoreMessages || state.chatsLoading) return;

        dispatch({ type: 'SET_CHATS_LOADING', payload: true });

        try {
            const nextPage = state.currentPage + 1;
            // Fetch messages from API
            // const newMessages = await fetchMessages(nextPage);
            // dispatch({ type: 'SET_MESSAGES', payload: [...newMessages, ...state.messages] });
            dispatch({ type: 'INCREMENT_PAGE' });
        } catch (error) {
            console.error('Error loading more messages:', error);
        } finally {
            dispatch({ type: 'SET_CHATS_LOADING', payload: false });
        }
    };

    return {
        addMessage,
        loadMoreMessages,
        setThreadId: (id: string) => dispatch({ type: 'SET_THREAD_ID', payload: id }),
        setBridgeName: (name: string) => dispatch({ type: 'SET_BRIDGE_NAME', payload: name }),
        toggleDrawer: () => dispatch({ type: 'TOGGLE_DRAWER' }),
        setNewMessage: () => dispatch({ type: 'SET_NEW_MESSAGE', payload: true }),
        // Expose other actions as needed
    };
};