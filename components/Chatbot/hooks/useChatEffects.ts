import { errorToast } from "@/components/customToast";
import { useAppDispatch } from "@/store/useTypedHooks";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { useCallback, useEffect } from "react";
import { useFetchAllThreads, useGetInitialChatHistory, useSendMessage, useSubscribeChatbotDetails } from "./useChatActions";

export const useChatEffects = ({ chatSessionId, tabSessionId, messageRef, timeoutIdRef }: { chatSessionId: string, tabSessionId: string, messageRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>, timeoutIdRef: React.RefObject<NodeJS.Timeout | null>, }) => {
    const globalDispatch = useAppDispatch();
    const fetchAllThreads = useFetchAllThreads()
    const getIntialChatHistory = useGetInitialChatHistory()
    const sendMessage = useSendMessage({ messageRef, timeoutIdRef });
    const subscribeChatbotDetails = useSubscribeChatbotDetails();
    const { threadId, subThreadId, bridgeName, threadList, versionId, loading, serviceChanged, modelChanged, stream, widget, image_model } = useCustomSelector((state) => ({
        threadId: state.appInfo?.[tabSessionId]?.threadId,
        subThreadId: state.appInfo?.[tabSessionId]?.subThreadId,
        bridgeName: state.appInfo?.[tabSessionId]?.bridgeName,
        versionId: state.appInfo?.[tabSessionId]?.versionId || null,
        threadList: state.Interface?.[`${chatSessionId}_${tabSessionId}`]?.interfaceContext?.[state.appInfo?.[tabSessionId]?.bridgeName]?.threadList?.[state.appInfo?.[tabSessionId]?.threadId],
        loading: state.Chat.loading || false,
        serviceChanged: state.appInfo?.[tabSessionId]?.serviceChanged || false,
        modelChanged: state.appInfo?.[tabSessionId]?.modelChanged || false,
        stream: state.appInfo?.[tabSessionId]?.stream || false,
        widget: state.appInfo?.[tabSessionId]?.widget || false,
        image_model: state.appInfo?.[tabSessionId]?.image_model || false,
    }))
    useEffect(() => {
        if (bridgeName) {
            subscribeChatbotDetails();
        }
    }, [bridgeName, chatSessionId, serviceChanged, modelChanged, versionId, stream, widget, image_model, subscribeChatbotDetails])

    useEffect(() => {
        threadId && bridgeName && fetchAllThreads()
    }, [threadId, bridgeName, chatSessionId]);

    useEffect(() => {
        if (!(threadList?.[0]?.newChat && threadList?.[0]?.subThread_id === subThreadId)) {
            getIntialChatHistory();
        }
    }, [threadId, bridgeName, subThreadId]);

    const handleMessage = useCallback(
        (event: MessageEvent) => {
            if (event?.data?.type === "refresh") {
                getIntialChatHistory();
            }
            if (event?.data?.type === "askAi") {
                if (!loading) {
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
        [loading, sendMessage]
    );

    useEffect(() => {
        window.addEventListener("message", handleMessage);
        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, [handleMessage]);

    return null;
}