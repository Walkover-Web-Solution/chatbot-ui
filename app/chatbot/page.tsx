'use client';
import { SetSessionStorage } from "@/utils/ChatbotUtility";
import { EmbedVerificationStatus } from "@/utils/enums";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { ChatbotContext } from "./layout";
export const runtime = "edge";
interface InterfaceEmbedProps {
    chatbot_id: string;
    config: any;
    token: string;
    userId: string;
}

export default function InterfaceEmbed() {
    const { chatbot_id, userId, token } = useContext(ChatbotContext);
    const router = useRouter();

    const [verifiedState, setVerifiedState] = useState(
        EmbedVerificationStatus.VERIFYING
    );
    const [details, setDetails] = useState({ chatbot_id: "" });

    useEffect(() => {
        if (token) authorizeUserAndSetDetails();
    }, [token]);

    useEffect(() => {
        if (verifiedState === EmbedVerificationStatus.VERIFIED) {
            router.replace(`/chatbot/${details.chatbot_id}`);
        }
    }, [verifiedState, details.chatbot_id]);

    const authorizeUserAndSetDetails = () => {
        // intefaceSetLocalStorage("interfaceToken", token);
        SetSessionStorage("interfaceToken", token);
        setVerifiedState(EmbedVerificationStatus.VERIFIED);
        setDetails({ chatbot_id });
        // localStorage.setItem("interfaceUserId", userId);
        SetSessionStorage("interfaceUserId", userId);
    };

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
