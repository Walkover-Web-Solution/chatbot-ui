/* eslint-disable */
import { UserAssistant } from "@/assests/assestsIndex";
import RenderHelloVedioCallMessage from "@/components/Hello/RenderHelloVedioCallMessage";
import { linkify } from "@/utils/utilities";
import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import RenderHelloAttachmentMessage from "../../Hello/RenderHelloAttachmentMessage";
import RenderHelloFeedbackMessage from "../../Hello/RenderHelloFeedbackMessage";
import RenderHelloInteractiveMessage from "../../Hello/RenderHelloInteractiveMessage";
import "./Message.css";
import MessageTime from "./MessageTime";

/**
 * A component that displays a human or bot message card.
 * It includes an avatar, message content, and sender time.
 */

interface MessageCardProps {
    message: any;
    isBot?: boolean;
    isLastMessage?: boolean;
}

interface ShadowDomProps {
    htmlContent: string;
    messageId: string;
}

// Message types as constants
const MESSAGE_TYPES = {
    VIDEO_CALL: 'video_call',
    INTERACTIVE: 'interactive',
    ATTACHMENT: 'attachment',
    TEXT_ATTACHMENT: 'text-attachment',
    FEEDBACK: 'feedback',
    PUSH_NOTIFICATION: 'pushNotification'
} as const;

// Bot icon URL as constant to prevent recreation
const BOT_ICON_URL = "https://img.icons8.com/ios/50/message-bot.png";

// Memoized avatar component to prevent unnecessary re-renders
const Avatar = React.memo(({ message, isBot }: { message: any; isBot: boolean }) => {
    const avatarContent = useMemo(() => {
        if (!isBot) {
            if (message?.from_name) {
                return (
                    <div className="w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full" style={{ color: "#606060" }}>
                        {message.from_name.charAt(0).toUpperCase()}
                    </div>
                );
            }
            return (
                <Image
                    width={24}
                    height={24}
                    src={UserAssistant}
                    alt="User"
                    className="opacity-70"
                />
            );
        }

        return (
            <Image
                width={24}
                height={24}
                src={BOT_ICON_URL}
                alt="Bot"
                className="opacity-70"
            />
        );
    }, [message?.from_name, isBot]);

    return (
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-base-200">
            <div className={`rounded-full ${isBot ? 'p-1 shadow-inner' : ''}`} style={!isBot ? { backgroundColor: "#e0e0e0" } : undefined}>
                {avatarContent}
            </div>
        </div>
    );
});

Avatar.displayName = 'Avatar';

// Optimized ShadowDomComponent with improved cleanup and performance
const ShadowDomComponent = React.memo(({ htmlContent, messageId }: ShadowDomProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState('auto');
    const shadowRootRef = useRef<ShadowRoot | null>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    // Memoized style content to prevent recreation
    const styleContent = useMemo(() => `
        :host {
            all: initial;
            display: block;
            width: 100%;
            min-height: auto;
            height: auto;
        }
        .shadow-content-container {
            width: 100%;
            min-height: auto;
            height: auto;
            box-sizing: border-box;
            background-color: white;
        }
    `, []);

    // Optimized cleanup function
    const cleanup = useCallback(() => {
        if (resizeObserverRef.current) {
            resizeObserverRef.current.disconnect();
            resizeObserverRef.current = null;
        }
    }, []);

    // Optimized script execution
    const executeScripts = useCallback((container: HTMLElement) => {
        if (!htmlContent.includes('<script>')) return;

        setTimeout(() => {
            const scripts = container.querySelectorAll('script');
            scripts?.forEach(oldScript => {
                const newScript = document.createElement('script');
                Array.from(oldScript.attributes)?.forEach(attr => {
                    newScript.setAttribute(attr.name, attr.value);
                });
                newScript.textContent = oldScript.textContent;
                oldScript.parentNode?.replaceChild(newScript, oldScript);
            });
        }, 0);
    }, [htmlContent]);

    // Optimized resize handler
    const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
        for (const entry of entries) {
            const height = entry.contentRect.height;
            setContentHeight(`${height}px`);

            if (containerRef.current) {
                containerRef.current.style.height = `${height}px`;
            }
        }
    }, []);

    useEffect(() => {
        cleanup();

        if (!containerRef.current) return;

        // Create or reuse shadow root
        if (!shadowRootRef.current) {
            shadowRootRef.current = containerRef.current.attachShadow({ mode: 'open' });
        } else {
            // Clear existing content efficiently
            shadowRootRef.current.replaceChildren();
        }

        // Create content container
        const contentContainer = document.createElement('div');
        contentContainer.className = 'shadow-content-container';
        contentContainer.style.cssText = 'width: 100%; min-height: auto; overflow: visible;';
        contentContainer.innerHTML = htmlContent;

        // Create style element
        const styleElement = document.createElement('style');
        styleElement.textContent = styleContent;

        // Append to shadow root
        shadowRootRef.current.appendChild(styleElement);
        shadowRootRef.current.appendChild(contentContainer);

        // Set up resize observer
        resizeObserverRef.current = new ResizeObserver(handleResize);
        resizeObserverRef.current.observe(contentContainer);

        // Execute scripts if needed
        executeScripts(contentContainer);

        return cleanup;
    }, [htmlContent, messageId, styleContent, cleanup, executeScripts, handleResize]);

    return (
        <div
            ref={containerRef}
            className="shadow-dom-container bg-white"
            data-message-id={messageId}
            style={{
                width: '100%',
                height: contentHeight,
                minHeight: 'auto',
                transition: 'height 0.2s ease-in-out'
            }}
        />
    );
});

ShadowDomComponent.displayName = 'ShadowDomComponent';

// Memoized message content renderer
const MessageContent = React.memo(({ message }: { message: any }) => {
    const content = useMemo(() => {
        const messageType = message?.message_type;

        switch (messageType) {
            case MESSAGE_TYPES.VIDEO_CALL:
                return <RenderHelloVedioCallMessage message={message} />;

            case MESSAGE_TYPES.INTERACTIVE:
                return <RenderHelloInteractiveMessage message={message} />;

            case MESSAGE_TYPES.ATTACHMENT:
            case MESSAGE_TYPES.TEXT_ATTACHMENT:
                return <RenderHelloAttachmentMessage message={message} />;

            case MESSAGE_TYPES.FEEDBACK:
                return <RenderHelloFeedbackMessage message={message} />;

            case MESSAGE_TYPES.PUSH_NOTIFICATION:
                return (
                    <ShadowDomComponent
                        htmlContent={message?.content}
                        messageId={message?.id}
                        key={message?.id}
                    />
                );

            default:
                return (
                    <div className="prose max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: linkify(message?.content) }}></div>
                    </div>
                );
        }
    }, [message?.message_type, message?.content, message?.id]);

    return content;
});

MessageContent.displayName = 'MessageContent';

const HumanOrBotMessageCard = React.memo(({ message, isBot = false, isLastMessage = false }: MessageCardProps) => {
    const [showSenderTime, setShowSenderTime] = useState(isLastMessage);
    return (
        <div className="w-full pb-3 animate-fade-in animate-slide-left">
            <div className="flex items-start gap-2 max-w-[90%]">
                {/* <Avatar message={message} isBot={isBot} /> */}
                <div className="w-fit whitespace-pre-wrap break-words" onClick={() => setShowSenderTime(!showSenderTime)}>
                    <div className="p-1 whitespace-pre-wrap w-full break-words message-card-backround">
                        <MessageContent message={message} />
                    </div>
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showSenderTime ? 'opacity-100 max-h-6' : 'opacity-0 max-h-0'}`}>
                        <div className="flex items-center gap-1 text-gray-500 pl-1 pt-0.5">
                            {message?.from_name && !message?.is_auto_response && (
                                <div className="text-xs">{message.from_name} •</div>
                            )}
                            {message?.is_auto_response && (
                                <div className="text-xs">Bot •</div>
                            )}
                            <MessageTime message={message} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

HumanOrBotMessageCard.displayName = 'HumanOrBotMessageCard';

export default HumanOrBotMessageCard;