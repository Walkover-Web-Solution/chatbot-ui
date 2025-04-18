import { $ReduxCoreType } from '@/types/reduxCore';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import React, { useCallback, useEffect } from 'react';
import WebSocketClient from 'rtlayer-client';
import { ChatAction, ChatActionTypes, ChatState } from './chatTypes';
import { setThreadId } from '@/store/interface/interfaceSlice';
import { useDispatch } from 'react-redux';

const client = WebSocketClient("lyvSfW7uPPolwax0BHMC", "DprvynUwAdFwkE91V5Jj");

function useRtlayerEventManager({ chatbotId, chatDispatch, chatState, messageRef, timeoutIdRef }: { chatbotId: string, chatDispatch: React.Dispatch<ChatAction>, chatState: ChatState, messageRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>, timeoutIdRef: React.RefObject<NodeJS.Timeout | null> }) {
  const { threadId, subThreadId } = chatState
  const dispatch = useDispatch();
  const { userId } = useCustomSelector((state: $ReduxCoreType) => ({ userId: state.appInfo.userId }))

  const handleMessageRTLayer = useCallback((message: string) => {
    // Parse the incoming message string into an object

    const parsedMessage = JSON.parse(message || "{}");
    // Check if the status is "connected"
    if (parsedMessage?.status === "connected") {
      return;
    }

    // Determine the type of response
    const { function_call, message: responseMessage, data, error, displayName } = parsedMessage?.response || {};
    console.log("parsedMessage", displayName);
    switch (true) {
      // Case: Function call is present without a message
      case function_call && !responseMessage:
        chatDispatch({ type: ChatActionTypes.UPDATE_LAST_ASSISTANT_MESSAGE, payload: { role: "assistant", wait: true, content: "Function Calling", Name: parsedMessage?.response?.Name || [] } });
        break;

      // Case: Function call is present with a message
      case function_call && !!responseMessage:
        chatDispatch({ type: ChatActionTypes.UPDATE_LAST_ASSISTANT_MESSAGE, payload: { role: "assistant", wait: true, content: "Talking with AI" } });
        break;

      // Case: Error is present without response data
      case !data && !!parsedMessage?.error:
        chatDispatch({ type: ChatActionTypes.UPDATE_LAST_ASSISTANT_MESSAGE, payload: { role: "assistant", content: `${parsedMessage?.error || error || "Error while talking to AI"}` } });
        chatDispatch({ type: ChatActionTypes.SET_LOADING, payload: false });
        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
        break;

      // Case: Reset role is present without mode
      case data?.role === "reset" && !data?.mode:
        chatDispatch({
          type: ChatActionTypes.ADD_MESSAGE, payload: {
            role: "reset",
            mode: data?.mode,
            content: "Resetting the chat",
          }
        })
        break;

      // Case: Suggestions are present
      case data?.suggestions !== undefined:
        chatDispatch({
          type: ChatActionTypes.SET_OPTIONS, payload: Array.isArray(data?.suggestions) ? data?.suggestions : []
        });
        break;
       
      // Case: New sub thread is present
      case displayName !== undefined:
        dispatch(setThreadId({ subThreadId: displayName }));
        break;

      // Case: Response data is present
      case !!data:
        chatDispatch({
          type: ChatActionTypes.UPDATE_LAST_ASSISTANT_MESSAGE, payload: {
            role: parsedMessage.response?.data?.role || "assistant",
            ...(parsedMessage.response.data || {}),
          }
        });
        chatDispatch({ type: ChatActionTypes.SET_LOADING, payload: false });
        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
        break;

      // Default case: Unhandled message
      default:
        console.warn("Some error occurred in the message", parsedMessage);
    }
  }, []);

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