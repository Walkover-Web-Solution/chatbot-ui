'use client';
import { ThemeContext } from '@/components/AppWrapper';
import { ChatbotContext } from '@/components/context';
import { setDataInAppInfoReducer } from '@/store/appInfo/appInfoSlice';
import { setHuman } from '@/store/hello/helloSlice';
import { useSearchParams } from 'next/navigation';
import { useCallback, useContext, useEffect, useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';

export default function ChatbotLayout({ children }: { children: React.ReactNode }) {
    const search = useSearchParams();
    const [chatbotConfig, setChatbotConfig] = useState({});
    const { themeColor, handleThemeChange } = useContext(ThemeContext);
    const dispatch = useDispatch();
    // Use useMemo to parse interfaceDetails once and avoid repeated parsing
    const { chatbot_id, userId, token, config, isHelloUser } = useMemo(() => {
        const interfaceDetails = search.get("interfaceDetails");
        try {
            const parsedDetails = interfaceDetails
                ? JSON.parse(interfaceDetails)
                : { chatbot_id: null, userId: null, token: null, config: null, isHelloUser: true };
            return parsedDetails;
        } catch (e) {
            console.error("Error parsing interfaceDetails:", e);
            return { chatbot_id: null, userId: null, token: null, config: null, isHelloUser: true };
        }
    }, []);
    useEffect(() => {
        if (chatbot_id && userId) {
            dispatch(setDataInAppInfoReducer({
                chatBotId: chatbot_id,
                userId: userId,
                config: config
            }));
        }
    }, [chatbot_id, userId, config]);


    const onConfigChange = useCallback((config: any) => {
        if (!config) return;
        handleThemeChange(config.themeColor || "#000000");
        setChatbotConfig(prev => {
            // Avoid unnecessary string conversion for deep comparison
            const configChanged = JSON.stringify(prev) !== JSON.stringify(config);
            if (configChanged) {
                return {
                    ...prev,
                    ...config,
                    hideCloseButton: config?.hideCloseButton ?? prev?.hideCloseButton
                };
            }
            return prev;
        });
    }, [handleThemeChange]);

    useEffect(() => {
        if (config) onConfigChange(config);
    }, [config, onConfigChange]);

    const toggleHideCloseButton = useCallback(() => {
        setChatbotConfig(prev => ({
            ...prev,
            hideCloseButton: !prev.hideCloseButton,
        }));
    }, []);

    useEffect(() => {
        if (isHelloUser) {
            dispatch(setHuman({ isHuman: true }));
        }
    }, [isHelloUser])

    // Create context value with useMemo to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        chatbotConfig,
        chatbot_id,
        userId,
        token,
        themeColor,
        onConfigChange,
        toggleHideCloseButton,
        isHelloUser
    }), [chatbotConfig, chatbot_id, userId, token, themeColor, onConfigChange, toggleHideCloseButton, isHelloUser]);

    return (
        <ChatbotContext.Provider value={contextValue}>
            {children}
        </ChatbotContext.Provider>
    );
}