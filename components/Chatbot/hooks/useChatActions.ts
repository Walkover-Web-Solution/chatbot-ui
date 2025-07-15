import { ChatContext } from '@/components/Chatbot-Wrapper/ChatbotWrapper';
import { errorToast } from '@/components/customToast';
import { MessageContext } from '@/components/Interface-Chatbot/InterfaceChatbot';
import { getAllThreadsApi, getPreviousMessage, sendDataToAction, sendFeedbackAction } from '@/config/api';
import { removeMessages, setChatsLoading, setData, setHelloEventMessage, setImages, setInitialMessages, setIsFetching, setLoading, setNewMessage, setOptions, setPaginateMessages, setStarterQuestions, setToggleDrawer, updateLastAssistantMessage, updateSingleMessage } from '@/store/chat/chatSlice';
import { setThreads } from '@/store/interface/interfaceSlice';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import { PAGE_SIZE } from '@/utils/enums';
import React, { useCallback, useContext, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { SendMessagePayloadType } from './chatTypes';


export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChatContext must be used within a ChatContextProvider');
    }
    return context;
};

// Option 1: Individual hooks approach
export const useFetchAllThreads = () => {
    const globalDispatch = useDispatch();
    const { tabSessionId } = useChatContext();
    const { threadId, bridgeName } = useCustomSelector((state) => ({
        threadId: state.appInfo?.[tabSessionId]?.threadId,
        bridgeName: state.appInfo?.[tabSessionId]?.bridgeName,
    }));

    return useCallback(async () => {
        const result = await getAllThreadsApi({ threadId, bridgeName});
        if (result?.success) {
            globalDispatch(
                setThreads({ bridgeName, threadId, threadList: result?.threads })
            );
        }
    }, [threadId, bridgeName, globalDispatch]);
};

export const useGetInitialChatHistory = () => {
    const globalDispatch = useDispatch();
    const { tabSessionId } = useChatContext();
    const { threadId, subThreadId, bridgeName } = useCustomSelector((state) => ({
        threadId: state.appInfo?.[tabSessionId]?.threadId,
        subThreadId: state.appInfo?.[tabSessionId]?.subThreadId,
        bridgeName: state.appInfo?.[tabSessionId]?.bridgeName,
    }));

    return useCallback(async () => {
        if (threadId && bridgeName) {
            globalDispatch(setChatsLoading(true));
            try {
                const { previousChats, starterQuestion } = await getPreviousMessage(
                    threadId,
                    bridgeName,
                    1,
                    subThreadId
                );
                if (Array.isArray(previousChats)) {
                    globalDispatch(setInitialMessages({ messages: previousChats }));
                    globalDispatch(setData({
                        currentPage: 1,
                        hasMoreMessages: previousChats?.length >= PAGE_SIZE.gtwy
                    }));
                } else {
                    globalDispatch(setInitialMessages({ messages: [] }));
                    globalDispatch(setData({
                        hasMoreMessages: false
                    }));
                    console.warn("previousChats is not an array");
                }
                if (Array.isArray(starterQuestion)) {
                    globalDispatch(setStarterQuestions(starterQuestion));
                }
            } catch (error) {
                console.warn("Error fetching previous chats:", error);
                globalDispatch(setInitialMessages({ messages: [] }));
                globalDispatch(setData({ hasMoreMessages: false }));
            } finally {
                globalDispatch(setChatsLoading(false));
            }
        }
    }, [threadId, subThreadId, bridgeName, globalDispatch]);
};

export const useGetMoreChats = () => {
    const globalDispatch = useDispatch();
    const { tabSessionId } = useChatContext();
    const { threadId, subThreadId, bridgeName } = useCustomSelector((state) => ({
        threadId: state.appInfo?.[tabSessionId]?.threadId,
        subThreadId: state.appInfo?.[tabSessionId]?.subThreadId,
        bridgeName: state.appInfo?.[tabSessionId]?.bridgeName,
    }));

    const { isFetching, hasMoreMessages, currentPage } = useCustomSelector((state) => ({
        isFetching: state.Chat.isFetching,
        hasMoreMessages: state.Chat.hasMoreMessages,
        currentPage: state.Chat.currentPage,
    }));

    return useCallback(async () => {
        if (isFetching || !hasMoreMessages) return;
        globalDispatch(setIsFetching(true));
        try {
            const nextPage = currentPage + 1;
            const { previousChats } = await getPreviousMessage(
                threadId,
                bridgeName,
                nextPage,
                subThreadId
            );

            if (Array.isArray(previousChats) && previousChats.length > 0) {
                globalDispatch(setPaginateMessages({ messages: [...previousChats] }));
                globalDispatch(setData({
                    currentPage: nextPage,
                    hasMoreMessages: previousChats?.length >= PAGE_SIZE.gtwy
                }));
            } else {
                globalDispatch(setData({
                    hasMoreMessages: false
                }));
            }
        } catch (error) {
            console.warn("Error fetching more messages:", error);
            errorToast("Failed to load more messages.");
        } finally {
            globalDispatch(setIsFetching(false));
        }
    }, [isFetching, hasMoreMessages, currentPage, threadId, subThreadId, bridgeName, globalDispatch]);
};

export const useSendMessage = ({
    messageRef: propMessageRef,
    timeoutIdRef: propTimeoutIdRef
}: {
    messageRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>,
    timeoutIdRef?: React.RefObject<NodeJS.Timeout | null>,
}) => {
    const globalDispatch = useDispatch();
    const context = useContext(MessageContext);
    const messageRef = propMessageRef ?? context.messageRef;
    const timeoutIdRef = propTimeoutIdRef ?? context.timeoutIdRef;
    const { tabSessionId, chatSessionId } = useChatContext();
    const { threadId, subThreadId, bridgeName, variables, selectedAiServiceAndModal, userId, threadList, versionId } = useCustomSelector((state) => ({
        threadId: state.appInfo?.[tabSessionId]?.threadId,
        subThreadId: state.appInfo?.[tabSessionId]?.subThreadId,
        bridgeName: state.appInfo?.[tabSessionId]?.bridgeName,
        versionId: state.appInfo?.[tabSessionId]?.versionId || "null",
        variables: state.Interface?.[chatSessionId]?.interfaceContext?.[state?.appInfo?.[tabSessionId]?.bridgeName]?.variables,
        selectedAiServiceAndModal: state.Interface?.[chatSessionId]?.selectedAiServiceAndModal || null,
        userId: state.appInfo?.[tabSessionId]?.userId || null,
        threadList: state.Interface?.[chatSessionId]?.interfaceContext?.[state.appInfo?.[tabSessionId]?.bridgeName]?.threadList?.[state.appInfo?.[tabSessionId]?.threadId]
    }));

    const { images } = useCustomSelector((state) => ({
        images: state.Chat.images || [],
    }));

    const startTimeoutTimer = useCallback(() => {
        timeoutIdRef.current = setTimeout(() => {
            globalDispatch(updateLastAssistantMessage({ role: "assistant", wait: false, timeOut: true }));
            globalDispatch(setLoading(false));
        }, 240000);
    }, [globalDispatch, timeoutIdRef]);

    return useCallback(async ({ message = '', customVariables = {}, customThreadId = '', customBridgeSlug = '', apiCall = true }: SendMessagePayloadType) => {
        globalDispatch(setNewMessage(true));
        const textMessage = message || (messageRef?.current as HTMLInputElement)?.value;
        const imageUrls = Array.isArray(images) && images?.length ? images : [];

        if (!textMessage && imageUrls.length === 0) return;
        if (messageRef.current) {
            messageRef.current.value = "";
        }
        globalDispatch(setLoading(true));
        globalDispatch(setOptions([]));
        startTimeoutTimer();

        globalDispatch(setData({
            options: [],
            images: [],
        }));

        globalDispatch(setHelloEventMessage({ message: { role: "user", content: textMessage, urls: imageUrls } }));
        globalDispatch(setHelloEventMessage({ message: { role: "assistant", content: "Talking with AI", wait: true } }));

        const payload = {
            message: textMessage,
            images: imageUrls,
            userId,
            interfaceContextData: { ...variables, ...customVariables } || {},
            threadId: customThreadId || threadId,
            subThreadId: subThreadId,
            slugName: customBridgeSlug || bridgeName,
            thread_flag: ((threadList?.length === 1 && threadList?.[0]?.thread_id === threadList?.[0]?.sub_thread_id &&  threadList?.[0]?.display_name === threadList?.[0]?.thread_id)|| (threadList?.[0]?.newChat && threadList?.[0]?.sub_thread_id === subThreadId)) ? true : false,
            chatBotId: chatSessionId,
            version_id: versionId === "null" ? null : versionId,
            ...((selectedAiServiceAndModal?.modal && selectedAiServiceAndModal?.service) ? {
                configuration: { model: selectedAiServiceAndModal?.modal },
                service: selectedAiServiceAndModal?.service
            } : {})
        };
        const response = await sendDataToAction(payload);
        if (!response?.success) {
            globalDispatch(setLoading(false));
            globalDispatch(removeMessages({ numberOfMessages: 2 }));
            return;
        }
    }, [
        threadId, subThreadId, bridgeName, variables, selectedAiServiceAndModal,
        userId, threadList, versionId, images, messageRef, globalDispatch,
        startTimeoutTimer, chatSessionId
    ]);
};

export const useMessageFeedback = () => {
    const globalDispatch = useDispatch();
    const { tabSessionId } = useChatContext();
    const { subThreadId } = useCustomSelector((state) => ({
        subThreadId: state.appInfo?.[tabSessionId]?.subThreadId,
    }));

    const { msgIdAndDataMap } = useCustomSelector((state) => ({
        msgIdAndDataMap: state.Chat.msgIdAndDataMap?.[subThreadId] || {},
    }));

    return useCallback(async (payload: { msgId: string, feedback: number, reduxMsgId: string }) => {
        const { msgId, feedback, reduxMsgId } = payload;
        const currentStatus = msgIdAndDataMap?.[reduxMsgId]?.user_feedback;
        if (msgId && feedback && currentStatus !== feedback) {
            const response = await sendFeedbackAction({
                messageId: msgId,
                feedbackStatus: feedback,
            });
            if (response?.success) {
                globalDispatch(updateSingleMessage({
                    messageId: reduxMsgId,
                    data: { user_feedback: feedback }
                }));
            }
        }
    }, [msgIdAndDataMap, globalDispatch]);
};

export const useChatActions = () => {
    const globalDispatch = useDispatch();

    return useMemo(() => ({
        setToggleDrawer: (payload: boolean) => globalDispatch(setToggleDrawer(payload)),
        setLoading: (payload: boolean) => globalDispatch(setLoading(payload)),
        setChatsLoading: (payload: boolean) => globalDispatch(setChatsLoading(payload)),
        setImages: (payload: string[]) => globalDispatch(setImages(payload)),
        setOptions: (payload: string[]) => globalDispatch(setOptions(payload)),
        setNewMessage: (payload: boolean) => globalDispatch(setNewMessage(payload)),
    }), [globalDispatch]);
};