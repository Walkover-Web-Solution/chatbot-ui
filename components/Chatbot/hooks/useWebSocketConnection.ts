import { useEffect, useRef } from 'react';
import { useChatContext } from './ChatContext';
import { ChatActionTypes } from './chatTypes';
import WebSocketClient from 'rtlayer-client';
import useSocket from '@/hooks/socket';

// Initialize the RTLayer client
const client = WebSocketClient("lyvSfW7uPPolwax0BHMC", "DprvynUwAdFwkE91V5Jj");

export const useWebSocketConnections = (
  chatbotId: string,
  userId: string
) => {
  const { 
    dispatch, 
    threadId, 
    subThreadId,
    loading
  } = useChatContext();
  
  const socket = useSocket();
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const channelIdRef = useRef<string | null>(null);

  // Socket.io connection for Hello service
  useEffect(() => {
    if (!socket) return;

    const handleNewPublish = (data: any) => {
      const { response } = data;
      const { message } = response || {};
      const { content, chat_id, from_name, sender_id } = message || {};
      const text = content?.text;
      
      if (text && !chat_id) {
        clearTimeout(timeoutIdRef.current!);
        dispatch({ type: ChatActionTypes.SET_LOADING, payload: false });
        
        // Add message to hello messages
        dispatch({ 
          type: ChatActionTypes.ADD_HELLO_MESSAGE, 
          payload: {
            role: sender_id === "bot" ? "Bot" : "Human",
            from_name,
            content: text,
            id: response?.id,
          }
        });
      }
    };

    socket.on("NewPublish", handleNewPublish);
    socket.on("message", (data: any) => {
      // Handle socket message if needed
    });

    return () => {
      socket.off("NewPublish");
      socket.off("message");
    };
  }, [socket, dispatch]);

  // RTLayer connection for regular chatbot
  useEffect(() => {
    const newChannelId = (
      chatbotId +
      (threadId || userId) +
      (subThreadId || userId)
    )?.replace(/ /g, "_");

    const handleMessageRTLayer = (message: string) => {
      try {
        const parsedMessage = JSON.parse(message || "{}");
        
        // Skip connection messages
        if (parsedMessage?.status === "connected") {
          return;
        }
        
        // Handle function calls
        if (parsedMessage?.response?.function_call && !parsedMessage?.response?.message) {
          dispatch({ 
            type: ChatActionTypes.UPDATE_LAST_ASSISTANT_MESSAGE, 
            payload: { 
              role: "assistant", 
              wait: true, 
              content: "Function Calling", 
              Name: parsedMessage?.response?.Name || [] 
            } 
          });
        } 
        // Function call with message
        else if (parsedMessage?.response?.function_call && parsedMessage?.response?.message) {
          dispatch({ 
            type: ChatActionTypes.UPDATE_LAST_ASSISTANT_MESSAGE, 
            payload: { 
              role: "assistant", 
              wait: true, 
              content: "Talking with AI" 
            } 
          });
        } 
        // Handle error
        else if (!parsedMessage?.response?.data && parsedMessage?.error) {
          dispatch({ 
            type: ChatActionTypes.UPDATE_LAST_ASSISTANT_MESSAGE, 
            payload: { 
              role: "assistant", 
              content: `${parsedMessage?.error || "Error in AI"}` 
            } 
          });
          dispatch({ type: ChatActionTypes.SET_LOADING, payload: false });
          clearTimeout(timeoutIdRef.current!);
        } 
        // Handle reset
        else if (parsedMessage?.response?.data?.role === "reset" && !parsedMessage?.response?.data?.mode) {
          dispatch({ 
            type: ChatActionTypes.SET_MESSAGES, 
            payload: [
              ...parsedMessage?.response?.data?.messages || [],
              {
                role: "reset",
                mode: parsedMessage?.response?.data?.mode,
                content: "Resetting the chat",
              }
            ] 
          });
        } 
        // Handle suggestions
        else if (parsedMessage?.response?.data?.suggestions !== undefined) {
          dispatch({ 
            type: ChatActionTypes.SET_OPTIONS, 
            payload: parsedMessage.response?.data?.suggestions || [] 
          });
        } 
        // Handle normal message response
        else if (parsedMessage?.response?.data) {
          dispatch({ type: ChatActionTypes.SET_LOADING, payload: false });
          dispatch({ 
            type: ChatActionTypes.UPDATE_LAST_ASSISTANT_MESSAGE, 
            payload: {
              role: parsedMessage.response?.data?.role || "assistant",
              ...(parsedMessage.response.data || {}),
            }
          });
          clearTimeout(timeoutIdRef.current!);
        } 
        else {
          console.warn("Some error occurred in the message", parsedMessage);
        }
      } catch (error) {
        console.error("Error parsing RTLayer message:", error);
      }
    };

    const listener = client.on(newChannelId, handleMessageRTLayer);
    channelIdRef.current = newChannelId;

    return () => {
      listener.remove();
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [chatbotId, userId, threadId, subThreadId, dispatch]);

  // Start timeout timer for AI response
  const startTimeoutTimer = () => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    
    timeoutIdRef.current = setTimeout(() => {
      dispatch({ type: ChatActionTypes.SET_MESSAGE_TIMEOUT });
    }, 240000); // 4 minutes timeout
  };

  // Handle window messages (for external communication)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event?.data?.type === "refresh") {
        // Trigger a refresh action
      }
      
      if (event?.data?.type === "askAi") {
        if (!loading) {
          const data = event?.data?.data;
          if (typeof data === "string") {
            // Direct sending message
            // Will be implemented in useChatActions
          } else {
            // Sending from SendDataToChatbot method
            // Will be implemented in useChatActions
          }
        } else {
          // Error handling will be in useChatActions
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [loading]);

  return {
    startTimeoutTimer,
    clearTimeoutTimer: () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    }
  };
};