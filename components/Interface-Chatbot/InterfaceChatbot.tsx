/* eslint-disable */
import { createContext } from "react";

export const MessageContext = createContext<{
  messageRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  timeoutIdRef: React.RefObject<ReturnType<typeof setTimeout> | null>;
}>({
  messageRef: { current: null },
  timeoutIdRef: { current: null }
});