import { ChatContext } from '@/components/Chatbot-Wrapper/ChatbotWrapper';
import { MessageContext } from '@/components/Interface-Chatbot/InterfaceChatbot';
import { getAllChannels, getHelloChatHistoryApi, sendMessageToHelloApi } from '@/config/helloApi';
import socketManager from '@/hooks/socketManager';
import { setDataInAppInfoReducer } from '@/store/appInfo/appInfoSlice';
import { setData, setHelloEventMessage, setImages, setInitialMessages, setOpenHelloForm, setPaginateMessages } from '@/store/chat/chatSlice';
import { setChannelListData, setHelloClientInfo, setHelloKeysData } from '@/store/hello/helloSlice';
import { useAppDispatch } from '@/store/useTypedHooks';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import { PAGE_SIZE } from '@/utils/enums';
import { generateNewId } from '@/utils/utilities';
import { useCallback, useContext, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useChatActions } from './useChatActions';
import { useReduxStateManagement } from './useReduxManagement';

interface HelloMessage {
  role: string;
  message_id?: string;
  from_name?: string;
  content: string;
  id?: string;
  chat_id?: string;
  urls?: string[];
  channel?: string;
}

export const useHelloContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useHelloContext must be used within a HelloContextProvider');
  }
  return context;
};

// Individual Hello hooks
export const useHelloMessages = () => {
  const globalDispatch = useAppDispatch();

  const setHelloMessages = useCallback((messages: HelloMessage[]) => {
    globalDispatch(setInitialMessages({ messages, subThreadId: messages?.[0]?.channel || "" }));
  }, [globalDispatch]);

  const addHelloMessage = useCallback((message: HelloMessage | HelloMessage[], subThreadId?: string) => {
    if (Array.isArray(message)) {
      globalDispatch(setPaginateMessages({ messages: message }));
      return;
    }
    globalDispatch(setHelloEventMessage({ message, subThreadId }));
  }, [globalDispatch]);

  return { setHelloMessages, addHelloMessage };
};

export const useFetchHelloPreviousHistory = () => {
  const { chatSessionId } = useHelloContext();
  const globalDispatch = useAppDispatch();
  const { setChatsLoading } = useChatActions();
  const { setHelloMessages } = useHelloMessages();

  const { uuid, currentChannelId } = useReduxStateManagement({
    chatSessionId,
    tabSessionId: useHelloContext().tabSessionId
  });

  return useCallback((dynamicChannelId?: string) => {
    const channelId = dynamicChannelId || currentChannelId;
    if (!channelId || !uuid) return;

    setChatsLoading(true);
    getHelloChatHistoryApi(channelId)
      .then((response) => {
        const helloChats = response?.data?.data;
        if (Array.isArray(helloChats) && helloChats.length > 0) {
          setHelloMessages(helloChats);
          globalDispatch(setData({
            hasMoreMessages: helloChats.length >= PAGE_SIZE.hello,
            skip: helloChats.length,
          }));
        } else {
          globalDispatch(setData({
            hasMoreMessages: false,
          }));
        }
      })
      .catch((error) => {
        console.error("Error fetching Hello chat history:", error);
      })
      .finally(() => {
        setChatsLoading(false);
      });
  }, [currentChannelId, uuid, setChatsLoading, setHelloMessages, globalDispatch]);
};

export const useGetMoreHelloChats = () => {
  const { chatSessionId } = useHelloContext();
  const globalDispatch = useAppDispatch();
  const { setChatsLoading } = useChatActions();
  const { addHelloMessage } = useHelloMessages();

  const { uuid, currentChannelId } = useReduxStateManagement({
    chatSessionId,
    tabSessionId: useHelloContext().tabSessionId
  });

  const { hasMoreMessages, skip } = useCustomSelector((state) => ({
    hasMoreMessages: state.Chat.hasMoreMessages,
    skip: state.Chat.skip
  }));

  return useCallback(() => {
    if (!currentChannelId || !uuid || !hasMoreMessages) return;

    setChatsLoading(true);
    getHelloChatHistoryApi(currentChannelId, skip)
      .then((response) => {
        const helloChats = response?.data?.data;
        if (Array.isArray(helloChats) && helloChats.length > 0) {
          addHelloMessage(helloChats);
          globalDispatch(setData({
            hasMoreMessages: helloChats.length >= PAGE_SIZE.hello,
            skip: skip + helloChats.length,
          }));
        } else {
          globalDispatch(setData({
            hasMoreMessages: false,
          }));
        }
      })
      .catch((error) => {
        console.error("Error fetching more Hello chat history:", error);
      })
      .finally(() => {
        setChatsLoading(false);
      });
  }, [currentChannelId, uuid, setChatsLoading, addHelloMessage, hasMoreMessages, skip, globalDispatch]);
};

export const useFetchChannels = () => {
  const dispatch = useDispatch();

  return useCallback(() => {
    return getAllChannels()
      .then(data => {
        dispatch(setChannelListData(data));
        if (data?.customer_name && data?.customer_mail && data?.customer_number) {
          dispatch(setHelloKeysData({ showWidgetForm: false }))
        } else {
          dispatch(setHelloKeysData({ showWidgetForm: true }))
        }
        dispatch(setHelloClientInfo({ clientInfo: { Name: data?.customer_name, Email: data?.customer_mail, Phonenumber: data?.customer_number } }));
        return data;
      })
      .catch(error => {
        console.error("Error fetching channels:", error);
      });
  }, [dispatch]);
};

export const useHelloTimeout = () => {
  const { setLoading } = useChatActions();
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

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

  return { startTimeoutTimer };
};

export const useOnSendHello = () => {
  const { chatSessionId } = useHelloContext();
  const globalDispatch = useAppDispatch();
  const dispatch = useDispatch();
  const { setLoading } = useChatActions();
  const { addHelloMessage } = useHelloMessages();
  const { startTimeoutTimer } = useHelloTimeout();
  const fetchChannels = useFetchChannels();

  const {
    uuid,
    unique_id,
    presence_channel,
    currentChatId,
    currentTeamId,
    currentChannelId
  } = useReduxStateManagement({
    chatSessionId,
    tabSessionId: useHelloContext().tabSessionId
  });

  const { assigned_type, showWidgetForm, images, helloVariables } = useCustomSelector((state) => ({
    assigned_type: state.Hello?.[chatSessionId]?.channelListData?.channels?.find(
      (channel: any) => channel?.channel === currentChannelId
    )?.assigned_type,
    showWidgetForm: state.Hello?.[chatSessionId]?.showWidgetForm,
    images: state.Chat.images,
    helloVariables: state.draftData?.hello?.variables || {}
  }));

  const isBot = assigned_type === 'bot';

  return useCallback(async (message: string, newMessage: HelloMessage) => {
    if (!message.trim() && (!images || images.length === 0)) return;

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

      // Show widget form only if in case of new chat and showWidgetForm is true
      if (!currentChatId && showWidgetForm) {
        globalDispatch(setOpenHelloForm(true));
      }

      const attachments = Array.isArray(images) && images?.length ? images : null;

      if (attachments) {
        globalDispatch(setImages([]));
      }

      if (isBot || !assigned_type) {
        setLoading(true);
      }

      startTimeoutTimer();

      const data = await sendMessageToHelloApi(message, attachments, channelDetail, currentChatId, helloVariables);
      if (data && (!currentChatId || !currentChannelId)) {
        dispatch(setDataInAppInfoReducer({
          subThreadId: data?.['channel'],
          currentChatId: data?.['id'],
          currentChannelId: data?.['channel']
        }));
        addHelloMessage(newMessage, data?.['channel']);
        fetchChannels();
        if (data?.['presence_channel'] && data?.['channel']) {
          try {
            await socketManager.subscribe([data?.['presence_channel'], data?.['channel']]);
          } catch (error) {
            console.error("Failed to subscribe to channels:", error);
          }
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
    globalDispatch,
    images,
    isBot,
    startTimeoutTimer,
    setLoading,
    dispatch,
    fetchChannels,
    currentChannelId,
    showWidgetForm,
    assigned_type,
    addHelloMessage,
    helloVariables
  ]);
};

export const useSendMessageToHello = ({
  messageRef: propMessageRef,
}: {
  messageRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>,
}) => {
  const context = useContext(MessageContext);
  const messageRef = propMessageRef ?? context.messageRef;
  const { chatSessionId } = useHelloContext();
  const { setNewMessage } = useChatActions();
  const { addHelloMessage } = useHelloMessages();
  const onSendHello = useOnSendHello();

  const { currentChatId, currentChannelId } = useReduxStateManagement({
    chatSessionId,
    tabSessionId: useHelloContext().tabSessionId
  });

  const { images } = useCustomSelector((state) => ({
    images: state.Chat.images,
  }));

  return useCallback((message: string = '') => {
    // Handle different types of input elements
    let textMessage = '';
    if (messageRef?.current) {
      if ('value' in messageRef.current) {
        textMessage = messageRef.current.value || message || '';
      } else if (messageRef.current instanceof HTMLDivElement) {
        textMessage = messageRef.current.textContent || message || '';
      }
    }

    if (!textMessage.trim() && (!images || images?.length === 0)) return false;

    const messageId = generateNewId();
    const newMessage = {
      id: messageId,
      role: "user",
      chat_id: currentChatId || generateNewId(),
      content: {
        text: textMessage,
        attachment: images || []
      },
      timetoken: Date.now(),
      sender_id: "user"
    };

    // Add message to chat
    if (currentChannelId) addHelloMessage(newMessage);

    // Send message to API
    onSendHello(textMessage, newMessage);
    setNewMessage(true);

    // Clear input field
    if (messageRef?.current) {
      if ('value' in messageRef.current) {
        messageRef.current.value = '';
      } else if (messageRef.current instanceof HTMLDivElement) {
        messageRef.current.textContent = '';
      }
    }

    return true;
  }, [onSendHello, addHelloMessage, images, messageRef, currentChannelId, currentChatId, setNewMessage]);
};