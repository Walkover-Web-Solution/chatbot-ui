'use client';
import { ChatbotContext } from "@/components/context";
import { setDataInTabInfo } from "@/store/tabInfo/tabInfoSlice";
import { SetSessionStorage } from "@/utils/ChatbotUtility";
import { EmbedVerificationStatus } from "@/utils/enums";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
export const runtime = "edge";

export default function InterfaceEmbed() {
    const { chatbot_id, userId, token, isHelloUser } = useContext(ChatbotContext);
    const router = useRouter();
    const [verifiedState, setVerifiedState] = useState(EmbedVerificationStatus.VERIFYING);
    const dispatch = useDispatch();
    useEffect(() => {
        if (token) {
            SetSessionStorage("interfaceToken", token);
            SetSessionStorage("interfaceUserId", userId);
            setVerifiedState(EmbedVerificationStatus.VERIFIED);
        } else if (isHelloUser) {
            setVerifiedState(EmbedVerificationStatus.VERIFIED);
        }
    }, [token, userId, isHelloUser]);

    useEffect(() => {
        if (verifiedState === EmbedVerificationStatus.VERIFIED && chatbot_id) {
            dispatch(setDataInTabInfo({ chatbotId: chatbot_id }))
            router.replace(`/chatbot/${chatbot_id}`);
        }
        if (isHelloUser && verifiedState === EmbedVerificationStatus.VERIFIED) {
            router.replace(`/chatbot/hello`);
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