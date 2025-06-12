'use client'
import AppWrapper from '@/components/AppWrapper';
import ChatbotLayoutWrapper from '@/components/Chatbot-Wrapper/ChatbotLayoutWrapper';
import ChatbotWrapper from '@/components/Chatbot-Wrapper/ChatbotWrapper';
import React, { useCallback, useEffect } from 'react';
// import './index.css';

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
            // window.parent?.postMessage({ type: "interfaceLoaded" }, "*");
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

    console.log(interfaceDetails, 'interfaceDetails')
    return (
        <AppWrapper>
            <div className="w-full h-screen overflow-auto border border-gray-300 rounded-lg mb-4 p-4 bg-white shadow-sm">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Scrollable Content</h3>
                    <p>This is a scrollable rectangle container. You can add more content here to see the scrolling effect.</p>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor.</p>
                    <p>Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus. Mauris iaculis porttitor posuere.</p>
                    <p>Praesent id metus massa, ut blandit odio. Proin quis tortor orci. Etiam at risus et justo dignissim congue. Donec congue lacinia dui, a porttitor lectus condimentum laoreet.</p>
                    <p>Nunc eu ullamcorper orci. Quisque eget odio ac lectus vestibulum faucibus eget in metus. In pellentesque faucibus vestibulum.</p>
                    <p>Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus. Mauris iaculis porttitor posuere.</p>
                    <p>Praesent id metus massa, ut blandit odio. Proin quis tortor orci. Etiam at risus et justo dignissim congue. Donec congue lacinia dui, a porttitor lectus condimentum laoreet.</p>
                    <p>Nunc eu ullamcorper orci. Quisque eget odio ac lectus vestibulum faucibus eget in metus. In pellentesque faucibus vestibulum.</p>
                    <p>Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus. Mauris iaculis porttitor posuere.</p>
                    <p>Praesent id metus massa, ut blandit odio. Proin quis tortor orci. Etiam at risus et justo dignissim congue. Donec congue lacinia dui, a porttitor lectus condimentum laoreet.</p>
                    <p>Nunc eu ullamcorper orci. Quisque eget odio ac lectus vestibulum faucibus eget in metus. In pellentesque faucibus vestibulum.</p>
                    <p>Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus. Mauris iaculis porttitor posuere.</p>
                    <p>Praesent id metus massa, ut blandit odio. Proin quis tortor orci. Etiam at risus et justo dignissim congue. Donec congue lacinia dui, a porttitor lectus condimentum laoreet.</p>
                    <p>Nunc eu ullamcorper orci. Quisque eget odio ac lectus vestibulum faucibus eget in metus. In pellentesque faucibus vestibulum.</p>
                    <p>Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus. Mauris iaculis porttitor posuere.</p>
                    <p>Praesent id metus massa, ut blandit odio. Proin quis tortor orci. Etiam at risus et justo dignissim congue. Donec congue lacinia dui, a porttitor lectus condimentum laoreet.</p>
                    <p>Nunc eu ullamcorper orci. Quisque eget odio ac lectus vestibulum faucibus eget in metus. In pellentesque faucibus vestibulum.</p>
                    <p>Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus. Mauris iaculis porttitor posuere.</p>
                    <p>Praesent id metus massa, ut blandit odio. Proin quis tortor orci. Etiam at risus et justo dignissim congue. Donec congue lacinia dui, a porttitor lectus condimentum laoreet.</p>
                    <p>Nunc eu ullamcorper orci. Quisque eget odio ac lectus vestibulum faucibus eget in metus. In pellentesque faucibus vestibulum.</p>
                    <p>Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus. Mauris iaculis porttitor posuere.</p>
                    <p>Praesent id metus massa, ut blandit odio. Proin quis tortor orci. Etiam at risus et justo dignissim congue. Donec congue lacinia dui, a porttitor lectus condimentum laoreet.</p>
                    <p>Nunc eu ullamcorper orci. Quisque eget odio ac lectus vestibulum faucibus eget in metus. In pellentesque faucibus vestibulum.</p>
                </div>
            </div>
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