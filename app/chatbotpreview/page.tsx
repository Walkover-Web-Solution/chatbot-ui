"use client";
import { ThemeContext } from '@/components/AppWrapper';
import { useMediaQuery, useTheme } from '@mui/material';
import { useContext, useEffect, useRef, useState } from 'react';
import { Send, Menu, X, Image, Paperclip, Mic, Bot, User, ChevronDown, MessageSquare, Phone, Video } from 'lucide-react';
export const runtime = "edge";

function ChatbotPreview() {
    const theme = useTheme();
    const containerRef = useRef(null);
    const isLargeScreen = useMediaQuery('(max-width: 1024px)')
    const [isToggledrawer, setToggleDrawer] = useState<boolean>(false);
    const { handleThemeChange } = useContext(ThemeContext);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! How can I help you today?", sender: "bot", timestamp: new Date().toISOString() },
        { id: 2, text: "I have a question about your services.", sender: "user", timestamp: new Date().toISOString() },
        { id: 3, text: "Sure, I'd be happy to help with any questions about our services. What would you like to know?", sender: "bot", timestamp: new Date().toISOString() }
    ]);
    const [newMessage, setNewMessage] = useState("");
    const messageRef = useRef<HTMLTextAreaElement>(null);
    const isLight = true;
    const buttonDisabled = !newMessage.trim();

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

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            const userMessage = {
                id: messages.length + 1,
                text: newMessage,
                sender: "user",
                timestamp: new Date().toISOString()
            };

            setMessages([...messages, userMessage]);
            setNewMessage("");

            // Simulate bot response
            setTimeout(() => {
                const botMessage = {
                    id: messages.length + 2,
                    text: "Thanks for your message. I'm a demo bot response.",
                    sender: "bot",
                    timestamp: new Date().toISOString()
                };
                setMessages(prev => [...prev, botMessage]);
            }, 1000);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const focusTextField = () => {
        if (messageRef.current) {
            messageRef.current.focus();
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden relative bg-base-100">
            {/* Sidebar - always visible on large screens */}
            <div className={`hidden lg:block bg-base-100 border-r border-base-300 overflow-y-auto transition-all duration-300 ease-in-out ${isToggledrawer ? 'w-64' : 'w-0'}`}>
                <div className="p-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Conversations</h2>
                        <button className="btn btn-sm btn-ghost btn-circle" onClick={() => setToggleDrawer(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    <div className="space-y-2">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="card bg-base-200 hover:bg-base-300 cursor-pointer p-3 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="avatar placeholder">
                                        <div className="bg-neutral text-neutral-content rounded-full w-10">
                                            <span><MessageSquare size={16} /></span>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Conversation {item}</h3>
                                        <p className="text-xs opacity-70">Last message: 2h ago</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main content area */}
            <div className="flex flex-col flex-1 w-full">
                {/* Header */}
                <div className="navbar bg-base-100 border-b border-base-300 px-4">
                    <div className="navbar-start">
                        <button
                            className="btn btn-ghost btn-circle"
                            onClick={() => setToggleDrawer(!isToggledrawer)}
                        >
                            {isToggledrawer ? null : <Menu size={18} />}
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="avatar placeholder">
                                <div className="bg-primary text-primary-content rounded-full w-10"
                                    style={{
                                        backgroundColor: theme?.palette?.primary?.main,
                                        color: isLight ? 'white' : 'black'
                                    }}>
                                    <span><Bot size={18} /></span>
                                </div>
                            </div>
                            <div>
                                <h2 className="font-bold">AI Assistant</h2>
                                <p className="text-xs opacity-70">Online</p>
                            </div>
                        </div>
                    </div>
                    <div className="navbar-end">
                        <div className="flex gap-1">
                            <button className="btn btn-ghost btn-circle">
                                <Phone size={18} />
                            </button>
                            <button className="btn btn-ghost btn-circle">
                                <Video size={18} />
                            </button>
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                                    <ChevronDown size={18} />
                                </div>
                                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                                    <li><a>Settings</a></li>
                                    <li><a>Clear conversation</a></li>
                                    <li><a>Help</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile drawer - only visible when toggled on small screens */}
                {isLargeScreen && isToggledrawer && (
                    <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setToggleDrawer(false)}>
                        <div className="bg-base-100 h-full w-64 overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold">Conversations</h2>
                                    <button className="btn btn-sm btn-ghost btn-circle" onClick={() => setToggleDrawer(false)}>
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className="card bg-base-200 hover:bg-base-300 cursor-pointer p-3 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="avatar placeholder">
                                                    <div className="bg-neutral text-neutral-content rounded-full w-10">
                                                        <span><MessageSquare size={16} /></span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">Conversation {item}</h3>
                                                    <p className="text-xs opacity-70">Last message: 2h ago</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Messages container */}
                <div
                    className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent flex-1 p-4"
                    id="message-container"
                    ref={containerRef}
                >
                    <div className="w-full max-w-3xl mx-auto space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`chat ${message.sender === 'bot' ? 'chat-start' : 'chat-end'}`}
                            >
                                <div className="chat-image avatar placeholder">
                                    <div className={`rounded-full w-10 ${message.sender === 'bot' ? '' : ''}`}>
                                        <span>{message.sender === 'bot' ? <Bot size={16} /> : <User size={16} />}</span>
                                    </div>
                                </div>
                                <div className={`${message.sender === 'bot' ? '' : 'chat-bubble'}`} style={{ backgroundColor: message.sender === 'bot' ? '' : theme.palette.primary.main }}>
                                    {message.text}
                                </div>
                                <div className="chat-footer opacity-50 text-xs">
                                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Text input at bottom */}
                <div className="p-4 border-t border-base-300 bg-base-100">
                    <div className="w-full max-w-3xl mx-auto">
                        <div className="relative w-full rounded-lg shadow-sm">
                            <div className="w-full h-full cursor-text" onClick={focusTextField}>
                                <div
                                    className="relative flex-col h-full items-center justify-between gap-2 p-2 bg-white rounded-xl border border-gray-300 focus-within:outline focus-within:outline-2 focus-within:outline-offset-0"
                                    style={{ outlineColor: theme.palette.primary.main }}
                                >
                                    <textarea
                                        ref={messageRef}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Message AI Assistant..."
                                        value={newMessage}
                                        onKeyDown={handleKeyDown}
                                        className="p-1 h-full min-h-[40px] max-h-[400px] bg-transparent focus:outline-none w-full resize-none"
                                        rows={1}
                                    />

                                    <div className="flex flex-row justify-between gap-2 h-full self-end mr-2">
                                        <div className="flex items-center gap-2">
                                            <button className="btn btn-ghost btn-circle btn-sm">
                                                <Paperclip size={16} />
                                            </button>
                                            <button className="btn btn-ghost btn-circle btn-sm">
                                                <Image size={16} />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => !buttonDisabled && handleSendMessage()}
                                            className="rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:scale-105 transition-transform duration-200"
                                            // disabled={buttonDisabled}
                                            style={{
                                                backgroundColor: buttonDisabled ? '#d1d5db' : theme.palette.primary.main
                                            }}
                                            aria-label="Send message"
                                        >
                                            <Send className={`w-3 h-3 md:w-4 md:h-4 ${isLight ? 'text-white' : 'text-black'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatbotPreview;