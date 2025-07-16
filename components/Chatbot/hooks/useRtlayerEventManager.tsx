import { ChatbotContext } from '@/components/context';
import { setHelloEventMessage, setLoading, setOptions, updateLastAssistantMessage } from '@/store/chat/chatSlice';
import { setThreads } from '@/store/interface/interfaceSlice';
import { $ReduxCoreType } from '@/types/reduxCore';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import { generateNewId } from '@/utils/utilities';
import React, { useCallback, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import WebSocketClient from 'rtlayer-client';
import { ChatState } from './chatTypes';

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

function useRtlayerEventManager({ timeoutIdRef, chatSessionId, tabSessionId }: { timeoutIdRef: React.RefObject<NodeJS.Timeout | null>, chatSessionId: string, tabSessionId: string }) {
  const { isHelloUser } = useContext(ChatbotContext)
  const { reduxBridgeName, threadId, subThreadId } = useCustomSelector((state) => ({
    reduxBridgeName: state.appInfo?.[tabSessionId]?.bridgeName,
    threadId: state.appInfo?.[tabSessionId]?.threadId,
    subThreadId: state.appInfo?.[tabSessionId]?.subThreadId,
  }))
  const dispatch = useDispatch()
  const client = useWebSocketClient(isHelloUser);
  const { userId } = useCustomSelector((state) => ({ userId: state.appInfo?.[tabSessionId]?.userId }))

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
        dispatch(updateLastAssistantMessage({ role: "assistant", wait: true, content: "Function Calling", Name: parsedMessage?.response?.Name || [], id: generateNewId() }));
        break;

      // Case: Function call is present with a message
      case function_call && !!responseMessage:
        dispatch(updateLastAssistantMessage({ role: "assistant", wait: true, content: responseMessage, Name: parsedMessage?.response?.Name || [], id: generateNewId() }));
        break;

      // Case: Error is present without response data
      case !data && !!parsedMessage?.error:
        dispatch(updateLastAssistantMessage({ role: "assistant", content: `${parsedMessage?.error || error || "Error while talking to AI"}`, id: generateNewId() }));
        dispatch(setLoading(false));
        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
        break;

      // Case: Reset role is present without mode
      case data?.role === "reset" && !data?.mode:
        dispatch(setHelloEventMessage({ message: { role: "reset", content: "Resetting the chat", mode: data?.mode } }));
        break;

      // Case: Suggestions are present
      case data?.suggestions !== undefined:
        dispatch(setOptions(Array.isArray(data?.suggestions) ? data?.suggestions : []));
        break;

      case !!data?.display_name:
        dispatch(setThreads({
          newThreadData: { ...data },
          bridgeName: reduxBridgeName,
          threadId: data?.thread_id,
        }))
        break;

      // Case: Response data is present
      case !!data:
        dispatch(updateLastAssistantMessage({ role: parsedMessage?.response?.data?.role || "assistant", ...(parsedMessage.response.data || {}) }));
        dispatch(setLoading(false));
        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
        break;

      // Default case: Unhandled message
      default:
        console.warn("Some error occurred in the message", parsedMessage);
    }
  }, [reduxBridgeName]);

  useEffect(() => {
    if (!client) return;
    const newChannelId = (
      chatSessionId +
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
  }, [chatSessionId, userId, threadId, subThreadId, client]);

  return null
}

export default useRtlayerEventManager