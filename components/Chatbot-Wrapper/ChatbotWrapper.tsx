'use client';
import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";
import useLocalStorageEventHandler from "@/hooks/core/eventHandlers/localStorageEventHandler";
import useScriptEventHandler from "@/hooks/core/eventHandlers/scriptEventHandler";
import { $ReduxCoreType } from "@/types/reduxCore";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import React, { useEffect } from "react";
import Chatbot from "../Chatbot/Chatbot";

function ChatbotWrapper({tabSessionId}:{tabSessionId:string}) {
  const { reduxChatSessionId ,currentThreadId} = useCustomSelector((state: $ReduxCoreType) => ({
    reduxChatSessionId: state.tabInfo?.widgetToken || state?.tabInfo?.chatbotId || '',
    currentThreadId: state.appInfo?.[tabSessionId]?.threadId
  }));

  useScriptEventHandler(tabSessionId);
  useLocalStorageEventHandler();

  useEffect(() => {
    setTimeout(() => {
      // INFORM SCRIPT THAT CHATBOT IS LOADED , SO SCRIPT WILL START SENDING EVENTS
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