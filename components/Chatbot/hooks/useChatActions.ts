// hooks/useChatActions.ts
import { getAllThreadsApi, getPreviousMessage, sendDataToAction } from '@/config/api';
import { setThreads } from '@/store/interface/interfaceSlice';
import { $ReduxCoreType } from '@/types/reduxCore';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ChatAction, ChatActionTypes, ChatState, SendMessagePayloadType } from './chatTypes';

export const useChatActions = ({ chatbotId, chatDispatch, chatState, messageRef }: { chatbotId: string, chatDispatch: React.Dispatch<ChatAction>, chatState: ChatState, messageRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement> }) => {

    const globalDispatch = useDispatch()
    // const messageRef = React.useRef<HTMLDivElement>(null);
    const timeoutIdRef = React.useRef<any>(null);
    const { threadId, subThreadId, bridgeName, variables, selectedAiServiceAndModal, userId } = useCustomSelector((state: $ReduxCoreType) => ({
        threadId: state.appInfo.threadId,
        subThreadId: state.appInfo.subThreadId,
        bridgeName: state.appInfo.bridgeName,
        variables: state.Interface?.interfaceContext?.[chatbotId]?.variables,
        selectedAiServiceAndModal: state.Interface?.selectedAiServiceAndModal || null,
        userId: state.appInfo.userId || null,
    }))
    const messages = chatState?.messages || []
    useEffect(() => {
        fetchAllThreads()
    }, [threadId, bridgeName]);

    useEffect(() => {
        getChatHistory();
    }, [threadId, bridgeName, subThreadId]);

    const startTimeoutTimer = () => {
        timeoutIdRef.current = setTimeout(() => {
            chatDispatch({
                type: ChatActionTypes.SET_DATA, payload: {
                    messages: [
                        ...messages.slice(0, -1),
                        { role: "assistant", wait: false, timeOut: true },
                    ],
                    loading: false
                }
            })
        }, 240000);
    };

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
    const sendMessage = async ({ message = '', customVariables = {}, customThreadId = '', customBridgeSlug = '', apiCall = true }: SendMessagePayloadType) => {
        const textMessage = message || (messageRef?.current as HTMLInputElement)?.value;
        const imageUrls = Array.isArray(chatState.images) && chatState?.images?.length ? chatState?.images : []; // Assuming imageUrls is an empty array or you can replace it with the actual value
        if (!textMessage && imageUrls.length === 0) return;
        chatDispatch({ type: ChatActionTypes.SET_NEW_MESSAGE, payload: true })

        startTimeoutTimer();

        const payload = {
            message: textMessage,
            images: imageUrls, // Send image URLs
            userId,
            interfaceContextData: { ...variables, ...customVariables } || {},
            threadId: customThreadId || threadId,
            subThreadId: subThreadId,
            slugName: customBridgeSlug || bridgeName,
            chatBotId: chatbotId,
            version_id: chatState.bridgeVersionId === "null" ? null : chatState.bridgeVersionId,
            ...((selectedAiServiceAndModal?.modal && selectedAiServiceAndModal?.service) ? {
                configuration: { model: selectedAiServiceAndModal?.modal },
                service: selectedAiServiceAndModal?.service
            } : {})
        }
        const response = await sendDataToAction(payload);
        if (!response?.success) {
            const updatedMessages = messages.slice(0, -1);
            chatDispatch({ type: ChatActionTypes.SET_MESSAGES, payload: updatedMessages });
            chatDispatch({ type: ChatActionTypes.SET_LOADING, payload: false })
        }

        chatDispatch({
            type: ChatActionTypes.SET_DATA,
            payload: {
                loading: false,
                options: [],
                messages: [
                    ...messages,
                    { role: "user", content: textMessage, urls: imageUrls },
                    { role: "assistant", wait: true, content: "Talking with AI" },
                ],
                images: []
            }
        });

        messageRef.current.value = "";
    }

    return {
        fetchAllThreads,
        getChatHistory,
        sendMessage,
        setToggleDrawer: (payload: boolean) => chatDispatch({ type: ChatActionTypes.SET_TOGGLE_DRAWER, payload }),
        setLoading: (payload: boolean) => chatDispatch({ type: ChatActionTypes.SET_LOADING, payload }),
        setChatsLoading: (payload: boolean) => chatDispatch({ type: ChatActionTypes.SET_CHATS_LOADING, payload }),
        messageRef
    };
}