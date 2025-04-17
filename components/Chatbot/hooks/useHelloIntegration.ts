import { ChatbotContext } from '@/components/context';
import { getAllChannels, getHelloChatHistoryApi, getJwtToken, initializeHelloChat, registerAnonymousUser, sendMessageToHelloApi } from '@/config/helloApi';
import useSocket from '@/hooks/socket';
import socketManager from '@/hooks/socketManager';
import { setDataInAppInfoReducer } from '@/store/appInfo/appInfoSlice';
import { getHelloDetailsStart, setChannelListData, setHelloKeysData, setJwtToken, setWidgetInfo } from '@/store/hello/helloSlice';
import { generateNewId } from '@/utils/utilities';
import { useCallback, useContext, useEffect, useRef } from 'react';
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
  const { loading, helloMessages, bridgeName, threadId, helloId, bridgeVersionId, images, isToggledrawer } = chatState;
  const { uuid, unique_id, presence_channel, unique_id_hello = "", widgetToken, currentChatId, currentTeamId, currentChannelId } = useReduxStateManagement({ chatbotId, chatDispatch });
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const socket: any = useSocket();
  const dispatch = useDispatch();
  const { isHelloUser } = useContext(ChatbotContext);
  const mountedRef = useRef(false);

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
    // if (!socket) return;
    const handleNewMessage = (data: any) => {
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

    socketManager.on("NewPublish", handleNewMessage);

    // Clean up when component unmounts
    return () => {
      socketManager.off("NewPublish", handleNewMessage);
    };
  }, []);

  // Fetch previous Hello chat history
  const fetchHelloPreviousHistory = useCallback(async () => {
    if (currentChannelId && uuid) {
      try {
        getHelloChatHistoryApi(currentChannelId).then((response) => {
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
        }
        ).catch((error) => {
          console.error("Error fetching Hello chat history:", error);
        });

        // const response = await getHelloChatsApi({ channelId: currentChannelId });
        // const helloChats = response?.data?.data;

        // if (Array.isArray(helloChats) && helloChats.length > 0) {
        //   const filterChats = helloChats
        //     .map((chat) => {
        //       let role;

        //       if (chat?.message?.from_name) {
        //         role = "Human";
        //       } else if (
        //         !chat?.message?.from_name &&
        //         chat?.message?.sender_id === "bot"
        //       ) {
        //         role = "Bot";
        //       } else {
        //         role = "user";
        //       }

        //       return {
        //         role: role,
        //         message_id: chat?.id,
        //         from_name: chat?.message?.from_name,
        //         content: chat?.message?.content?.text,
        //       };
        //     })
        //     .reverse();

        //   setHelloMessages(filterChats);
        // }
      } catch (error) {
        console.warn("Error fetching Hello chats:", error);
      }
    }
  }, [currentChannelId, uuid]);

  useEffect(() => {
    fetchHelloPreviousHistory();
  }, [fetchHelloPreviousHistory, currentChannelId, uuid]);

  const getWidgetInfo = async () => {
    if (isHelloUser && widgetToken) {
      initializeHelloChat(unique_id_hello).then(data => dispatch(setWidgetInfo(data)));
    }
    else if (bridgeName && threadId) {
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

  const createAnonymousUser = async () => {
    registerAnonymousUser().then(() => {
      getToken()
    })
  }

  useEffect(() => {
    getWidgetInfo();
  }, [bridgeName, threadId, helloId, isHelloUser, widgetToken]);

  const getToken = () => {
    getJwtToken().then((data) => {
      if (data !== null) {
        mountedRef.current = true;
        dispatch(setJwtToken(data));
      }
    });
  }

  useEffect(() => {
    if (!localStorage.getItem("HelloClientId") && !unique_id_hello && widgetToken && isHelloUser) {
      createAnonymousUser();
    }
  }, [isHelloUser, unique_id_hello, widgetToken])

  useEffect(() => {
    if (isHelloUser && localStorage.getItem("HelloClientId")) {
      // Only fetch channels on mount (when mountedRef is false) or when drawer is toggled open
      if (!mountedRef.current || isToggledrawer) {
        getAllChannels(unique_id_hello).then(data => {
          dispatch(setChannelListData(data));
          if(!mountedRef.current) getToken();
        });
      }
    }
  }, [isHelloUser, unique_id_hello, isToggledrawer, mountedRef])

  // Send message to Hello
  const onSendHello = useCallback(async (message: string) => {
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

      if (!currentChatId) chatDispatch({ type: ChatActionTypes.SET_OPEN_HELLO_FORM, payload: true });
      const attachments = Array.isArray(images) && images?.length ? images : null;
      if (attachments) chatDispatch({ type: ChatActionTypes.SET_IMAGES, payload: [] })

      sendMessageToHelloApi(message, attachments, channelDetail, currentChatId).then((data) => {
        if (data && !currentChatId) {
          dispatch(setHelloKeysData({ currentChatId: data?.['id'], currentChannelId: data?.['channel'] }));
          dispatch(setDataInAppInfoReducer({ subThreadId: data?.['id'] }));

          if (data?.['presence_channel'] && data?.['channel']) {
            socketManager.subscribe([data?.['presence_channel'], data?.['channel']])
              .then((subscriptionData) => {
                console.log("Subscribed channels data:", subscriptionData);
              })
              .catch((error) => {
                console.error("Failed to subscribe to channels:", error);
              });
          }
        }
      });
    } catch (error) {
      console.error("Error sending message to Hello:", error);
    }
  }, [currentChatId, currentTeamId, uuid, unique_id, presence_channel, chatDispatch, images]);

  // Handle sending a message
  const sendMessageToHello = useCallback(() => {
    const textMessage = (messageRef?.current?.value || '');
    if (!textMessage.trim() && images?.length === 0) return;

    addHelloMessage({
      id: generateNewId(),
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