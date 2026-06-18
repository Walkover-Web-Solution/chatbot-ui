"use client";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import { useCustomSelector } from "@/utils/deepCheckSelector";
import { setThreads } from "@/store/interface/interfaceSlice";
import { setDataInAppInfoReducer } from "@/store/appInfo/appInfoSlice";

import { useChatActions } from "@/components/Chatbot/hooks/useChatActions";
import { useScreenSize } from "@/components/Chatbot/hooks/useScreenSize";
import { emitEventToParent } from "@/utils/emitEventsToParent/emitEventsToParent";
import { useContext } from "react";
import { MessageContext } from "../InterfaceChatbot";

import SidebarHeader from "./SidebarHeader";
import SidebarBody from "./SidebarBody";
import SidebarFooter from "./SidebarFooter";
import { useComponentOverride } from "./useComponentOverride";
import ChatbotHeader from "../ChatbotHeader";
import MessageList from "../Messages/MessageList";
import ChatbotTextField from "../ChatbotTextField";

const createRandomId = () => Math.random().toString(36).substring(2, 15);

export interface SidebarProps {
  preview?: boolean;
  chatSessionId: string;
  tabSessionId: string;
  subThreadId?: string;
  bridgeName: string;
  threadId: string;
}

const Sidebar = (props: SidebarProps) => {
  const Override = useComponentOverride(["sidebar"]);
  if (Override) return <Override {...props} />;

  return <SidebarDefault {...props} />;
};

const SidebarDefault = ({
  preview = false,
  chatSessionId,
  tabSessionId,
  subThreadId,
  bridgeName,
  threadId,
}: SidebarProps) => {
  const dispatch = useDispatch();

  const { messageRef } = useContext(MessageContext);
  const { isSmallScreen } = useScreenSize();
  const { setNewMessage, setOptions, setLoading, setToggleDrawer } =
    useChatActions();

  const { subThreadList, isToggledrawer } = useCustomSelector((state) => ({
    subThreadList:
      state.Interface?.[`${chatSessionId}_${tabSessionId}`]?.interfaceContext?.[
        bridgeName
      ]?.threadList?.[threadId] || [],
    isToggledrawer: state.Chat.isToggledrawer,
  }));

  useEffect(() => {
    if (chatSessionId) {
      setToggleDrawer(!isSmallScreen);
    }
  }, [chatSessionId, isSmallScreen]);

  const focusTextField = () => {
    if (messageRef?.current) {
      messageRef.current.focus();
    }
  };

  const handleCreateNewSubThread = () => {
    if (preview) return;
    if (subThreadList?.[0]?.newChat) return;
    const newThreadData = {
      sub_thread_id: createRandomId(),
      thread_id: threadId,
      display_name: "New Chat",
      newChat: "true",
    };
    dispatch(setThreads({ newThreadData, bridgeName, threadId } as any));
    setOptions([]);
  };

  const handleChangeSubThread = (sub_thread_id: string) => {
    setLoading(false);
    dispatch(setDataInAppInfoReducer({ subThreadId: sub_thread_id }));
    setNewMessage(true);
    setOptions([]);
    focusTextField();
    if (isSmallScreen) setToggleDrawer(false);
  };

  const closeToggleDrawer = (isOpen: boolean) => setToggleDrawer(isOpen);

  return (
    <div className={`drawer ${isSmallScreen ? "z-[99999]" : "z-[999]"} h-screen`}>
      <input
        id="chatbot-drawer"
        type="checkbox"
        className="drawer-toggle lg:hidden"
        checked={isToggledrawer}
        onChange={(e) => setToggleDrawer(e.target.checked)}
      />

      {isToggledrawer && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => closeToggleDrawer(false)}
          data-testid="chatbot-drawer-backdrop"
        />
      )}

      <div className="drawer-content lg:hidden flex flex-col h-full w-full bg-base-100">
        <ChatbotHeader
          preview={preview}
          chatSessionId={chatSessionId}
          tabSessionId={tabSessionId}
          currentTeamId=""
          currentChannelId=""
          threadId={threadId}
          bridgeName={bridgeName}
        />
        <div className="flex-1 overflow-hidden">
          <MessageList chatSessionId={chatSessionId} currentChannelId="" />
        </div>
        <ChatbotTextField 
          chatSessionId={chatSessionId}
          tabSessionId={tabSessionId}
          subThreadId={subThreadId || ""}
          currentTeamId=""
          currentChannelId=""
        />
      </div>

      <div
        className={`drawer-side max-w-[286px] ${
          isToggledrawer ? "lg:translate-x-0" : "lg:-translate-x-full"
        } transition-transform duration-100`}
      >
        <div className="w-full h-full text-base-content relative bg-base-200 flex flex-col">
          <SidebarHeader
            isToggledrawer={isToggledrawer}
            onToggle={() => closeToggleDrawer(!isToggledrawer)}
            onNewChat={handleCreateNewSubThread}
          />
          <SidebarBody
            subThreadList={subThreadList}
            subThreadId={subThreadId}
            onSelect={handleChangeSubThread}
          />
          <SidebarFooter />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
