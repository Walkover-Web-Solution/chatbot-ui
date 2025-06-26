'use client';
import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";
import { useEmbeddingScriptEventHandler } from "@/hooks/CORE/eventHandlers/embeddingScript/embeddingScriptEventHandler";
import { useLocalStorageEventHandler } from "@/hooks/CORE/eventHandlers/localStorage/localStorageEventsHandler";
import React, { createContext, useEffect } from "react";
import Chatbot from "../Chatbot/Chatbot";

interface ChatbotWrapperProps {
  tabSessionId: string;
  chatSessionId: string;
}
interface ChatContextType {
  chatSessionId: string;
  tabSessionId: string;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

function ChatbotWrapper({ tabSessionId, chatSessionId }: ChatbotWrapperProps) {

  useEmbeddingScriptEventHandler(tabSessionId);
  useLocalStorageEventHandler(tabSessionId);

  // Notify parent when interface is loaded
  useEffect(() => {
    setTimeout(() => {
      window?.parent?.postMessage({ type: "interfaceLoaded" }, "*");
    }, 0);
  }, []);

  if (!chatSessionId) {
    return null
  }

  return (
    <ChatContext.Provider value={{ chatSessionId, tabSessionId }}>
      <Chatbot />
    </ChatContext.Provider>
  )
}

export default React.memo(
  addUrlDataHoc(React.memo(ChatbotWrapper))
);