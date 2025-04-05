import React, { useCallback, useEffect } from 'react'
import { ChatAction, ChatActionTypes, ChatState } from './chatTypes'
import { useCustomSelector } from '@/utils/deepCheckSelector';
import { $ReduxCoreType } from '@/types/reduxCore';
import WebSocketClient from 'rtlayer-client'

const client = WebSocketClient("lyvSfW7uPPolwax0BHMC", "DprvynUwAdFwkE91V5Jj");

function useRtlayerEventManager({ chatbotId, chatDispatch, chatState, messageRef, timeoutIdRef }: { chatbotId: string, chatDispatch: React.Dispatch<ChatAction>, chatState: ChatState, messageRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>, timeoutIdRef: React.RefObject<NodeJS.Timeout | null> }) {
  const { threadId, subThreadId } = chatState
  const { userId } = useCustomSelector((state: $ReduxCoreType) => ({ userId: state.appInfo.userId }))
  const handleMessageRTLayer = useCallback((message: string) => {
    // Parse the incoming message string into an object
    const messages = chatState.messages;
    console.log(messages)

    const parsedMessage = JSON.parse(message || "{}");
    // Check if the status is "connected"
    if (parsedMessage?.status === "connected") {
      console.log("SOCKET CONNECTED");
      return;
    }

    // Determine the type of response
    const { function_call, message: responseMessage, data, error } = parsedMessage?.response || {};
    switch (true) {
      // Case: Function call is present without a message
      case function_call && !responseMessage:
        chatDispatch({
          type: ChatActionTypes.SET_MESSAGES, payload: [
            ...messages?.slice(0, -1),
            { role: "assistant", wait: true, content: "Function Calling", Name: parsedMessage?.response?.Name || [] },
          ]
        });
        break;

      // Case: Function call is present with a message
      case function_call && responseMessage:
        chatDispatch({
          type: ChatActionTypes.SET_MESSAGES, payload: [
            ...messages?.slice(0, -1),
            { role: "assistant", wait: true, content: "Talking with AI" },
          ]
        });
        break;

      // Case: Error is present without response data
      case !data && error:
        chatDispatch({
          type: ChatActionTypes.SET_MESSAGES, payload: [
            ...messages?.slice(0, -1),
            {
              role: "assistant",
              content: `${error || "Error in AI"}`,
            },
          ]
        });
        chatDispatch({
          type: ChatActionTypes.SET_LOADING, payload: false
        });
        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
        break;

      // Case: Reset role is present without mode
      case data?.role === "reset" && !data?.mode:
        chatDispatch({
          type: ChatActionTypes.SET_MESSAGES, payload: [
            ...messages,
            {
              role: "reset",
              mode: data?.mode,
              content: "Resetting the chat",
            },
          ]
        });
        break;

      // Case: Suggestions are present
      case data?.suggestions !== undefined:
        chatDispatch({
          type: ChatActionTypes.SET_OPTIONS, payload: Array.isArray(data?.suggestions) ? data?.suggestions : []
        });
        break;

      // Case: Response data is present
      case !!data:
        console.log("chatDispatch", messages, [
          ...messages?.slice(0, -1),
          {
            role: data?.role || "assistant",
            ...(data || {}),
          },
        ]);
        chatDispatch({
          type: ChatActionTypes.SET_MESSAGES, payload: [
            ...messages?.slice(0, -1),
            {
              role: data?.role || "assistant",
              ...(data || {}),
            },
          ]
        });
        chatDispatch({
          type: ChatActionTypes.SET_LOADING, payload: false
        });
        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
        break;

      // Default case: Unhandled message
      default:
        console.warn("Some error occurred in the message", parsedMessage);
    }
  }, [chatDispatch, chatState.messages.length, timeoutIdRef]);

  useEffect(() => {
    const newChannelId = (
      chatbotId +
      (threadId || userId) +
      (subThreadId || userId)
    )?.replace(/ /g, "_");

    const listener = client.on(newChannelId, handleMessageRTLayer);

    // Cleanup on effect re-run or unmount
    return () => {
      listener.remove();
      if (timeoutIdRef.current !== null) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [chatbotId, userId, threadId, subThreadId]);
  return null
}

export default useRtlayerEventManager