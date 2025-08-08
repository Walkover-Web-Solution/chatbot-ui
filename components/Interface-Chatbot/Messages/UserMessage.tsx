/* eslint-disable */
import { addUrlDataHoc } from '@/hoc/addUrlDataHoc';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import { emitEventToParent } from '@/utils/emitEventsToParent/emitEventsToParent';
import { ALLOWED_EVENTS_TO_SUBSCRIBE } from '@/utils/enums';
import React, { useState } from 'react';
import ImageWithFallback from './ImageWithFallback';
import "./Message.css";
import MessageTime from './MessageTime';

/**
 * A component that displays a user message card.
 * It includes an image with fallback, message content, and sender time.
 */

const UserMessageCard = React.memo(({ message, backgroundColor, textColor, chatSessionId }: any) => {
    const [showSenderTime, setShowSenderTime] = useState(false);
    const { sendEventToParentOnMessageClick } = useCustomSelector((state) => ({
        sendEventToParentOnMessageClick: state.Interface?.[chatSessionId]?.eventsSubscribedByParent?.includes(ALLOWED_EVENTS_TO_SUBSCRIBE.MESSAGE_CLICK) || false
    }))

    const handleMessageClick = () => {
        if (sendEventToParentOnMessageClick) {
            emitEventToParent("MESSAGE_CLICK", message)
        }
    }
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

            <div className="flex flex-col items-end w-full" onClick={() => setShowSenderTime(!showSenderTime)}>
                {message?.content && <div
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
                }
                <div className={`transition-all duration-300 ease-in-out ${showSenderTime ? 'opacity-100 max-h-12' : 'opacity-0 max-h-0'}`}>
                    <MessageTime message={message} tooltipPosition="tooltip-left" />
                </div>
            </div>
        </div>
    );
});

export default addUrlDataHoc(UserMessageCard);