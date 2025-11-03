'use client';
import { X } from "lucide-react";
import React from "react";

interface ReplyPreviewProps {
  replyToMessage: {
    id: string;
    content: string | { text: string };
    urls?: string[];
    from_name?: string;
    is_auto_response?: boolean;
  } | null;
  onCloseReply: () => void;
}

const ReplyPreview: React.FC<ReplyPreviewProps> = ({ replyToMessage, onCloseReply }) => {
  if (!replyToMessage) return null;

  const getMessageContent = (content: string | { text: string }): string => {
    if (typeof content === 'string') return content;
    return content?.text || '';
  };

  const getMessagePreview = (content: string): string => {
    const textOnly = content.replace(/<[^>]*>/g, '');
    const maxLength = 60;
    if (textOnly.length <= maxLength) {
      return content;
    }
    return textOnly.substring(0, maxLength) + '...';
  };

  const getSenderName = (): string => {
    if (replyToMessage.is_auto_response || !replyToMessage.from_name) return 'Bot';
    return replyToMessage.from_name === 'User' ? 'You' : replyToMessage.from_name || 'User';
  };

  const getDisplayContent = (): string => {
    const messageContent = getMessageContent(replyToMessage.content);
    const hasAttachments = replyToMessage.urls && replyToMessage.urls.length > 0;
    if (messageContent.trim()) {
      return messageContent;
    }
    if (hasAttachments) {
      return "Attachment";
    }
    return "Message";
  };
  const displayContent = getDisplayContent();

  return (
    <div className="relative flex items-start gap-3 p-3 bg-blue-50 border-l-4 border-blue-500 mb-1 rounded-md shadow-sm z-[999]">
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-blue-700">
            {getSenderName()}
          </span>
        </div>
        <div className="text-sm text-gray-600 leading-relaxed truncate">
          {/* {getMessagePreview(messageContent)} */}
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: (getMessagePreview(displayContent)) }}></div>
          </div>
        </div>
      </div>
      <button
        onClick={onCloseReply}
        className="absolute top-2 right-2 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-lg border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-xl transition-all duration-200 z-[60]"
        aria-label="Close reply"
      >
        <X className="w-4 h-4 text-gray-700 hover:text-gray-900" />
      </button>
    </div>
  );
};

export default ReplyPreview;
