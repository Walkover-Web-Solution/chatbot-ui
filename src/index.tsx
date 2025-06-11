'use client'
import AppWrapper from '@/components/AppWrapper';
import ChatbotLayoutWrapper from '@/components/Chatbot-Wrapper/ChatbotLayoutWrapper';
import ChatbotWrapper from '@/components/Chatbot-Wrapper/ChatbotWrapper';
import React, { useCallback, useEffect } from 'react';

export default function ChatbotProvider({ embedToken, threadId, defaultOpen, bridgeName }: { embedToken: string, threadId?: string, defaultOpen?: any, bridgeName: string }) {
    const [interfaceDetails, setInterfaceDetails] = React.useState<any>({});
    useEffect(() => {
        const script = document.createElement('script');
        script.id = "chatbot-main-script";
        script.defer = true;
        script.setAttribute('src', 'http://localhost:3001/chatbot-package.js'); // Adjust the URL as needed
        script.setAttribute('bridgeName', 'sdk');
        script.setAttribute('threadId', 'MobileSdk');
        script.setAttribute('defaultOpen', 'true');
        script.setAttribute('embedToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdfaWQiOiIxMjg5IiwiY2hhdGJvdF9pZCI6IjY2NTk2YWU3ZjA0NGRlNzMzZTNlYzdlYiIsInVzZXJfaWQiOiJwYXJha2gifQ.ol_XuciFvI8fvDLPKJRQSSp08qEkWOIzU3zSps98a0I');
        document.head.appendChild(script);
        script.onload = () => {
            window.parent?.postMessage({ type: "interfaceLoaded" }, "*");
            window.postMessage({ type: "interfaceLoaded" }, "*");
            // window.initChatWidget();
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
                    <ChatbotLayoutWrapper props={{ interfaceDetails }}>
                        <ChatbotWrapper />
                    </ChatbotLayoutWrapper>
                </div>
            </div>
        </AppWrapper>
    );
}