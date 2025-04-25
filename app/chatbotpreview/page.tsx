"use client";
import { ThemeContext } from '@/components/AppWrapper';
import ChatbotDrawer from '@/components/Interface-Chatbot/ChatbotDrawer';
import ChatbotHeader from '@/components/Interface-Chatbot/ChatbotHeader';
import ChatbotHeaderTab from '@/components/Interface-Chatbot/ChatbotHeaderTab';
import ChatbotTextField from '@/components/Interface-Chatbot/ChatbotTextField';
import MessageList from '@/components/Interface-Chatbot/Messages/MessageList';
import { useMediaQuery, useTheme } from '@mui/material';
import { useContext, useEffect, useRef, useState } from 'react';
export const runtime = "edge";

function ChatbotPreview() {
    const theme = useTheme();
    const containerRef = useRef(null);
    const isLargeScreen = useMediaQuery('(max-width: 1024px)')
    const [isToggledrawer, setToggleDrawer] = useState<boolean>(!isLargeScreen);
    const { handleThemeChange } = useContext(ThemeContext);
    const [messages, setMessages] = useState([]);
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event?.data?.type === "themeChange") {
                handleThemeChange(event.data.themeColor || "#000000");
            }
        };

        window.addEventListener("message", handleMessage);
        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, []);

    return (
        // <ChatbotWrapper />
        <div className="flex h-screen w-full overflow-hidden relative">
            {/* Sidebar - always visible on large screens */}
            <div className={`hidden lg:block bg-base-100 border-r overflow-y-auto transition-all duration-300 ease-in-out ${isToggledrawer ? ' w-64' : 'w-0'}`}>
                <ChatbotDrawer setToggleDrawer={setToggleDrawer} isToggledrawer={isToggledrawer} />
            </div>

            {/* Main content area */}

            <div className="flex flex-col flex-1 w-full">
                {/* Mobile header - hidden on large screens */}
                <ChatbotHeader containerRef={containerRef} setToggleDrawer={setToggleDrawer} isToggledrawer={isToggledrawer} preview />
                <ChatbotHeaderTab />

                {/* Messages container with flex layout */}
                <div
                    className={`overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent flex-1 ${messages.length === 0 ? 'flex items-center justify-center' : 'pb-10'}`}
                    id="message-container"
                    ref={null}
                >
                    <div className="w-full max-w-5xl mx-auto px-4">
                        <MessageList />
                    </div>
                </div>

                {/* Text input at bottom */}
                <div className="max-w-5xl mx-auto px-4 py-3 w-full">
                    <ChatbotTextField />
                </div>
            </div>
        </div>
    )
}

export default ChatbotPreview;