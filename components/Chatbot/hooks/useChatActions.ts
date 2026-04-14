import { ChatContext } from '@/components/Chatbot-Wrapper/ChatbotWrapper';
import { errorToast } from '@/components/customToast';
import { MessageContext } from '@/components/Interface-Chatbot/InterfaceChatbot';
import { getAllThreadsApi, getPreviousMessage, streamDataToAction, sendFeedbackAction } from '@/config/api';
import { appendLastAssistantMessageChunk, appendReasoningChunk, appendToolCall, removeMessages, setChatsLoading, setData, setError, setHelloEventMessage, setImages, setInitialMessages, setIsFetching, setLoading, setNewMessage, setOptions, setPaginateMessages, setPlanningData, setStarterQuestions, setToggleDrawer, updateLastAssistantMessage, updatePlanningExecutionState, updateSingleMessage, updateToolResult } from '@/store/chat/chatSlice';
import { setThreads } from '@/store/interface/interfaceSlice';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import { PAGE_SIZE } from '@/utils/enums';
import React, { useCallback, useContext, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { SendMessagePayloadType } from './chatTypes';
import { emitEventToParent } from '@/utils/emitEventsToParent/emitEventsToParent';


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
        const result = await getAllThreadsApi({ threadId, bridgeName });
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
    const { threadId, subThreadId, bridgeName, variables, selectedAiServiceAndModal, userId, threadList, versionId, helloMode, latestMessageId } = useCustomSelector((state) => ({
        threadId: state.appInfo?.[tabSessionId]?.threadId,
        subThreadId: state.appInfo?.[tabSessionId]?.subThreadId,
        bridgeName: state.appInfo?.[tabSessionId]?.bridgeName,
        versionId: state.appInfo?.[tabSessionId]?.versionId || "null",
        variables: state.Interface?.[`${chatSessionId}_${tabSessionId}`]?.interfaceContext?.[state?.appInfo?.[tabSessionId]?.bridgeName]?.variables,
        selectedAiServiceAndModal: state.Interface?.[`${chatSessionId}_${tabSessionId}`]?.selectedAiServiceAndModal || null,
        userId: state.appInfo?.[tabSessionId]?.userId || null,
        threadList: state.Interface?.[`${chatSessionId}_${tabSessionId}`]?.interfaceContext?.[state.appInfo?.[tabSessionId]?.bridgeName]?.threadList?.[state.appInfo?.[tabSessionId]?.threadId],
        helloMode: state.Hello?.[chatSessionId]?.mode || [],
        latestMessageId: state.Chat?.messageIds?.[state.appInfo?.[tabSessionId]?.subThreadId]?.[0],
    }));

    const { images } = useCustomSelector((state) => ({
        images: state.Chat.images || [],
    }));

    const sendMessageRef = useRef<((payload: SendMessagePayloadType) => Promise<void>) | null>(null);

    const startTimeoutTimer = useCallback(() => {
        timeoutIdRef.current = setTimeout(() => {
            globalDispatch(updateLastAssistantMessage({ role: "assistant", wait: false, timeOut: true }));
            globalDispatch(setLoading(false));
        }, 240000);
    }, [globalDispatch, timeoutIdRef]);

    const sendMessage = useCallback(async ({
        message = '',
        customVariables = {},
        customThreadId = '',
        customBridgeSlug = '',
        apiCall = true,
        action,
        mode,
        silent,
        skipUserEcho,
        task_id,
    }: SendMessagePayloadType) => {
        const isPlanExecutionRequest = mode === "plan" && (action === "approve" || action === "execute" || action === "respond");
        const isPlanUpdateRequest = mode === "plan" && !action && skipUserEcho === true;
        const isInlinePlanRequest = isPlanExecutionRequest || isPlanUpdateRequest;
        globalDispatch(setNewMessage(true));
        const textMessage = message || (messageRef?.current as HTMLInputElement)?.value;
        const files = images
            ?.filter((url) => url.split(".").pop()?.toLowerCase() === "pdf")
            .map((url) => url);
        const imageUrls = images
            ?.filter((url) => url.split(".").pop()?.toLowerCase() !== "pdf")
            .map((url) => url);


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

        if (!skipUserEcho && !isInlinePlanRequest) {
            globalDispatch(setHelloEventMessage({ message: { role: "user", content: textMessage, urls: images } }));
        }
        if (!isInlinePlanRequest) {
            globalDispatch(setHelloEventMessage({ message: { role: "assistant", content: "", wait: true } }));
        }

        const payload = {
            message: textMessage,
            images: imageUrls,
            files,
            userId,
            flag: Boolean(helloMode?.includes("stream") && !(helloMode?.includes("widget") || helloMode?.includes("image_model"))),
            interfaceContextData: { ...variables, ...customVariables } || {},
            threadId: customThreadId || threadId,
            subThreadId: subThreadId,
            slugName: customBridgeSlug || bridgeName,
            thread_flag: ((threadList?.length === 1 && threadList?.[0]?.thread_id === threadList?.[0]?.sub_thread_id && threadList?.[0]?.display_name === threadList?.[0]?.thread_id) || (threadList?.[0]?.newChat && threadList?.[0]?.sub_thread_id === subThreadId)) ? true : false,
            chatBotId: chatSessionId,
            version_id: versionId === "null" ? null : versionId,
            ...((selectedAiServiceAndModal?.modal && selectedAiServiceAndModal?.service) ? {
                configuration: { model: selectedAiServiceAndModal?.modal },
                service: selectedAiServiceAndModal?.service
            } : {}),
            ...(action ? { action } : {}),
            ...(mode ? { mode } : {}),
            ...(silent ? { silent } : {}),
            ...(action === "respond" && task_id ? { task_id } : {}),
        };
        emitEventToParent('MESSAGE_SENT', payload.message);

        let planningStreamBuffer = "";
        let isPlanningStreamActive = false;
        let isExecutionStreamActive = isPlanExecutionRequest;

        const pushPlanningUpdate = (incoming: any, resetBuffer = false) => {
            if (resetBuffer) {
                planningStreamBuffer = "";
            }
            if (incoming === undefined || incoming === null) return;

            if (typeof incoming === "string") {
                planningStreamBuffer += incoming;
                try {
                    const parsed = JSON.parse(planningStreamBuffer);
                    globalDispatch(setPlanningData({ plan: parsed }));
                } catch (error) {
                    globalDispatch(setPlanningData({ rawPlan: planningStreamBuffer }));
                }
            } else {
                planningStreamBuffer = JSON.stringify(incoming);
                globalDispatch(setPlanningData({ plan: incoming }));
            }
        };

        const handleExecutionDelta = (raw: string) => {
            if (!raw) return false;
            try {
                const parsed = JSON.parse(raw);
                if (!parsed?.event) return false;

                if (parsed.event === "execution_started") {
                    isExecutionStreamActive = true;
                    globalDispatch(updatePlanningExecutionState({ executionState: parsed.state || "executing" }));
                    return true;
                }

                if (parsed.event === "task_started") {
                    isExecutionStreamActive = true;
                    globalDispatch(updatePlanningExecutionState({
                        executionState: "executing",
                        taskUpdate: {
                            id: parsed.task_id,
                            title: parsed.title,
                            status: "in_progress",
                        },
                    }));
                    return true;
                }

                if (parsed.event === "task_completed") {
                    isExecutionStreamActive = true;
                    globalDispatch(updatePlanningExecutionState({
                        executionState: "executing",
                        taskUpdate: {
                            id: parsed.task_id,
                            title: parsed.title,
                            status: "done",
                            result: parsed.result,
                        },
                    }));
                    return true;
                }

                if (parsed.event === "task_failed") {
                    isExecutionStreamActive = true;
                    globalDispatch(updatePlanningExecutionState({
                        executionState: "executing",
                        taskUpdate: {
                            id: parsed.task_id,
                            title: parsed.title,
                            status: "error",
                            error: parsed.error || parsed.result,
                        },
                    }));
                    return true;
                }
            } catch (error) {
                const normalized = raw.trim().toLowerCase();
                if (normalized === "running") {
                    isExecutionStreamActive = true;
                    globalDispatch(updatePlanningExecutionState({ executionState: "running" }));
                    return true;
                }
                return false;
            }
            return false;
        };

        const resetPlanningStream = () => {
            planningStreamBuffer = "";
            isPlanningStreamActive = false;
        };

        const finalizePlanningStream = () => {
            if (!isPlanningStreamActive) return;
            if (planningStreamBuffer) {
                try {
                    const parsed = JSON.parse(planningStreamBuffer);
                    globalDispatch(setPlanningData({ plan: parsed }));
                } catch (error) {
                    globalDispatch(setPlanningData({ rawPlan: planningStreamBuffer }));
                }
            }
            resetPlanningStream();
        };

        const response = await streamDataToAction(
            payload,
            (event) => {
                switch (event.event) {
                    case "start":
                        if (action === "respond") {
                            break;
                        }
                        if (isInlinePlanRequest) {
                            globalDispatch(updatePlanningExecutionState({ executionState: isPlanExecutionRequest ? "running" : "updating" }));
                            break;
                        }
                        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
                        globalDispatch(updateLastAssistantMessage({
                            role: "assistant",
                            wait: false,
                            isStreaming: true,
                            content: "",
                            id: event.message_id,
                        }));
                        break;
                    case "reasoning":
                        globalDispatch(appendReasoningChunk({ chunk: event.content || "" }));
                        break;
                    case "planning": {
                        isPlanningStreamActive = true;
                        const planningPayload = event.plan ?? event.content;
                        pushPlanningUpdate(planningPayload, true);
                        break;
                    }
                    case "execution":
                        isExecutionStreamActive = true;
                        globalDispatch(updatePlanningExecutionState({ executionState: event.state || "running" }));
                        break;
                    case "tool_call":
                        globalDispatch(appendToolCall({
                            call_id: event.call_id,
                            name: event.name,
                            args: event.args || {},
                        }));
                        break;
                    case "tool_result":
                        globalDispatch(updateToolResult({
                            call_id: event.call_id,
                            content: event.content,
                        }));
                        break;
                    case "delta":
                        if (isPlanningStreamActive) {
                            pushPlanningUpdate(event.content || "");
                        } else if (isExecutionStreamActive) {
                            handleExecutionDelta(event.content || "");
                            break;
                        } else if (isPlanUpdateRequest) {
                            break;
                        } else {
                            globalDispatch(appendLastAssistantMessageChunk({ chunk: event.content || "" }));
                        }
                        break;
                    case "done":
                        finalizePlanningStream();
                        if (action === "respond") {
                            globalDispatch(updatePlanningExecutionState({ executionState: "pending" }));
                            globalDispatch(setLoading(false));
                            if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
                            break;
                        }
                        if (isExecutionStreamActive) {
                            const finalExecutionContent = event?.response?.data?.content;
                            globalDispatch(updatePlanningExecutionState({
                                executionState: "completed",
                            }));
                            if (typeof finalExecutionContent === "string" && latestMessageId) {
                                globalDispatch(updateSingleMessage({
                                    messageId: latestMessageId,
                                    data: {
                                        content: finalExecutionContent,
                                        isStreaming: false,
                                        wait: false,
                                        message_id: event.message_id,
                                        finish_reason: event.finish_reason,
                                    },
                                }));
                            }
                        } else if (isPlanUpdateRequest) {
                            globalDispatch(updatePlanningExecutionState({ executionState: "updated" }));
                        } else {
                            globalDispatch(updateLastAssistantMessage({
                                role: "assistant",
                                isStreaming: false,
                                id: event.message_id,
                                finish_reason: event.finish_reason,
                                message_id: event.message_id,
                            }));
                        }
                        emitEventToParent('MESSAGE_RECEIVED', event.message_id);
                        globalDispatch(setLoading(false));
                        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
                        break;
                    case "error": {
                        const errMsg = event.error || "An error occurred while talking to AI";
                        emitEventToParent('MESSAGE_RECEIVED_WITH_ERROR', errMsg);
                        if (isExecutionStreamActive || isPlanUpdateRequest) {
                            globalDispatch(updatePlanningExecutionState({ executionState: "error" }));
                        } else {
                            globalDispatch(updateLastAssistantMessage({ role: "assistant", content: errMsg, id: event.message_id }));
                        }
                        globalDispatch(setLoading(false));
                        finalizePlanningStream();
                        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
                        break;
                    }
                    default:
                        break;
                }
            },
        );

        if (!response?.success && response?.error !== "aborted") {
            globalDispatch(setLoading(false));
            if (!isInlinePlanRequest) {
                globalDispatch(removeMessages({ numberOfMessages: 2 }));
            }
            globalDispatch(setError(response?.error || "Failed to send message. Please try again."));
        }
    }, [
        threadId, subThreadId, bridgeName, variables, selectedAiServiceAndModal,
        userId, threadList, versionId, images, messageRef, globalDispatch,
        startTimeoutTimer, chatSessionId, helloMode, timeoutIdRef, latestMessageId
    ]);

    sendMessageRef.current = sendMessage;

    return sendMessage;
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