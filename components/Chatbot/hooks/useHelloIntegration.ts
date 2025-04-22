import { ThemeContext } from '@/components/AppWrapper';
import { ChatbotContext } from '@/components/context';
import { getAllChannels, getCallToken, getClientToken, getHelloChatHistoryApi, getJwtToken, initializeHelloChat, registerAnonymousUser, sendMessageToHelloApi } from '@/config/helloApi';
import useSocket from '@/hooks/socket';
import useSocketEvents from '@/hooks/socketEventHandler';
import socketManager from '@/hooks/socketManager';
import { setChannelListData, setHelloKeysData, setJwtToken, setWidgetInfo } from '@/store/hello/helloSlice';
import { $ReduxCoreType } from '@/types/reduxCore';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import { generateNewId } from '@/utils/utilities';
import { useCallback, useContext, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { ChatAction, ChatActionTypes, ChatState } from './chatTypes';
import { useChatActions } from './useChatActions';
import { useReduxStateManagement } from './useReduxManagement';
import helloVoiceService from './HelloVoiceService';

interface HelloMessage {
  role: string;
  message_id?: string;
  from_name?: string;
  content: string;
  id?: string;
  chat_id?: string;
  urls?: string[];
}

interface UseHelloIntegrationProps {
  chatbotId: string;
  chatState: ChatState;
  chatDispatch: React.Dispatch<ChatAction>;
  messageRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLDivElement>;
}

const useHelloIntegration = ({ chatbotId, chatDispatch, chatState, messageRef }: UseHelloIntegrationProps) => {
  const { handleThemeChange } = useContext(ThemeContext);
  const { isHelloUser } = useContext(ChatbotContext);
  const { loading, helloMessages, bridgeName, images, isToggledrawer } = chatState;
  const { setLoading, setChatsLoading } = useChatActions({ chatbotId, chatDispatch, chatState });
  const {
    uuid,
    unique_id,
    presence_channel,
    unique_id_hello = "",
    widgetToken,
    currentChatId,
    currentTeamId,
    currentChannelId,
    isSmallScreen
  } = useReduxStateManagement({ chatbotId, chatDispatch });

  const { assigned_type } = useCustomSelector((state: $ReduxCoreType) => ({
    assigned_type: state.Hello?.channelListData?.channels?.find(
      (channel: any) => channel?.channel === state?.Hello?.currentChannelId
    )?.assigned_type || 'bot',
  }));

  const isBot = assigned_type === 'bot';
  const dispatch = useDispatch();
  const mountedRef = useRef(false);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  useSocket();
  useSocketEvents({ chatbotId, chatState, chatDispatch, messageRef });

  const setHelloMessages = useCallback((messages: HelloMessage[]) => {
    chatDispatch({ type: ChatActionTypes.SET_HELLO_MESSAGES, payload: { data: messages } });
  }, [chatDispatch]);

  const addHelloMessage = useCallback((message: HelloMessage, responseType: any = '') => {
    chatDispatch({ type: ChatActionTypes.ADD_HELLO_MESSAGE, payload: { message, responseType } });
  }, [chatDispatch]);

  // Fetch previous Hello chat history
  const fetchHelloPreviousHistory = useCallback((channelId: string = currentChannelId) => {
    if (!channelId || !uuid) return;

    setChatsLoading(true);
    getHelloChatHistoryApi(channelId)
      .then((response) => {
        const helloChats = response?.data?.data;
        if (Array.isArray(helloChats) && helloChats.length > 0) {
          const filterChats = helloChats
            .map((chat) => {
              let role;
              if (chat?.message?.from_name) {
                role = "Human";
              } else if (!chat?.message?.from_name && chat?.message?.sender_id === "bot") {
                role = "Bot";
              } else {
                role = "user";
              }

              return {
                role,
                message_id: chat?.id,
                from_name: chat?.message?.from_name,
                content: chat?.message?.message_type === 'interactive'
                  ? chat?.message?.content?.body?.text
                  : chat?.message?.content?.text,
                urls: chat?.message?.content?.attachment,
              };
            })
            .reverse();
          setHelloMessages(filterChats);
        }
      })
      .catch((error) => {
        console.error("Error fetching Hello chat history:", error);
      })
      .finally(() => {
        setChatsLoading(false);
      });
  }, [currentChannelId, uuid, setChatsLoading, setHelloMessages]);

  const getToken = useCallback(() => {
    getJwtToken().then((data) => {
      if (data !== null) {
        mountedRef.current = true;
        dispatch(setJwtToken(data));
        getClientToken().then(() => { helloVoiceService.initialize() });
        getCallToken();
      }
    });
  }, [dispatch]);

  const fetchChannels = useCallback(() => {
    return getAllChannels(unique_id_hello).then(data => {
      dispatch(setChannelListData(data));
      if (!mountedRef.current) {
        getToken();
      }
    });
  }, [dispatch, unique_id_hello, getToken]);

  const getWidgetInfo = async () => {

    if (isHelloUser && widgetToken) {
      initializeHelloChat(unique_id_hello).then(data => {
        dispatch(setWidgetInfo(data));
        handleThemeChange(data?.primary_color || "#000000");
      });
    }
    // else if (bridgeName && threadId) {
    //   dispatch(
    //     getHelloDetailsStart({
    //       slugName: bridgeName,
    //       threadId: threadId,
    //       helloId: helloId || null,
    //       versionId: bridgeVersionId || null,
    //     })
    //   );
    // }
  };

  const createAnonymousUser = useCallback(() => {
    registerAnonymousUser().then(() => {
      getToken();
    });
  }, [getToken]);

  // Start timeout timer for response waiting
  const startTimeoutTimer = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    timeoutIdRef.current = setTimeout(() => {
      setLoading(false);
    }, 10000); // 10 seconds timeout

    return () => {
      if (timeoutIdRef.current) {
        setLoading(false);
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [setLoading]);

  // Send message to Hello
  const onSendHello = useCallback(async (message: string, newMessage: HelloMessage) => {
    if (!message.trim() && images.length === 0) return;

    try {
      const channelDetail = !currentChatId ? {
        call_enabled: null,
        uuid,
        unique_id,
        country: null,
        pseudo_name: null,
        presence_channel,
        country_iso2: null,
        chatInputSubmitted: false,
        is_blocked: null,
        customer_name: null,
        customer_number: null,
        customer_mail: null,
        team_id: currentTeamId,
        new: true,
      } : undefined;

      if (!currentChatId) {
        chatDispatch({ type: ChatActionTypes.SET_OPEN_HELLO_FORM, payload: true });
      }

      const attachments = Array.isArray(images) && images?.length ? images : null;

      if (attachments) {
        chatDispatch({ type: ChatActionTypes.SET_IMAGES, payload: [] });
      }

      if (isBot) {
        setLoading(true);
      }

      startTimeoutTimer();

      const data = await sendMessageToHelloApi(message, attachments, channelDetail, currentChatId);

      if (data && !currentChatId) {
        dispatch(setHelloKeysData({
          currentChatId: data?.['id'],
          currentChannelId: data?.['channel']
        }));

        if (data?.['presence_channel'] && data?.['channel']) {
          try {
            await socketManager.subscribe([data?.['presence_channel'], data?.['channel']]);
          } catch (error) {
            console.error("Failed to subscribe to channels:", error);
          }
        }

        if (isBot) {
          setLoading(false);
        }

        if (!isSmallScreen) {
          fetchChannels();
        }
      }
    } catch (error) {
      if (isBot) {
        setLoading(false);
      }
      console.error("Error sending message to Hello:", error);
    }
  }, [
    currentChatId,
    currentTeamId,
    uuid,
    unique_id,
    presence_channel,
    chatDispatch,
    images,
    isBot,
    isSmallScreen,
    unique_id_hello,
    startTimeoutTimer,
    setLoading,
    dispatch,
    fetchChannels
  ]);

  // Handle sending a message
  const sendMessageToHello = useCallback(() => {
    // Handle different types of input elements
    let textMessage = '';
    if (messageRef?.current) {
      if ('value' in messageRef.current) {
        textMessage = messageRef.current.value || '';
      } else if (messageRef.current instanceof HTMLDivElement) {
        textMessage = messageRef.current.textContent || '';
      }
    }

    if (!textMessage.trim() && images?.length === 0) return false;

    const messageId = generateNewId();
    const newMessage = {
      id: messageId,
      role: "user",
      content: textMessage,
      urls: images || [],
    };

    // Add message to chat
    addHelloMessage(newMessage);

    // Send message to API
    onSendHello(textMessage, newMessage);

    // Clear input field
    if (messageRef?.current) {
      if ('value' in messageRef.current) {
        messageRef.current.value = '';
      } else if (messageRef.current instanceof HTMLDivElement) {
        messageRef.current.textContent = '';
      }
    }

    return true;
  }, [onSendHello, addHelloMessage, images, messageRef]);

  // Effect hooks
  useEffect(() => {
    if (!mountedRef.current) {
      fetchHelloPreviousHistory();
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("HelloClientId") && !unique_id_hello && widgetToken && isHelloUser) {
      createAnonymousUser();
    }
  }, [isHelloUser, unique_id_hello, widgetToken, createAnonymousUser]);

  useEffect(() => {
    getWidgetInfo();
  }, [bridgeName, isHelloUser, widgetToken]);

  useEffect(() => {
    if (isHelloUser && localStorage.getItem("HelloClientId")) {
      // Only fetch channels on mount (when mountedRef is false) or when drawer is toggled open
      if (!mountedRef.current || isToggledrawer) {
        fetchChannels();
      }
    }
  }, [isHelloUser, unique_id_hello, isToggledrawer, mountedRef, fetchChannels]);

  return {
    helloMessages,
    loading,
    setLoading,
    sendMessageToHello,
    fetchHelloPreviousHistory,
    addHelloMessage
  };
};

export default useHelloIntegration;