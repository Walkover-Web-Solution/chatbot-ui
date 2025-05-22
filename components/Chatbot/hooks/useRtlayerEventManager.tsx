import { ChatbotContext } from '@/components/context';
import { setThreads } from '@/store/interface/interfaceSlice';
import { $ReduxCoreType } from '@/types/reduxCore';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import { generateNewId } from '@/utils/utilities';
import React, { useCallback, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import WebSocketClient from 'rtlayer-client';
import { ChatAction, ChatActionTypes, ChatState } from './chatTypes';

// Create a separate hook to manage the WebSocket client instance
function useWebSocketClient(isHelloUser: boolean) {
  const [client, setClient] = React.useState(null);

  // Only create the WebSocket client when needed
  React.useEffect(() => {
    if (!isHelloUser) {
      // Only initialize the client when it's not a human
      const newClient = WebSocketClient("lyvSfW7uPPolwax0BHMC", "DprvynUwAdFwkE91V5Jj");
      setClient(newClient)

      // Clean up the WebSocket connection when the component unmounts
      return () => {
        // Add any cleanup code for your WebSocket client if needed
        if (newClient && typeof newClient.close === 'function') {
          newClient.close();
        }
      };
    }
  }, [isHelloUser]);

  return client;
}

function useRtlayerEventManager({ chatbotId, chatDispatch, chatState, messageRef, timeoutIdRef }: { chatbotId: string, chatDispatch: React.Dispatch<ChatAction>, chatState: ChatState, messageRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>, timeoutIdRef: React.RefObject<NodeJS.Timeout | null> }) {
  const { isHelloUser } = useContext(ChatbotContext)
  const { reduxThreadId, reduxBridgeName } = useCustomSelector((state: $ReduxCoreType) => ({
    threadId: state.appInfo.threadId,
    bridgeName: state.appInfo.bridgeName,
  }))
  const dispatch = useDispatch()
  if (isHelloUser) {
    return null
  }
  const client = useWebSocketClient(isHelloUser);
  const { threadId, subThreadId } = chatState
  const { userId } = useCustomSelector((state: $ReduxCoreType) => ({ userId: state.appInfo.userId }))

  const handleMessageRTLayer = useCallback((message: string) => {
    // Parse the incoming message string into an object

    const parsedMessage = JSON.parse(message || "{}");
    // Check if the status is "connected"
    if (parsedMessage?.status === "connected") {
      return;
    }

    // Determine the type of response
    const { function_call, message: responseMessage, data, error } = parsedMessage?.response || {};
    switch (true) {
      // Case: Function call is present without a message
      case function_call && !responseMessage:
        chatDispatch({ type: ChatActionTypes.UPDATE_LAST_ASSISTANT_MESSAGE, payload: { role: "assistant", wait: true, content: "Function Calling", Name: parsedMessage?.response?.Name || [], id: generateNewId() } });
        break;

      // Case: Function call is present with a message
      case function_call && !!responseMessage:
        chatDispatch({ type: ChatActionTypes.UPDATE_LAST_ASSISTANT_MESSAGE, payload: { role: "assistant", wait: true, content: "Talking with AI", id: generateNewId() } });
        break;

      // Case: Error is present without response data
      case !data && !!parsedMessage?.error:
        chatDispatch({ type: ChatActionTypes.UPDATE_LAST_ASSISTANT_MESSAGE, payload: { role: "assistant", content: `${parsedMessage?.error || error || "Error while talking to AI"}`, id: generateNewId() } });
        chatDispatch({ type: ChatActionTypes.SET_LOADING, payload: false });
        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
        break;

      // Case: Reset role is present without mode
      case data?.role === "reset" && !data?.mode:
        chatDispatch({
          type: ChatActionTypes.SET_HELLO_EVENT_MESSAGE, payload: {
            message: {
              role: "reset",
              mode: data?.mode,
              content: "Resetting the chat",
            }
          }
        })
        break;

      // Case: Suggestions are present
      case data?.suggestions !== undefined:
        chatDispatch({
          type: ChatActionTypes.SET_OPTIONS, payload: Array.isArray(data?.suggestions) ? data?.suggestions : []
        });
        break;

      case !!data?.display_name:
        dispatch(setThreads({
          newThreadData: { ...data },
          bridgeName: reduxBridgeName,
          threadId: reduxThreadId
        }))
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
    if (!client) return;
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