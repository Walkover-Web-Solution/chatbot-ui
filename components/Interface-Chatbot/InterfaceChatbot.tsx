/* eslint-disable */
import { HeaderButtonType } from "@/types/interface/InterfaceReduxType";
import React, { createContext } from "react";
import { ChatAction } from "../Chatbot/hooks/chatTypes";

interface MessageType {
  content: string;
  role: string;
  responseId?: string;
  wait?: boolean;
  timeOut?: boolean;
  createdAt?: string;
  function?: () => void;
  id?: string;
  images?: string[]; // Added images property to MessageType
  time?: string | number;
}
export const MessageContext = createContext<{
  fetchChannels: () => void,
  messages: MessageType[] | [];
  messageIds: string[],
  msgIdAndDataMap: { [msgId: string]: MessageType },
  helloMsgIds: string[],
  helloMsgIdAndDataMap: { [msgId: string]: any },
  helloMessages: any;
  addMessage?: (message: string) => void;
  setMessages?: (message: MessageType[]) => void;
  sendMessageToHello?: (() => void) | undefined
  threadId?: string;
  bridgeName?: string;
  fetchMoreData?: () => void;
  hasMoreMessages?: boolean;
  setNewMessage?: (newMessage: boolean) => void;
  newMessage?: boolean;
  currentPage?: Number;
  starterQuestions: string[];
  headerButtons?: HeaderButtonType;
  setOptions: (data: string[]) => void;
  sendMessage: ({ message }: { message?: string }) => void;
  loading?: boolean;
  messageRef?: any;
  disabled?: boolean;
  options?: any[];
  setChatsLoading?: any;
  images: string[] | { path: string }[];
  setImages: (data: string[] | { path: string }) => void;
  setToggleDrawer: (data: boolean) => void;
  setLoading: (data: boolean) => void,
  isToggledrawer: boolean,
  chatDispatch?: React.Dispatch<ChatAction>;
  getMoreChats: () => void;
  getMoreHelloChats: () => void;
  handleMessageFeedback: (data: any) => void;
  isTyping: boolean;
  isSmallScreen: boolean;
}>({
  starterQuestions: [],
  messages: [],
  messageIds: [],
  msgIdAndDataMap: {},
  helloMessages: [],
  headerButtons: [],
  sendMessage: () => { },
  images: [],
  setImages: () => { },
  setToggleDrawer: () => { },
  setLoading: () => { },
  isToggledrawer: false,
  setOptions: () => { },
  getMoreChats: () => { },
  handleMessageFeedback: () => { },
  helloMsgIds: [],
  helloMsgIdAndDataMap: {},
  isTyping: false,
  isSmallScreen: false,
});