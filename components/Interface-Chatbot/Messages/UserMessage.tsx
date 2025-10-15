/* eslint-disable */
import { addUrlDataHoc } from '@/hoc/addUrlDataHoc';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import { emitEventToParent } from '@/utils/emitEventsToParent/emitEventsToParent';
import { ALLOWED_EVENTS_TO_SUBSCRIBE } from '@/utils/enums';
import React, { useState } from 'react';
import ImageWithFallback from './ImageWithFallback';
import "./Message.css";
import MessageTime from './MessageTime';
import { Reply } from "lucide-react";

/**
 * A component that displays a user message card.
 * It includes an image with fallback, message content, and sender time.
 */

const UserMessageCard = React.memo(({ message, backgroundColor, textColor, chatSessionId, onReply }: any) => {
    const [showSenderTime, setShowSenderTime] = useState(false);
    const { sendEventToParentOnMessageClick, isHelloUser } = useCustomSelector((state) => ({
        sendEventToParentOnMessageClick: state.Interface?.[chatSessionId]?.eventsSubscribedByParent?.includes(ALLOWED_EVENTS_TO_SUBSCRIBE.MESSAGE_CLICK) || false,
        isHelloUser: state.draftData?.isHelloUser || false
    }))

    const handleMessageClick = () => {
        if (sendEventToParentOnMessageClick) {
            emitEventToParent("MESSAGE_CLICK", message)
        }
    }
    const handleReplyClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onReply) {
            onReply(message);
        }
    };
    return (
        <div className="flex flex-col items-end w-full pb-3 animate-slide-left" onClick={handleMessageClick}>
            {Array.isArray(message?.urls) && message.urls.length > 0 && (
                <div className="flex flex-row-reverse flex-wrap gap-2.5 w-full" onClick={() => setShowSenderTime(!showSenderTime)}>
                    {message.urls.map((url: any, index: number) => {
                        const imageUrl = typeof url === 'object' ? url?.path : url;

                        return (
                            <ImageWithFallback
                                key={index}
                                src={imageUrl}
                                alt={`Image ${index + 1}`}
                                style={{
                                    backgroundColor: backgroundColor,
                                    color: textColor,
                                    padding: "6px",
                                    borderRadius: "10px",
                                }}
                            />
                        );
                    })}
                </div>
            )}

            <div className="flex flex-col items-end w-full">
                {message?.content && (
                    <div className="flex items-start gap-2 w-full justify-end">
                        {isHelloUser && (
                            <button
                                onClick={handleReplyClick}
                                className="p-1 hover:bg-gray-100 rounded-full mt-2 flex-shrink-0"
                                title="Reply"
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <path
                                        d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </button>
                        )}
                        <div
                            className="p-2.5 min-w-[40px] sm:max-w-[80%] max-w-[90%] rounded-[10px_10px_1px_10px] break-words"
                            style={{
                                backgroundColor: backgroundColor,
                                color: textColor
                            }}
                            onClick={() => setShowSenderTime(!showSenderTime)}
                        >
                            <div className="card-body p-0">
                                <p className="whitespace-pre-wrap text-sm md:text-base">
                                    {message?.content}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                <div className={`transition-all duration-300 ease-in-out ${showSenderTime ? 'opacity-100 max-h-12' : 'opacity-0 max-h-0'}`}>
                    <MessageTime message={message} tooltipPosition="tooltip-left" />
                </div>
            </div>
        </div>
    );
});

export default addUrlDataHoc(UserMessageCard);