'use client';
import { ChatbotContext } from "@/components/context";
import { setDataInDraftReducer } from "@/store/draftData/draftDataSlice";
import { GetSessionStorageData, SetSessionStorage } from "@/utils/ChatbotUtility";
import { EmbedVerificationStatus } from "@/utils/enums";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
export const runtime = "edge";

export default function InterfaceEmbed() {
    const { chatbot_id, userId, token, isHelloUser, environment = null } = useContext(ChatbotContext);
    const router = useRouter();
    const [verifiedState, setVerifiedState] = useState(EmbedVerificationStatus.VERIFYING);
    const dispatch = useDispatch();

    useEffect(() => {
        const CHANNEL_NAME = 'tab_session_sync';
        const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null;
        const generateId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const existingId = GetSessionStorageData('tab_session_id');
        let tabSessionId = existingId || generateId();
        const isRefresh = !!existingId;
        const applyId = (id: string) => {
            tabSessionId = id;
            SetSessionStorage('tab_session_id', id);
            dispatch(setDataInDraftReducer({ tabSessionId: id }));
        };
        if (channel) {
            // Set up listener BEFORE broadcasting to avoid missing collision responses
            channel.onmessage = (event) => {
                const { type, id } = event.data || {};
                if (type === 'claim' && id === tabSessionId) {
                    // Collision: another tab claimed our ID, take a new one and re-announce
                    const newId = generateId();
                    applyId(newId);
                    channel.postMessage({ type: 'claim', id: newId });
                }
            };
            // On refresh, don't re-broadcast — the ID is already established and unique
            if (!isRefresh) {
                channel.postMessage({ type: 'claim', id: tabSessionId });
            }
        }
        applyId(tabSessionId);
        return () => {
            channel?.close();
        };
    }, [])

    useEffect(() => {
        if (token) {
            SetSessionStorage("interfaceToken", token);
            SetSessionStorage("interfaceUserId", userId);
            setVerifiedState(EmbedVerificationStatus.VERIFIED);
            dispatch(setDataInDraftReducer({ isHelloUser: false }))
        } else if (isHelloUser) {
            setVerifiedState(EmbedVerificationStatus.VERIFIED);
        }
    }, [token, userId, isHelloUser]);

    useEffect(() => {
        if (verifiedState === EmbedVerificationStatus.VERIFIED && chatbot_id) {
            dispatch(setDataInDraftReducer({ chatbotId: chatbot_id, chatSessionId: chatbot_id }))
            router.replace(`/chatbot/${chatbot_id}`);
        }
        if (isHelloUser && verifiedState === EmbedVerificationStatus.VERIFIED) {
            if (environment) {
                router.replace(`/chatbot/hello?env=${environment}`);
            } else {
                router.replace(`/chatbot/hello`);
            }
        }
    }, [verifiedState, chatbot_id, router, isHelloUser]);

    return (
        <div className="h-screen w-full flex items-center justify-center">
            {verifiedState === EmbedVerificationStatus.VERIFYING && (
                <span className="loading loading-ring loading-lg"></span>
            )}
            {verifiedState === EmbedVerificationStatus.NOT_VERIFIED && (
                <div>Something went wrong</div>
            )}
        </div>
    );
}