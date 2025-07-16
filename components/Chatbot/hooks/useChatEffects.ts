import { errorToast } from "@/components/customToast";
import { getHelloDetailsStart } from "@/store/hello/helloSlice";
import { useAppDispatch } from "@/store/useTypedHooks";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { useCallback, useEffect } from "react";
import { useFetchAllThreads, useGetInitialChatHistory, useSendMessage } from "./useChatActions";

export const useChatEffects = ({ chatSessionId, tabSessionId, messageRef, timeoutIdRef }: { chatSessionId: string, tabSessionId: string, messageRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>, timeoutIdRef: React.RefObject<NodeJS.Timeout | null>, }) => {
    const globalDispatch = useAppDispatch();
    const fetchAllThreads = useFetchAllThreads()
    const getIntialChatHistory = useGetInitialChatHistory()
    const sendMessage = useSendMessage({ messageRef, timeoutIdRef });
    const { threadId, subThreadId, bridgeName, isHelloUser, firstThread, loading } = useCustomSelector((state) => ({
        threadId: state.appInfo?.[tabSessionId]?.threadId,
        subThreadId: state.appInfo?.[tabSessionId]?.subThreadId,
        bridgeName: state.appInfo?.[tabSessionId]?.bridgeName,
        versionId: state.appInfo?.[tabSessionId]?.versionId || "null",
        isHelloUser: state.draftData?.isHelloUser || false,
        firstThread: state.Interface?.[chatSessionId]?.interfaceContext?.[state.appInfo?.[tabSessionId]?.bridgeName]?.threadList?.[state.appInfo?.[tabSessionId]?.threadId]?.[0],
        loading: state.Chat.loading || false,
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
        if (!isHelloUser) {
            window.addEventListener("message", handleMessage);
            return () => {
                window.removeEventListener("message", handleMessage);
            };
        }
    }, [handleMessage]);

    return null;
}