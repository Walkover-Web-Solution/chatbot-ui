"use client";
import React from "react";
import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";
import { ParamsEnums } from "@/utils/enums";
import Sidebar from "./ChatbotDrawerParts/Sidebar";

interface ChatbotDrawerProps {
  preview?: boolean;
  setToggleDrawer?: (data: boolean) => void;
  isToggledrawer?: boolean;
  chatSessionId: string;
  tabSessionId: string;
  subThreadId?: string;
  bridgeName: string;
  threadId: string;
}

/**
 * Top-level entry for the chatbot drawer. Hello-mode rendering has been
 * removed; only the gtwy implementation is supported here. The drawer is
 * decomposed into Sidebar → Header / Body / Footer subcomponents, each of
 * which can be overridden at runtime via the componentOverrides Redux slice.
 */
const ChatbotDrawer: React.FC<ChatbotDrawerProps> = (props) => {
  return (
    <Sidebar
      preview={props.preview}
      chatSessionId={props.chatSessionId}
      tabSessionId={props.tabSessionId}
      subThreadId={props.subThreadId}
      bridgeName={props.bridgeName}
      threadId={props.threadId}
    />
  );
};

export default addUrlDataHoc(React.memo(ChatbotDrawer), [
  ParamsEnums.subThreadId,
  ParamsEnums.bridgeName,
  ParamsEnums.threadId,
]);
