// hooks/useChatActions.ts
import { getAllThreadsApi, getPreviousMessage, sendDataToAction } from '@/config/api';
import { setThreads } from '@/store/interface/interfaceSlice';
import { $ReduxCoreType } from '@/types/reduxCore';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ChatAction, ChatActionTypes, ChatState, SendMessagePayloadType } from './chatTypes';
import { errorToast } from '@/components/customToast';

export const useChatActions = ({ chatbotId, chatDispatch, chatState, messageRef, timeoutIdRef }: { chatbotId: string, chatDispatch: React.Dispatch<ChatAction>, chatState: ChatState, messageRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>, timeoutIdRef: React.RefObject<NodeJS.Timeout | null> }) => {

    const globalDispatch = useDispatch()
    const { threadId, subThreadId, bridgeName, variables, selectedAiServiceAndModal, userId } = useCustomSelector((state: $ReduxCoreType) => ({
        threadId: state.appInfo.threadId,
        subThreadId: state.appInfo.subThreadId,
        bridgeName: state.appInfo.bridgeName,
        variables: state.Interface?.interfaceContext?.[chatbotId]?.variables,
        selectedAiServiceAndModal: state.Interface?.selectedAiServiceAndModal || null,
        userId: state.appInfo.userId || null,
    }))

    useEffect(() => {
        fetchAllThreads()
    }, [threadId, bridgeName]);

    useEffect(() => {
        getIntialChatHistory();
    }, [threadId, bridgeName, subThreadId]);

    const startTimeoutTimer = () => {
        const messages = chatState?.messages || []
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

    const getIntialChatHistory = async () => {
        if (threadId) {
            chatDispatch({
                type: ChatActionTypes.SET_CHATS_LOADING, payload: true
            })
            try {
                if (chatState?.isFetching || !chatState?.hasMoreMessages) return;
                const { previousChats, starterQuestion } = await getPreviousMessage(
                    threadId,
                    bridgeName,
                    1,
                    subThreadId
                );
                if (Array.isArray(previousChats)) {
                    chatDispatch({
                        type: ChatActionTypes.SET_DATA, payload: {
                            messages: previousChats,
                            currentPage: 1,
                            hasMoreMessages: previousChats?.length >= 40
                        }
                    })
                } else {
                    chatDispatch({
                        type: ChatActionTypes.SET_DATA, payload: {
                            messages: [],
                            hasMoreMessages: false
                        }
                    })
                    console.warn("previousChats is not an array");
                }
                if (Array.isArray(starterQuestion)) {
                    chatDispatch({ type: ChatActionTypes.SET_STARTER_QUESTIONS, payload: starterQuestion })
                }
            } catch (error) {
                console.warn("Error fetching previous chats:", error);
                chatDispatch({
                    type: ChatActionTypes.SET_DATA, payload: {
                        messages: [],
                        hasMoreMessages: false
                    }
                })
            } finally {
                chatDispatch({
                    type: ChatActionTypes.SET_CHATS_LOADING, payload: false
                })
            }
        }
    };

    const getMoreChats = async () => {
        const { isFetching, hasMoreMessages, currentPage, messages } = chatState;
        if (isFetching || !hasMoreMessages) return;
        chatDispatch({
            type: ChatActionTypes.SET_IS_FETCHING, payload: true
        })
        try {

            const nextPage = currentPage + 1;
            console.log("Current page", currentPage)
            console.log("Next page", nextPage)
            const { previousChats } = await getPreviousMessage(
                threadId,
                bridgeName,
                nextPage
            );

            if (Array.isArray(previousChats) && previousChats.length > 0) {
                chatDispatch({
                    type: ChatActionTypes.SET_DATA, payload: {
                        messages: [...previousChats, ...messages],
                        currentPage: nextPage,
                        hasMoreMessages: previousChats?.length < 40 ? false : true
                    }
                })
            } else {
                chatDispatch({
                    type: ChatActionTypes.SET_DATA, payload: {
                        hasMoreMessages: false
                    }
                })
            }
        } catch (error) {
            console.warn("Error fetching more messages:", error);
            errorToast("Failed to load more messages.");
        } finally {
            chatDispatch({
                type: ChatActionTypes.SET_IS_FETCHING, payload: false
            })
        }
    }

    const sendMessage = async ({ message = '', customVariables = {}, customThreadId = '', customBridgeSlug = '', apiCall = true }: SendMessagePayloadType) => {
        const messages = chatState?.messages || []
        const textMessage = message || (messageRef?.current as HTMLInputElement)?.value;
        const imageUrls = Array.isArray(chatState.images) && chatState?.images?.length ? chatState?.images : []; // Assuming imageUrls is an empty array or you can replace it with the actual value
        if (!textMessage && imageUrls.length === 0) return;
        chatDispatch({ type: ChatActionTypes.SET_LOADING, payload: true })
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
            return
        }

        chatDispatch({
            type: ChatActionTypes.SET_DATA,
            payload: {
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
        getIntialChatHistory,
        getMoreChats,
        sendMessage,
        setToggleDrawer: (payload: boolean) => chatDispatch({ type: ChatActionTypes.SET_TOGGLE_DRAWER, payload }),
        setLoading: (payload: boolean) => chatDispatch({ type: ChatActionTypes.SET_LOADING, payload }),
        setChatsLoading: (payload: boolean) => chatDispatch({ type: ChatActionTypes.SET_CHATS_LOADING, payload }),
        setImages: (payload: string[]) => chatDispatch({ type: ChatActionTypes.SET_IMAGES, payload }),
        setOptions: (payload: string[]) => chatDispatch({ type: ChatActionTypes.SET_OPTIONS, payload })
    };
}