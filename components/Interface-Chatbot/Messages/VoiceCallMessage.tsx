import { linkify } from '@/utils/utilities';
import { Phone, Reply } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useReplyContext } from '../contexts/ReplyContext';

function VoiceCallMessage({ message }: { message: any }) {
    const [showReplyButton, setShowReplyButton] = useState(false);
    const { setReplyToMessage } = useReplyContext();

    const startTime = new Date(message?.content?.start_time);
    const endTime = new Date(message?.content?.end_time);
    const durationFromMessage = Number(message?.content?.duration);
    const fallbackDuration = (!isNaN(startTime.getTime()) && !isNaN(endTime.getTime()) ?
        Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0);
    const duration = Number.isFinite(durationFromMessage) && durationFromMessage >= 0
        ? Math.ceil(durationFromMessage)
        : fallbackDuration;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    const handleReplyClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setReplyToMessage({
            id: message?.message_id || message?.id,
            content: message?.content?.text,
            urls: message?.urls || [],
            from_name: message?.from_name || 'User',
            is_auto_response: false,
            message_id: message?.message_id || message?.id,
        });
    }, [message, setReplyToMessage]);

    if (!message?.content?.status) return null;

    return (
        <div
            className="w-full mb-3 flex items-center justify-end animate-slide-left"
            onMouseEnter={() => setShowReplyButton(true)}
            onMouseLeave={() => setShowReplyButton(false)}
        >
            <div className="flex items-center gap-2">
                <button
                    onClick={handleReplyClick}
                    className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 transition-all duration-300 ${showReplyButton ? 'opacity-100' : 'opacity-0'}`}
                    aria-label="Reply to message"
                >
                    <Reply className="w-4 h-4 text-gray-600" />
                </button>

                <div className="flex items-center gap-2 border-gray-300 border rounded-lg px-3 py-2 shadow-sm">
                    <div className="bg-green-500 rounded-full p-1.5" style={{ backgroundColor: message?.content?.status === 'completed' ? 'green' : 'red' }}>
                        <Phone className="text-white" size={14} />
                    </div>
                    <div className="text-xs font-medium">
                        <div dangerouslySetInnerHTML={{ __html: linkify(message?.content?.text) }}></div>
                        {duration > 0 && (
                            <div className="text-gray-500">{`${minutes}:${seconds.toString().padStart(2, '0')}`}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default VoiceCallMessage