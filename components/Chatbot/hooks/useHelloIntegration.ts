import { getHelloChatsApi } from '@/config/api';
import useSocket from '@/hooks/socket';
import { getHelloDetailsStart, setChannel } from '@/store/hello/helloSlice';
import axios from 'axios';
import { useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { ChatAction, ChatActionTypes, ChatState } from './chatTypes';
import { useReduxStateManagement } from './useReduxManagement';

interface HelloMessage {
  role: string;
  message_id?: string;
  from_name?: string;
  content: string;
  id?: string;
}

const useHelloIntegration = ({ chatbotId, chatDispatch, chatState, messageRef }: { chatbotId: string, chatState: ChatState, chatDispatch: React.Dispatch<ChatAction>, messageRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLDivElement> }) => {
  const { loading, helloMessages, bridgeName, threadId, helloId, bridgeVersionId } = chatState;
  const { uuid, unique_id, channelId, presence_channel, team_id, chat_id } = useReduxStateManagement({ chatbotId, chatDispatch, chatState });
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const socket: any = useSocket();
  const dispatch = useDispatch();

  const setLoading = (value: boolean) => {
    chatDispatch({ type: ChatActionTypes.SET_LOADING, payload: value });
  }

  const setHelloMessages = (messages: HelloMessage[]) => {
    chatDispatch({ type: ChatActionTypes.SET_HELLO_MESSAGES, payload: messages });
  }

  const addHelloMessage = (message: HelloMessage, reponseType: any = '') => {
    chatDispatch({ type: ChatActionTypes.ADD_HELLO_MESSAGE, payload: { message, reponseType } });
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

        addHelloMessage({
          role: sender_id === "bot" ? "Bot" : "Human",
          from_name,
          content: text,
          id: response?.id,
        }, 'assistant');
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
  const onSendHello = useCallback(async (message: string) => {
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

      if (!channelId) chatDispatch({ type: ChatActionTypes.SET_OPEN_HELLO_FORM, payload: true });

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
  }, [channelId, uuid, unique_id, presence_channel, team_id, chat_id, chatDispatch]);

  // Handle sending a message
  const sendMessageToHello = useCallback(() => {
    const textMessage = (messageRef?.current?.value || '');
    if (!textMessage.trim()) return;

    addHelloMessage({
      role: "user",
      content: textMessage,
    });

    // Send message to API
    onSendHello(textMessage);

    // Clear input field
    if (messageRef?.current) {
      messageRef.current.value = '';
    }

    return true;
  }, [onSendHello]);

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
    sendMessageToHello,
    startTimeoutTimer,
    fetchHelloPreviousHistory
  };
};

export default useHelloIntegration;