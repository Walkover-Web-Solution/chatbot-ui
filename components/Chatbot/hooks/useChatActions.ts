// hooks/useChatActions.ts
import { getAllThreadsApi, getPreviousMessage, sendDataToAction } from '@/config/api';
import { GetSessionStorageData } from '@/utils/ChatbotUtility';
import { Dispatch, useEffect, useReducer } from 'react';
import { ChatAction, ChatActionTypes, ChatState } from './chatTypes';
import { useReduxStateManagement } from './useReduxManagement';
import { chatReducer, initialChatState } from './chatReducer';
import { setThreads } from '@/store/interface/interfaceSlice';
import { useDispatch } from 'react-redux';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import { $ReduxCoreType } from '@/types/reduxCore';


// fetchAllThreads done 
// getallPreviousHistory done 
// addMessage
// fetchMoreData done 

// export const useChatActions = (state: ChatState, dispatch: Dispatch<ChatAction>, chatbotId: string) => {
//     const userId = GetSessionStorageData("interfaceUserId");
//     const { selectedAiServiceAndModal, interfaceContextData } = useReduxStateManagement();
//     const addMessage = async (message: string, images: string[] = [], isHuman: boolean = false, variables = {}) => {
//         const newMessage = {
//             content: message,
//             role: 'user' as const,
//             urls: images,
//             createdAt: new Date().toISOString(),
//         };

//         dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
//         dispatch({
//             type: 'ADD_MESSAGE', payload: { role: 'assistant', wait: true, content: 'Talking  with AI' }
//         });

//         try {
//             dispatch({ type: 'SET_LOADING', payload: true });
//             await sendDataToAction({
//                 message,
//                 images,
//                 userId: userId,
//                 interfaceContextData: { ...interfaceContextData, ...(variables || {}) },
//                 threadId: state.threadId,
//                 subThreadId: state.subThreadId,
//                 slugName: state.bridgeName,
//                 chatBotId: chatbotId,
//                 version_id: state.bridgeVersionId === "null" ? null : state.bridgeVersionId,
//                 ...((selectedAiServiceAndModal?.modal && selectedAiServiceAndModal?.service) ? {
//                     configuration: { model: selectedAiServiceAndModal?.modal },
//                     service: selectedAiServiceAndModal?.service
//                 } : {})
//             });
//         } catch (error) {
//             // Handle error and rollback message
//             dispatch({ type: 'SET_MESSAGES', payload: state.messages.slice(0, -2) });
//         } finally {
//             dispatch({ type: 'SET_LOADING', payload: false });
//             dispatch({ type: 'SET_IMAGES', payload: [] });
//         }
//     };

//     const loadMoreMessages = async () => {
//         if (!state.hasMoreMessages || state.chatsLoading) return;

//         dispatch({ type: 'SET_CHATS_LOADING', payload: true });

//         try {
//             const nextPage = state.currentPage + 1;
//             // Fetch messages from API
//             // const newMessages = await fetchMessages(nextPage);
//             // dispatch({ type: 'SET_MESSAGES', payload: [...newMessages, ...state.messages] });
//             dispatch({ type: 'INCREMENT_PAGE' });
//         } catch (error) {
//             console.error('Error loading more messages:', error);
//         } finally {
//             dispatch({ type: 'SET_CHATS_LOADING', payload: false });
//         }
//     };

//     return {
//         addMessage,
//         loadMoreMessages,
//         setThreadId: (id: string) => dispatch({ type: 'SET_THREAD_ID', payload: id }),
//         setBridgeName: (name: string) => dispatch({ type: 'SET_BRIDGE_NAME', payload: name }),
//         toggleDrawer: () => dispatch({ type: 'TOGGLE_DRAWER' }),
//         setNewMessage: () => dispatch({ type: 'SET_NEW_MESSAGE', payload: true }),
//         // Expose other actions as needed
//     };
// };


export const useChatActions = ({ chatDispatch, chatState }: { chatDispatch: React.Dispatch<ChatAction>, chatState: ChatState }) => {

    const { threadId, subThreadId, bridgeName } = useCustomSelector((state: $ReduxCoreType) => ({
        threadId: state.appInfo.threadId,
        subThreadId: state.appInfo.subThreadId,
        bridgeName: state.appInfo.bridgeName,
    }))

    useEffect(() => {
        fetchAllThreads()
    }, [threadId, bridgeName]);

    useEffect(() => {
        getChatHistory();
    }, [threadId, bridgeName, subThreadId]);

    const globalDispatch = useDispatch()

    const fetchAllThreads = async () => {
        const result = await getAllThreadsApi({ threadId });
        if (result?.success) {
            globalDispatch(
                setThreads({ bridgeName, threadId, threadList: result?.threads })
            );
        }
    }

    const getChatHistory = async (pageNo: number = 1) => {
        if (threadId) {
            // setChatsLoading(true);
            // set loading state
            try {
                const { previousChats, starterQuestion } = await getPreviousMessage(
                    threadId,
                    bridgeName,
                    1,
                    subThreadId
                );
                if (Array.isArray(previousChats)) {
                    chatDispatch({ type: ChatActionTypes.SET_MESSAGES, payload: previousChats })
                    // setMessages(previousChats?.length === 0 ? [] : [...previousChats]);
                    // setCurrentPage(1);
                    // setHasMoreMessages(previousChats?.length >= 40);
                } else {
                    // setMessages([]);
                    // setHasMoreMessages(false);
                    // console.warn("previousChats is not an array");
                }
                if (Array.isArray(starterQuestion)) {
                    // setStarterQuestions(starterQuestion.slice(0, 4));
                }
            } catch (error) {
                // console.warn("Error fetching previous chats:", error);
                // setMessages([]);
                // setHasMoreMessages(false);
            } finally {
                // setChatsLoading(false);
            }
        }
    };

    const sendMessage = async (payload: any) => {
        const response = await sendDataToAction(payload);
        if (!response?.success) {
            // setMessages((prevMessages) => prevMessages.slice(0, -1));
            // setLoading(false);
        }
    }
    return {
        fetchAllThreads,
        getChatHistory,
        sendMessage,
        setToggleDrawer: (payload: boolean) => chatDispatch({ type: ChatActionTypes.SET_TOGGLE_DRAWER, payload }),
        setLoading : (payload: boolean) => chatDispatch({ type: ChatActionTypes.SET_LOADING, payload }),
        setChatsLoading : (payload: boolean) => chatDispatch({ type: ChatActionTypes.SET_CHATS_LOADING, payload })
    };
}