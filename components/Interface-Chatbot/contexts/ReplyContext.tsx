'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ReplyMessage {
  id: string;
  content: string | { text: string };
  urls?: string[];
  from_name?: string;
  is_auto_response?: boolean;
  message_id?: string;
}

interface ReplyContextType {
  replyToMessage: ReplyMessage | null;
  setReplyToMessage: (message: ReplyMessage | null) => void;
  clearReply: () => void;
}

const ReplyContext = createContext<ReplyContextType | undefined>(undefined);

export const useReplyContext = (): ReplyContextType => {
  const context = useContext(ReplyContext);
  if (!context) {
    throw new Error('useReplyContext must be used within a ReplyProvider');
  }
  return context;
};

interface ReplyProviderProps {
  children: ReactNode;
}

export const ReplyProvider: React.FC<ReplyProviderProps> = ({ children }) => {
  const [replyToMessage, setReplyToMessage] = useState<ReplyMessage | null>(null);

  const clearReply = () => setReplyToMessage(null);

  const value = {
    replyToMessage,
    setReplyToMessage,
    clearReply,
  };

  return (
    <ReplyContext.Provider value={value}>
      {children}
    </ReplyContext.Provider>
  );
};
