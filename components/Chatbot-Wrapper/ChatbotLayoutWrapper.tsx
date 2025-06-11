'use client';
import { ThemeContext } from '@/components/AppWrapper';
import { ChatbotContext } from '@/components/context';
import { addUrlDataHoc } from '@/hoc/addUrlDataHoc';
import { setDataInAppInfoReducer } from '@/store/appInfo/appInfoSlice';
import { setHuman } from '@/store/hello/helloSlice';
import { setDataInTabInfo } from '@/store/tabInfo/tabInfoSlice';
import { GetSessionStorageData, SetSessionStorage } from '@/utils/ChatbotUtility';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

function ChatbotLayoutWrapper({ children, chatSessionId, tabSessionId, props }: { children: React.ReactNode, chatSessionId: string, tabSessionId: string, props?: any }) {
    const search = useSearchParams();
    const [chatbotConfig, setChatbotConfig] = useState({});
    const { themeColor, handleThemeChange } = useContext(ThemeContext);
    const dispatch = useDispatch();
    // Use useMemo to parse interfaceDetails once and avoid repeated parsing
    const { chatbot_id, userId, token, config, isHelloUser = false } = useMemo(() => {
        const interfaceDetails = search.get("interfaceDetails") || props?.interfaceDetails;
        // Default values if parsing fails or interfaceDetails is not provided
        const defaultValues = {
            chatbot_id: null,
            userId: null,
            token: null,
            config: null,
            isHelloUser: false
        };

        // Return default values if interfaceDetails is undefined or null
        if (!interfaceDetails) {
            return defaultValues;
        }

        // Handle case where interfaceDetails is the string "undefined"
        if (interfaceDetails === "undefined") {
            return defaultValues;
        }

        try {
            return typeof interfaceDetails === 'string' ? JSON.parse(interfaceDetails) : interfaceDetails;
        } catch (e) {
            console.error("Error parsing interfaceDetails:", e);
            return defaultValues;
        }
    }, [props?.interfaceDetails]);

    const { environment } = useMemo(() => {
        const env = search.get("env");
        return {
            environment: env && env === 'stage' ? env : null
        };
    }, []);

    useEffect(() => {
        if (chatbot_id && userId) {
            dispatch(setDataInAppInfoReducer({
                chatBotId: chatbot_id,
                userId: userId,
                config: config
            }));
        }
    }, [chatbot_id, userId, config, chatSessionId]);


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
        if (props?.interfaceDetails) {
            if (isHelloUser) {
                dispatch(setHuman({ isHelloUser: true }));
                dispatch(setDataInTabInfo({ isHelloUser: true }));
            } else {
                dispatch(setDataInTabInfo({ isHelloUser: false }));
            }
        }
    }, [isHelloUser, chatSessionId, props?.interfaceDetails]);

    useEffect(() => {
        let tabSessionId = GetSessionStorageData('tab_session_id');

        if (!tabSessionId) {
            tabSessionId = Date.now().toString();
            SetSessionStorage('tab_session_id', tabSessionId);
            dispatch(setDataInTabInfo({ tabSessionId }))
        }
    }, [])

    useEffect(() => {
        if (chatbot_id) {
            dispatch(setDataInTabInfo({ chatbotId: chatbot_id }))
        }
    }, [chatbot_id]);

    useEffect(() => {
        if (token) {
            SetSessionStorage("interfaceToken", token);
            SetSessionStorage("interfaceUserId", userId);
        }
    }, [token, userId, isHelloUser]);

    // Create context value with useMemo to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        chatbotConfig,
        chatbot_id,
        userId,
        token,
        themeColor,
        onConfigChange,
        toggleHideCloseButton,
        isHelloUser,
        environment
    }), [chatbotConfig, chatbot_id, userId, token, themeColor, onConfigChange, toggleHideCloseButton, isHelloUser, environment]);

    return (
        <ChatbotContext.Provider value={contextValue}>
            {tabSessionId ? children : null}
        </ChatbotContext.Provider>
    );
}

export default React.memo(addUrlDataHoc(ChatbotLayoutWrapper))