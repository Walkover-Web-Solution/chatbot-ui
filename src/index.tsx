'use client'
import AppWrapper from '@/components/AppWrapper';
import ChatbotLayoutWrapper from '@/components/Chatbot-Wrapper/ChatbotLayoutWrapper';
import ChatbotWrapper from '@/components/Chatbot-Wrapper/ChatbotWrapper';
import React, { useCallback, useEffect } from 'react';
// import './index.css';

export interface ChatbotConfig {
    embedToken: string;
    bridgeName: string;
    threadId?: string;
    defaultOpen?: boolean;
    parentId?: string;
    fullScreen?: boolean;
    onLoad?: () => void;
    onError?: (error: Error) => void;
    onMessage?: (message: any) => void;
}
export default function ChatbotProvider(chatbotConfig: ChatbotConfig) {
    const [interfaceDetails, setInterfaceDetails] = React.useState<any>({});

    useEffect(() => {
        const script = document.createElement('script');
        script.id = "chatbot-main-script";
        script.defer = true;
        script.setAttribute('src', 'http://localhost:3001/chatbot-package.js'); // Adjust the URL as needed
        script.setAttribute('embedToken', chatbotConfig?.embedToken || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdfaWQiOiIxMjg5IiwiY2hhdGJvdF9pZCI6IjY2NTk2YWU3ZjA0NGRlNzMzZTNlYzdlYiIsInVzZXJfaWQiOiJwYXJha2gifQ.ol_XuciFvI8fvDLPKJRQSSp08qEkWOIzU3zSps98a0I');
        script.setAttribute('bridgeName', chatbotConfig?.bridgeName || 'sdk');
        script.setAttribute('threadId', chatbotConfig?.threadId || 'MobileSdk');
        script.setAttribute('defaultOpen', chatbotConfig?.defaultOpen !== undefined ? String(chatbotConfig.defaultOpen) : 'true');
        script.setAttribute('parentId', chatbotConfig?.parentId || null);
        script.setAttribute('fullScreen', chatbotConfig?.fullScreen !== undefined ? String(chatbotConfig.fullScreen) : 'false');
        document.head.appendChild(script);
        script.onload = () => {
            chatbotConfig?.onLoad?.();
        };
        return () => {
            document.head.removeChild(script);
        };
    }, [])

    const handleEvents = useCallback((event: MessageEvent) => {
        const type = event.data?.type;
        switch (type) {
            case 'initializeChatbot':
                const interfaceDetails = event.data?.data;
                setInterfaceDetails(interfaceDetails);
                break;
            default:
                break;
        }
    }, []);

    useEffect(() => {
        window.addEventListener('message', handleEvents)
    }, [])

    return (
        <AppWrapper>
            <div id="hello-chatbot-iframe-container" className='hidden popup-parent-container relative w-full h-full'>
                <div className='w-full h-full'>
                    {
                        Object.keys(interfaceDetails).length === 0 ? (
                            <div className="w-full h-screen flex items-center justify-center">
                                <div className="text-gray-500">Loading...</div>
                            </div>
                        ) : (
                            <ChatbotLayoutWrapper props={{ interfaceDetails }}>
                                <ChatbotWrapper />
                            </ChatbotLayoutWrapper>
                        )
                    }
                </div>
            </div>
        </AppWrapper>
    );
}