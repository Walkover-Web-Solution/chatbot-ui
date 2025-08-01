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

// Create a separate component for the hooks that need context
function ChatbotWithHooks({ tabSessionId, chatSessionId }: { tabSessionId: string, chatSessionId: string }) {
  useEmbeddingScriptEventHandler(tabSessionId);
  useLocalStorageEventHandler(tabSessionId);

  if (!chatSessionId) {
    return null
  }

  return <Chatbot />;
}

function ChatbotWrapper({ tabSessionId, chatSessionId }: ChatbotWrapperProps) {
  // Notify parent when interface is loaded
  useEffect(() => {
    setTimeout(() => {
      window?.parent?.postMessage({ type: "interfaceLoaded" }, "*");
    }, 0);
  }, []);

  return (
    <ChatContext.Provider value={{ chatSessionId, tabSessionId }}>
      <ChatbotWithHooks tabSessionId={tabSessionId} chatSessionId={chatSessionId} />
    </ChatContext.Provider>
  )
}

export default React.memo(
  addUrlDataHoc(React.memo(ChatbotWrapper))
);