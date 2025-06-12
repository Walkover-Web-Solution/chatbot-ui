'use client';
import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";
import { useEmbeddingScriptEventHandler } from "@/hooks/CORE/eventHandlers/embeddingScript/embeddingScriptEventHandler";
import { useLocalStorageEventHandler } from "@/hooks/CORE/eventHandlers/localStorage/localStorageEventsHandler";
import { $ReduxCoreType } from "@/types/reduxCore";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import React, { useEffect } from "react";
import Chatbot from "../Chatbot/Chatbot";

interface ChatbotWrapperProps {
  tabSessionId: string;
}

function ChatbotWrapper({ tabSessionId }: ChatbotWrapperProps) {
  useEmbeddingScriptEventHandler(tabSessionId);
  useLocalStorageEventHandler(tabSessionId);

  const { reduxChatSessionId } = useCustomSelector((state: $ReduxCoreType) => ({
    reduxChatSessionId: state.tabInfo?.widgetToken || state?.tabInfo?.chatbotId || '',
  }));

  // Notify parent when interface is loaded
  useEffect(() => {
    setTimeout(() => {
      window?.parent?.postMessage({ type: "interfaceLoaded" }, "*");
    }, 0);
  }, []);

  if (!reduxChatSessionId) {
    return null
  }

  return <Chatbot />
}

export default React.memo(
  addUrlDataHoc(React.memo(ChatbotWrapper))
);