/* eslint-disable */
import { addUrlDataHoc } from '@/hoc/addUrlDataHoc';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import { emitEventToParent } from '@/utils/emitEventsToParent/emitEventsToParent';
import { ALLOWED_EVENTS_TO_SUBSCRIBE } from '@/utils/enums';
import React from 'react';
import ImageWithFallback from './ImageWithFallback';
import "./Message.css";
import MessageTime from './MessageTime';

const UserMessageCard = React.memo(({ message, backgroundColor, textColor, chatSessionId }: any) => {
    console.log('user message card')
    const { sendEventToParentOnMessageClick } = useCustomSelector((state) => ({
        sendEventToParentOnMessageClick: state.Interface?.[chatSessionId]?.eventsSubscribedByParent?.includes(ALLOWED_EVENTS_TO_SUBSCRIBE.MESSAGE_CLICK) || false
    }))

    const handleMessageClick = () => {
        if (sendEventToParentOnMessageClick) {
            emitEventToParent("MESSAGE_CLICK", message)
        }
    }
    return (
        <div className="flex flex-col gap-2.5 items-end w-full mb-2.5 animate-slide-left mt-1" onClick={handleMessageClick}>
            {Array.isArray(message?.urls) && message.urls.length > 0 && (
                <div className="flex flex-row-reverse flex-wrap gap-2.5 w-full">
                    {message.urls.map((url: any, index: number) => {
                        const imageUrl = typeof url === 'object' ? url?.path : url;

                        return (
                            <ImageWithFallback
                                key={index}
                                src={imageUrl}
                                alt={`Image ${index + 1}`}
                            />
                        );
                    })}
                </div>
            )}

            <div className="flex flex-col items-end w-full">
                {message?.content && <div
                    className="p-2.5 min-w-[40px] sm:max-w-[80%] max-w-[90%] rounded-[10px_10px_1px_10px] break-words"
                    style={{
                        backgroundColor: backgroundColor,
                        color: textColor
                    }}
                >
                    <div className="card-body p-0">
                        <p className="whitespace-pre-wrap text-sm md:text-base">
                            {message?.content}
                        </p>
                    </div>
                </div>}
                <MessageTime message={message} />
            </div>
        </div>
    );
});

export default addUrlDataHoc(UserMessageCard);