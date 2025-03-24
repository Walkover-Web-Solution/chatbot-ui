'use client';
import { ThemeContext } from '@/components/AppWrapper';
import { ChatbotContext } from '@/components/context';
import { useSearchParams } from 'next/navigation';
import { useCallback, useContext, useEffect, useState } from 'react';

export default function ChatbotLayout({ children }: { children: React.ReactNode }) {
    const search = useSearchParams();
    const [chatbotConfig, setChatbotConfig] = useState({});
    const { themeColor, handleThemeChange } = useContext(ThemeContext);
    const interfaceDetails = search.get("interfaceDetails");
    const { chatbot_id, userId, token, config } = interfaceDetails ? JSON.parse(interfaceDetails) : { chatbot_id: null, userId: null, token: null, config: null };

    const onConfigChange = useCallback((config: any) => {
        if (!config) return;
        handleThemeChange(config.themeColor || "#000000");
        setChatbotConfig((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(config) && config) {
                // @ts-ignore 
                return { ...prev, ...config, hideCloseButton: config?.hideCloseButton ?? prev?.hideCloseButton };
            }
            return prev;
        });
    }, [handleThemeChange]);

    useEffect(() => {
        if (config) onConfigChange(config);
    }, [config]);

    const toggleHideCloseButton = useCallback(() => {
        setChatbotConfig((prev) => ({
            ...prev,
            hideCloseButton: !prev.hideCloseButton,
        }));
    }, []);

    return (
        <ChatbotContext.Provider
            value={{
                chatbotConfig,
                chatbot_id,
                userId,
                token,
                themeColor,
                onConfigChange,
                toggleHideCloseButton,
            }}
        >
            {children}
        </ChatbotContext.Provider>
    );
}
