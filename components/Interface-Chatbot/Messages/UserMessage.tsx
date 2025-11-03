/* eslint-disable */
import { addUrlDataHoc } from '@/hoc/addUrlDataHoc';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import { emitEventToParent } from '@/utils/emitEventsToParent/emitEventsToParent';
import { ALLOWED_EVENTS_TO_SUBSCRIBE } from '@/utils/enums';
import { Reply } from "lucide-react";
import React, { useCallback, useState } from 'react';
import { useReplyContext } from "../contexts/ReplyContext";
import ImageWithFallback from './ImageWithFallback';
import "./Message.css";
import MessageTime from './MessageTime';

/**
 * A component that displays a user message card.
 * It includes an image with fallback, message content, and sender time.
 */

const UserMessageCard = React.memo(({ message, backgroundColor, textColor, chatSessionId }: any) => {
    const [showSenderTime, setShowSenderTime] = useState(false);
    const [showReplyButton, setShowReplyButton] = useState(false);
    const { setReplyToMessage } = useReplyContext();

    const { sendEventToParentOnMessageClick } = useCustomSelector((state) => ({
        sendEventToParentOnMessageClick: state.Interface?.[chatSessionId]?.eventsSubscribedByParent?.includes(ALLOWED_EVENTS_TO_SUBSCRIBE.MESSAGE_CLICK) || false
    }))

    const handleMessageClick = () => {
        if (sendEventToParentOnMessageClick) {
            emitEventToParent("MESSAGE_CLICK", message)
        }
    }

    const handleReplyClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setReplyToMessage({
            id: message?.message_id || message?.id,
            content: message?.content,
            urls: message?.urls || [],
            from_name: message?.from_name || 'User',
            is_auto_response: false,
            message_id: message?.message_id || message?.id
        });
    }, [message, setReplyToMessage]);

    const renderReplySection = () => {
        if (!message?.replied_msg_content?.text &&
            !(message?.replied_msg_content?.attachment && message?.replied_msg_content?.attachment?.length > 0)) {
            return null;
        }
        return (
            <div className="w-full mb-2 p-2 bg-black bg-opacity-10 rounded-md border-l-2 border-white border-opacity-30">
                <div className="text-xs opacity-75 mb-1">Replying to message:</div>
                <div className="text-sm opacity-90" dangerouslySetInnerHTML={{
                    __html: (() => {
                        if (typeof message.replied_msg_content === 'string') {
                            return message.replied_msg_content;
                        }
                        const replyText = message.replied_msg_content?.text || '';
                        const hasAttachment = message.replied_msg_content?.attachment &&
                            message.replied_msg_content.attachment.length > 0;
                        if (replyText.trim()) {
                            return replyText;
                        }
                        if (hasAttachment) {
                            return "Attachment";
                        }
                        return "Message";
                    })()
                }}></div>
            </div>
        );
    };

    return (
        <div
            className="flex flex-col items-end w-full pb-3 animate-slide-left"
            onClick={handleMessageClick}
            onMouseEnter={() => setShowReplyButton(true)}
            onMouseLeave={() => setShowReplyButton(false)}
        >
            {/* Single unified message bubble for everything */}
            {(message?.content || (Array.isArray(message?.urls) && message.urls.length > 0)) && (
                <div className="flex items-center gap-1 w-full justify-end">
                    <button
                        onClick={handleReplyClick}
                        className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 transition-all duration-300 ${showReplyButton ? 'opacity-100' : 'opacity-0'}`}
                        aria-label="Reply to message"
                    >
                        <Reply className="w-4 h-4 text-gray-600" />
                    </button>

                    <div
                        className="p-2.5 min-w-[40px] sm:max-w-[80%] max-w-[90%] rounded-[10px_10px_1px_10px] break-words"
                        style={{
                            backgroundColor: backgroundColor,
                            color: textColor
                        }}
                        onClick={() => setShowSenderTime(!showSenderTime)}
                    >
                        <div className="card-body p-0">
                            {renderReplySection()}

                            {Array.isArray(message?.urls) && message.urls.length > 0 && (
                                <div className="w-full my-2">
                                    <div className="flex flex-col gap-2 items-end">
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
                                                        borderRadius: "10px",
                                                        maxHeight: "300px",
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {message?.content && (
                                <p className="whitespace-pre-wrap text-sm md:text-base">
                                    {message?.content}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <div className={`transition-all duration-300 ease-in-out ${showSenderTime ? 'opacity-100 max-h-12' : 'opacity-0 max-h-0'}`}>
                <MessageTime message={message} tooltipPosition="tooltip-left" />
            </div>
        </div>
    );
});

export default addUrlDataHoc(UserMessageCard);