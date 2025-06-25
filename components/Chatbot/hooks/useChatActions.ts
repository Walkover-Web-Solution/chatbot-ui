// hooks/useChatActions.ts
import { errorToast } from '@/components/customToast';
import { getAllThreadsApi, getPreviousMessage, sendDataToAction, sendFeedbackAction } from '@/config/api';
import { getHelloDetailsStart } from '@/store/hello/helloSlice';
import { setThreads } from '@/store/interface/interfaceSlice';
import { $ReduxCoreType } from '@/types/reduxCore';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import { PAGE_SIZE } from '@/utils/enums';
import React, { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ChatAction, ChatActionTypes, ChatState, SendMessagePayloadType } from './chatTypes';

export const useChatActions = ({ chatDispatch, chatState, messageRef, timeoutIdRef, chatSessionId, tabSessionId }: { chatDispatch: React.Dispatch<ChatAction>, chatState: ChatState, messageRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>, timeoutIdRef: React.RefObject<NodeJS.Timeout | null>, chatSessionId: string, tabSessionId: string }) => {
    const globalDispatch = useDispatch();
    const { threadId, subThreadId, bridgeName, variables, selectedAiServiceAndModal, userId, isHelloUser, firstThread, versionId = 'null' } = useCustomSelector((state: $ReduxCoreType) => ({
        threadId: state.appInfo?.[tabSessionId]?.threadId,
        subThreadId: state.appInfo?.[tabSessionId]?.subThreadId,
        bridgeName: state.appInfo?.[tabSessionId]?.bridgeName,
        versionId: state.appInfo?.[tabSessionId]?.versionId || "null",
        variables: state.Interface?.[chatSessionId]?.interfaceContext?.[state?.appInfo?.[tabSessionId]?.bridgeName]?.variables,
        selectedAiServiceAndModal: state.Interface?.[chatSessionId]?.selectedAiServiceAndModal || null,
        userId: state.appInfo?.[tabSessionId]?.userId || null,
        isHelloUser: state.Hello?.[chatSessionId]?.isHelloUser || false,
        firstThread: state.Interface?.[chatSessionId]?.interfaceContext?.[state.appInfo?.[tabSessionId]?.bridgeName]?.threadList?.[state.appInfo?.[tabSessionId]?.threadId]?.[0]
    }))

    useEffect(() => {
        if (bridgeName) {
            globalDispatch(getHelloDetailsStart({ slugName: bridgeName }));
        }
    }, [bridgeName, chatSessionId])

    useEffect(() => {
        threadId && bridgeName && fetchAllThreads()
    }, [threadId, bridgeName, chatSessionId]);

    useEffect(() => {
        if (!(firstThread?.newChat && firstThread?.subThread_id === subThreadId)) {
            getIntialChatHistory();
        }
    }, [threadId, bridgeName, subThreadId]);

    const startTimeoutTimer = () => {
        timeoutIdRef.current = setTimeout(() => {
            chatDispatch({ type: ChatActionTypes.UPDATE_LAST_ASSISTANT_MESSAGE, payload: { role: "assistant", wait: false, timeOut: true } })
            chatDispatch({ type: ChatActionTypes.SET_LOADING, payload: false })
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
        if (threadId && bridgeName) {
            chatDispatch({
                type: ChatActionTypes.SET_CHATS_LOADING, payload: true
            })
            try {
                const { previousChats, starterQuestion } = await getPreviousMessage(
                    threadId,
                    bridgeName,
                    1,
                    subThreadId
                );
                if (Array.isArray(previousChats)) {
                    chatDispatch({ type: ChatActionTypes.SET_INTIAL_MESSAGES, payload: { messages: previousChats } });
                    chatDispatch({
                        type: ChatActionTypes.SET_DATA, payload: {
                            currentPage: 1,
                            hasMoreMessages: previousChats?.length >= PAGE_SIZE.gtwy
                        }
                    });
                } else {
                    chatDispatch({ type: ChatActionTypes.SET_INTIAL_MESSAGES, payload: { messages: [] } });
                    chatDispatch({
                        type: ChatActionTypes.SET_DATA, payload: {
                            hasMoreMessages: false
                        }
                    });
                    console.warn("previousChats is not an array");
                }
                if (Array.isArray(starterQuestion)) {
                    chatDispatch({ type: ChatActionTypes.SET_STARTER_QUESTIONS, payload: starterQuestion });
                }
            } catch (error) {
                console.warn("Error fetching previous chats:", error);
                chatDispatch({ type: ChatActionTypes.SET_INTIAL_MESSAGES, payload: { messages: [] } });
                chatDispatch({
                    type: ChatActionTypes.SET_DATA, payload: {
                        hasMoreMessages: false
                    }
                });
            } finally {
                chatDispatch({
                    type: ChatActionTypes.SET_CHATS_LOADING, payload: false
                });
            }
        }
    };

    const getMoreChats = async () => {
        const { isFetching, hasMoreMessages, currentPage, subThreadId } = chatState;
        if (isFetching || !hasMoreMessages) return;
        chatDispatch({
            type: ChatActionTypes.SET_IS_FETCHING, payload: true
        })
        try {

            const nextPage = currentPage + 1;
            const { previousChats } = await getPreviousMessage(
                threadId,
                bridgeName,
                nextPage,
                subThreadId
            );

            if (Array.isArray(previousChats) && previousChats.length > 0) {
                chatDispatch({ type: ChatActionTypes.SET_PAGINATE_MESSAGES, payload: { messages: [...previousChats] } });
                chatDispatch({
                    type: ChatActionTypes.SET_DATA, payload: {
                        currentPage: nextPage,
                        hasMoreMessages: previousChats?.length >= PAGE_SIZE.gtwy
                    }
                });
            } else {
                chatDispatch({
                    type: ChatActionTypes.SET_DATA, payload: {
                        hasMoreMessages: false
                    }
                });
            }
        } catch (error) {
            console.warn("Error fetching more messages:", error);
            errorToast("Failed to load more messages.");
        } finally {
            chatDispatch({
                type: ChatActionTypes.SET_IS_FETCHING, payload: false
            });
        }
    }

    const sendMessage = async ({ message = '', customVariables = {}, customThreadId = '', customBridgeSlug = '', apiCall = true }: SendMessagePayloadType) => {
        chatDispatch({ type: ChatActionTypes.SET_NEW_MESSAGE, payload: true })
        const textMessage = message || (messageRef?.current as HTMLInputElement)?.value;
        const imageUrls = Array.isArray(chatState.images) && chatState?.images?.length ? chatState?.images : []; // Assuming imageUrls is an empty array or you can replace it with the actual value

        if (!textMessage && imageUrls.length === 0) return;
        if (messageRef.current) {
            messageRef.current.value = "";
        }
        chatDispatch({ type: ChatActionTypes.SET_LOADING, payload: true })
        chatDispatch({ type: ChatActionTypes.SET_OPTIONS, payload: [] })

        startTimeoutTimer();

        chatDispatch({
            type: ChatActionTypes.SET_DATA,
            payload: {
                options: [],
                images: []
            }
        });
        chatDispatch({ type: ChatActionTypes.SET_HELLO_EVENT_MESSAGE, payload: { message: { role: "user", content: textMessage, urls: imageUrls } } });
        chatDispatch({
            type: ChatActionTypes.SET_HELLO_EVENT_MESSAGE, payload: {
                message: {
                    content: "Talking with AI",
                    role: "assistant",
                    wait: true,
                }
            }
        });

        const payload = {
            message: textMessage,
            images: imageUrls, // Send image URLs
            userId,
            interfaceContextData: { ...variables, ...customVariables } || {},
            threadId: customThreadId || threadId,
            subThreadId: subThreadId,
            slugName: customBridgeSlug || bridgeName,
            thread_flag: (firstThread?.newChat && firstThread?.sub_thread_id === subThreadId) ? true : false,
            chatBotId: chatSessionId,
            version_id: versionId === "null" ? null : versionId,
            ...((selectedAiServiceAndModal?.modal && selectedAiServiceAndModal?.service) ? {
                configuration: { model: selectedAiServiceAndModal?.modal },
                service: selectedAiServiceAndModal?.service
            } : {})
        }
        const response = await sendDataToAction(payload);
        if (!response?.success) {
            chatDispatch({ type: ChatActionTypes.SET_LOADING, payload: false })
            chatDispatch({ type: ChatActionTypes.REMOVE_MESSAGES, payload: { numberOfMessages: 2 } })
            return
        }
    }

    const handleMessageFeedback = async (payload: { msgId: string, feedback: number, reduxMsgId: string }) => {
        const { msgId, feedback, reduxMsgId } = payload;
        const currentStatus = chatState.msgIdAndDataMap?.[subThreadId]?.[reduxMsgId]?.user_feedback;
        if (msgId && feedback && currentStatus !== feedback) {
            const response = await sendFeedbackAction({
                messageId: msgId,
                feedbackStatus: feedback,
            });
            if (response?.success) {
                chatDispatch({
                    type: ChatActionTypes.UPDATE_SINGLE_MESSAGE,
                    payload: {
                        messageId: reduxMsgId,
                        data: { user_feedback: feedback }
                    }
                })
            }
        }
    }

    const handleMessage = useCallback(
        (event: MessageEvent) => {
            if (event?.data?.type === "refresh") {
                getIntialChatHistory();
            }
            if (event?.data?.type === "askAi") {
                if (!chatState?.loading) {
                    const data = event?.data?.data;
                    if (typeof data === "string") {
                        // this is for when direct sending message through window.askAi("hello")
                        sendMessage({ message: data });
                    } else {
                        // this is for when sending from SendDataToChatbot method window.SendDataToChatbot({bridgeName: 'asdlfj', askAi: "hello"})
                        setTimeout(() => {
                            sendMessage({ message: data.askAi || data?.message || "", customVariables: data?.variables || {}, customThreadId: data?.threadId || null, customBridgeSlug: data?.bridgeName || null });
                        }, 500);

                    }
                } else {
                    errorToast("Please wait for the response from AI");
                    return;
                }
            }
        },
        [chatState?.loading]
    );

    useEffect(() => {
        if (!isHelloUser) {
            window.addEventListener("message", handleMessage);
            return () => {
                window.removeEventListener("message", handleMessage);
            };
        }
    }, [handleMessage]);

    if (isHelloUser) {
        return {
            fetchAllThreads: () => { },
            getIntialChatHistory: () => { },
            getMoreChats: () => { },
            sendMessage: () => { },
            setToggleDrawer: (payload: boolean) => chatDispatch({ type: ChatActionTypes.SET_TOGGLE_DRAWER, payload }),
            setLoading: (payload: boolean) => chatDispatch({ type: ChatActionTypes.SET_LOADING, payload }),
            setChatsLoading: (payload: boolean) => chatDispatch({ type: ChatActionTypes.SET_CHATS_LOADING, payload }),
            setImages: (payload: string[]) => chatDispatch({ type: ChatActionTypes.SET_IMAGES, payload }),
            setOptions: (payload: string[]) => chatDispatch({ type: ChatActionTypes.SET_OPTIONS, payload }),
            setNewMessage: (payload: boolean) => chatDispatch({ type: ChatActionTypes.SET_NEW_MESSAGE, payload }),
            handleMessageFeedback: () => { }
        }
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
        setOptions: (payload: string[]) => chatDispatch({ type: ChatActionTypes.SET_OPTIONS, payload }),
        setNewMessage: (payload: boolean) => chatDispatch({ type: ChatActionTypes.SET_NEW_MESSAGE, payload }),
        handleMessageFeedback,
    };
}