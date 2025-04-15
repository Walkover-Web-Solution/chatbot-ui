'use client';
import { ChatbotContext } from "@/components/context";
import { SetSessionStorage } from "@/utils/ChatbotUtility";
import { EmbedVerificationStatus } from "@/utils/enums";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
export const runtime = "edge";

export default function InterfaceEmbed() {
    const { chatbot_id, userId, token } = useContext(ChatbotContext);
    const router = useRouter();
    const [verifiedState, setVerifiedState] = useState(EmbedVerificationStatus.VERIFYING);
    
    useEffect(() => {
        if (token) {
            SetSessionStorage("interfaceToken", token);
            SetSessionStorage("interfaceUserId", userId);
            setVerifiedState(EmbedVerificationStatus.VERIFIED);
        }
    }, [token, userId]);

    useEffect(() => {
        if (verifiedState === EmbedVerificationStatus.VERIFIED && chatbot_id) {
            router.replace(`/chatbot/${chatbot_id}`);
        }
    }, [verifiedState, chatbot_id, router]);

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