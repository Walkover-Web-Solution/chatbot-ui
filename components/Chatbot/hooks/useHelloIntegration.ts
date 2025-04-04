import { getHelloChatsApi } from '@/config/api';
import useSocket from '@/hooks/socket';
import { getHelloDetailsStart, setChannel } from '@/store/hello/helloSlice';
import axios from 'axios';
import { useCallback, useEffect, useReducer, useRef } from 'react';
import { chatReducer, initialChatState } from './chatReducer';
import { ChatActionTypes } from './chatTypes';
import { useReduxStateManagement } from './useReduxManagement';

interface UseHelloIntegrationProps {
  setOpen: (open: boolean) => void;
}

interface HelloMessage {
  role: string;
  message_id?: string;
  from_name?: string;
  content: string;
  id?: string;
}

const useHelloIntegration = () => {
  const [state, dispatch] = useReducer(chatReducer, initialChatState)
  const { loading, helloMessages, bridgeName, threadId, helloId, bridgeVersionId } = state;
  const { uuid, unique_id, channelId, presence_channel, team_id, chat_id } = useReduxStateManagement();
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const socket: any = useSocket();

  const setLoading = (value: boolean) => {
    dispatch({ type: ChatActionTypes.SET_LOADING, payload: value });
  }

  const setHelloMessages = (messages: HelloMessage[]) => {
    dispatch({ type: ChatActionTypes.SET_HELLO_MESSAGES, payload: messages });
  }

  // Initialize socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewPublish = (data: any) => {
      const { response } = data;
      const { message } = response || {};
      const { content, chat_id, from_name, sender_id } = message || {};
      const text = content?.text;

      if (text && !chat_id) {
        setLoading(false);
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
        }

        setHelloMessages((prevMessages: HelloMessage[]) => {
          const lastMessageId = prevMessages.length > 0 ? prevMessages[prevMessages.length - 1]?.id : undefined;
          if (lastMessageId !== response?.id) {
            return [
              ...prevMessages,
              {
                role: sender_id === "bot" ? "Bot" : "Human",
                from_name,
                content: text,
                id: response?.id,
              },
            ];
          }
          return prevMessages;
        });
      }
    };

    socket.on("NewPublish", handleNewPublish);
    // socket.on("message", (data) => {
    //   // Handle any message events if needed
    // });

    return () => {
      socket.on("NewPublish");
      // socket.off("message");
    };
  }, [socket]);

  // Fetch previous Hello chat history
  const fetchHelloPreviousHistory = useCallback(async () => {
    if (channelId && uuid) {
      try {
        const response = await getHelloChatsApi({ channelId });
        const helloChats = response?.data?.data;

        if (Array.isArray(helloChats) && helloChats.length > 0) {
          const filterChats = helloChats
            .map((chat) => {
              let role;

              if (chat?.message?.from_name) {
                role = "Human";
              } else if (
                !chat?.message?.from_name &&
                chat?.message?.sender_id === "bot"
              ) {
                role = "Bot";
              } else {
                role = "user";
              }

              return {
                role: role,
                message_id: chat?.id,
                from_name: chat?.message?.from_name,
                content: chat?.message?.content?.text,
              };
            })
            .reverse();

          setHelloMessages(filterChats);
        }
      } catch (error) {
        console.warn("Error fetching Hello chats:", error);
      }
    }
  }, [channelId, uuid]);

  useEffect(() => {
    fetchHelloPreviousHistory();
  }, [fetchHelloPreviousHistory, channelId, uuid]);

  const subscribeToChannel = () => {
    if (bridgeName && threadId) {
      dispatch(
        getHelloDetailsStart({
          slugName: bridgeName,
          threadId: threadId,
          helloId: helloId || null,
          versionId: bridgeVersionId || null,
        })
      );
    }
  };

  useEffect(() => {
    subscribeToChannel();
  }, [bridgeName, threadId, helloId]);

  // Send message to Hello
  const sendMessageToHello = useCallback(async (message: string) => {
    if (!message.trim()) return;

    try {
      const channelDetail = !channelId ? {
        call_enabled: null,
        uuid,
        country: null,
        pseudo_name: null,
        unique_id,
        presence_channel,
        country_iso2: null,
        chatInputSubmitted: false,
        is_blocked: null,
        customer_name: null,
        customer_number: null,
        customer_mail: null,
        team_id,
        new: true,
      } : undefined;

      if (!channelId) dispatch({ type: ChatActionTypes.SET_OPEN_HELLO_FORM, payload: true });

      const response = await axios.post(
        "https://api.phone91.com/v2/send/",
        {
          type: "widget",
          message_type: "text",
          content: {
            text: message,
            attachment: [],
          },
          ...(channelDetail ? { channelDetail } : {}),
          chat_id: !channelId ? null : chat_id,
          session_id: null,
          user_data: {},
          is_anon: true,
        },
        {
          headers: {
            accept: "application/json",
            authorization: localStorage.getItem("HelloAgentAuth"),
          },
        }
      );

      if (!channelId && response?.data?.data) {
        dispatch(setChannel({ Channel: response.data.data }));
      }

      return response.data.data;
    } catch (error) {
      console.error("Error sending message to Hello:", error);
    }
  }, [channelId, uuid, unique_id, presence_channel, team_id, chat_id, setOpen, dispatch]);

  // Handle sending a message
  const onSendHello = useCallback((message?: string, inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement>) => {
    const textMessage = message || (inputRef?.current?.value || '');
    if (!textMessage.trim()) return;

    // Add user message to local state immediately
    setHelloMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: textMessage },
    ]);

    // Send message to API
    sendMessageToHello(textMessage);
    dispatch({ type: ChatActionTypes.SET_OPTIONS, payload: [] });

    // Clear input field
    if (inputRef?.current) {
      inputRef.current.value = '';
    }

    return true;
  }, [sendMessageToHello]);

  // Start timeout timer for response waiting
  const startTimeoutTimer = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    timeoutIdRef.current = setTimeout(() => {
      setLoading(false);
    }, 240000); // 4 minutes timeout

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  return {
    helloMessages,
    loading,
    setLoading,
    onSendHello,
    sendMessageToHello,
    startTimeoutTimer,
    fetchHelloPreviousHistory
  };
};

export default useHelloIntegration;