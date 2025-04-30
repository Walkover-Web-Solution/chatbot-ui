import { ThemeContext } from '@/components/AppWrapper';
import { ChatbotContext } from '@/components/context';
import { addDomainToHello, getAllChannels, getCallToken, getClientToken, getGreetingQuestions, getHelloChatHistoryApi, getJwtToken, initializeHelloChat, registerAnonymousUser, sendMessageToHelloApi } from '@/config/helloApi';
import useSocket from '@/hooks/socket';
import useSocketEvents from '@/hooks/socketEventHandler';
import socketManager from '@/hooks/socketManager';
import { setChannelListData, setGreeting, setHelloKeysData, setJwtToken, setWidgetInfo } from '@/store/hello/helloSlice';
import { $ReduxCoreType } from '@/types/reduxCore';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import { generateNewId, getLocalStorage } from '@/utils/utilities';
import { useCallback, useContext, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { ChatAction, ChatActionTypes, ChatState } from './chatTypes';
import helloVoiceService from './HelloVoiceService';
import { useChatActions } from './useChatActions';
import { useReduxStateManagement } from './useReduxManagement';
import { setDataInAppInfoReducer } from '@/store/appInfo/appInfoSlice';

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
  const { loading, helloMessages, bridgeName, threadId, helloId, bridgeVersionId, images, isToggledrawer } = chatState;
  const initializingRef = useRef(false);

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

  const { assigned_type, is_domain_enable, companyId, botId, mail, number, userJwtToken, helloConfig, showWidgetForm } = useCustomSelector((state: $ReduxCoreType) => ({
    assigned_type: state.Hello?.channelListData?.channels?.find(
      (channel: any) => channel?.channel === state?.Hello?.currentChannelId
    )?.assigned_type || 'bot',
    is_domain_enable: state.Hello?.widgetInfo?.is_domain_enable || false,
    companyId: state.Hello?.widgetInfo?.company_id || '',
    botId: state.Hello?.widgetInfo?.bot_id || '',
    showWidgetForm: state.Hello?.showWidgetForm,
    mail: state.Hello?.helloConfig?.mail,
    number: state.Hello?.helloConfig?.number,
    userJwtToken: state.Hello?.helloConfig?.user_jwt_token,
    helloConfig: state.Hello?.helloConfig
  }));

  const isBot = assigned_type === 'bot';
  const dispatch = useDispatch();
  const mountedRef = useRef(false);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  useSocket();

  const setHelloMessages = useCallback((messages: HelloMessage[]) => {
    chatDispatch({ type: ChatActionTypes.SET_INTIAL_MESSAGES, payload: { messages } });
    // chatDispatch({ type: ChatActionTypes.SET_HELLO_MESSAGES, payload: { data: messages } });
  }, [chatDispatch]);

  const addHelloMessage = useCallback((message: HelloMessage) => {
    chatDispatch({ type: ChatActionTypes.SET_PAGINATE_MESSAGES, payload: { messages: [message] } });
  }, [chatDispatch]);

  // Fetch previous Hello chat history
  const fetchHelloPreviousHistory = useCallback((channelId: string = currentChannelId) => {
    if (!channelId || !uuid || !getLocalStorage(`${widgetToken}_HelloClientId`)) return;

    setChatsLoading(true);
    getHelloChatHistoryApi(channelId)
      .then((response) => {
        const helloChats = response?.data?.data;
        if (Array.isArray(helloChats) && helloChats.length > 0) {
          setHelloMessages(helloChats);
        }
      })
      .catch((error) => {
        console.error("Error fetching Hello chat history:", error);
      })
      .finally(() => {
        setChatsLoading(false);
      });
  }, [currentChannelId, uuid, setChatsLoading, setHelloMessages]);

  // Fetch all channels
  const fetchChannels = useCallback(() => {
    return getAllChannels(helloConfig)
      .then(data => {
        dispatch(setChannelListData(data));
        return data;
      })
      .catch(error => {
        console.error("Error fetching channels:", error);
      });
  }, [dispatch, helloConfig]);

  useSocketEvents({ chatbotId, chatState, chatDispatch, messageRef, fetchChannels });

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

      // show widget form only if in case of new chat and showWidgetForm is true i.e if all the fields are not filled
      if (!currentChatId && showWidgetForm) {
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
      if (data && (!currentChatId || !currentChannelId)) {
        dispatch(setHelloKeysData({
          currentChatId: data?.['id'],
          currentChannelId: data?.['channel']
        }));
        dispatch(setDataInAppInfoReducer({ subThreadId: data?.['channel'] }));
        chatDispatch({ type: ChatActionTypes.SET_INTIAL_MESSAGES, payload: { messages: [newMessage], subThreadId: data?.['channel'] } })

        if (data?.['presence_channel'] && data?.['channel']) {
          try {
            await socketManager.subscribe([data?.['presence_channel'], data?.['channel']]);
          } catch (error) {
            console.error("Failed to subscribe to channels:", error);
          }
        }
        fetchChannels();
        if (data?.['channel']) {
          fetchHelloPreviousHistory(data?.['channel']);
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
    startTimeoutTimer,
    setLoading,
    dispatch,
    fetchChannels,
    currentChannelId,
    showWidgetForm
  ]);

  const sendMessageToHello = useCallback((message: string = '') => {
    // Handle different types of input elements
    let textMessage = '';
    if (messageRef?.current) {
      if ('value' in messageRef.current) {
        textMessage = messageRef.current.value || message || '';
      } else if (messageRef.current instanceof HTMLDivElement) {
        textMessage = messageRef.current.textContent || message || '';
      }
    }

    if (!textMessage.trim() && images?.length === 0) return false;

    const messageId = generateNewId();
    const newMessage = {
      id: messageId,
      role: "user",
      message: {
        content: {
          text: textMessage,
          attachment: images || []
        }
      }
    };

    // Add message to chat
    if (currentChannelId) addHelloMessage(newMessage);

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
  }, [onSendHello, addHelloMessage, images, messageRef, currentChannelId]);

  // Effect hooks
  useEffect(() => {
    // if (!mountedRef.current) {
    //   fetchHelloPreviousHistory();
    // }
    window.addEventListener("localstorage-updated",handleStorageUpdate);
    return () => {
      window.removeEventListener("localstorage-updated", handleStorageUpdate);
    };
    }, []);

    const handleStorageUpdate = (e: StorageEvent) => {
      if(e.detail.key === 'WidgetId'){
        initializeHelloServices(e.detail.value);
      }
    };

  const initializeHelloServices = async (widgetToken:string = '') => {
    // Prevent duplicate initialization
    if (!widgetToken || widgetToken !== getLocalStorage("WidgetId")) {
      return;
    }

    try {
      let helloClientId = getLocalStorage(`${widgetToken}_HelloClientId`);
      let needsAnonymousRegistration = !helloClientId && !unique_id_hello && widgetToken && isHelloUser && !mail && !number;
      
      console.log("needsAnonymousRegistration ==-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=", needsAnonymousRegistration);

      // Step 1: Create anonymous user if needed (first time only)
      if (needsAnonymousRegistration) {
        await registerAnonymousUser();
        helloClientId = getLocalStorage(`${widgetToken}_HelloClientId`);
      } else {
        // it gives the Hello Client Id for the registered user
        await fetchChannels();
      }

      // Step 2: Handle domain (if needed)
      if (is_domain_enable) {
        await addDomainToHello(localStorage.getItem("websiteUrl") || document.referrer, unique_id_hello, mail, userJwtToken, number);
      }

      let widgetData = null;
      let jwtData = null;
      
      if (isHelloUser && widgetToken) {
        try {
          widgetData = await initializeHelloChat(unique_id_hello);
          if (!widgetData) {
            window.parent.postMessage({ type: 'initializeHelloChat_failed' }, '*');
          }
      
          dispatch(setWidgetInfo(widgetData));
          handleThemeChange(widgetData?.primary_color || "#000000");
        } catch (error) {
          window.parent.postMessage({ type: 'initializeHelloChat_failed' }, '*');
          console.error("Failed to initialize Hello Chat:", error);
          return; // Exit early, don't proceed to getJwtToken
        }
      }
      
      // Only get JWT token if widgetData is valid and HelloClientId exists
      if (widgetData && localStorage.getItem("HelloClientId")) {
        try {
          jwtData = await getJwtToken();
          if (jwtData !== null) {
            dispatch(setJwtToken(jwtData));
          }
        } catch (error) {
          console.error("Failed to fetch JWT token:", error);
        }
      }
      


      // Step 4: Get greeting questions (depends on widget info for company/bot IDs)
      const greetingCompanyId = widgetData?.company_id || companyId;
      const greetingBotId = widgetData?.bot_id || botId;

      if (widgetData && greetingCompanyId && greetingBotId && getLocalStorage(`${widgetToken}_HelloClientId`)) {
        await getGreetingQuestions(greetingCompanyId, greetingBotId).then((data) => {
          dispatch(setGreeting({ ...data?.greeting }));
        });
      }

      // Step 5: Get client token and call token (depend on JWT)
      if (getLocalStorage(`${widgetToken}_HelloClientId`) && widgetToken) {
        const clientTokenPromise = getClientToken().then(() => {
          helloVoiceService.initialize();
        });

        const callTokenPromise = getCallToken();

        await Promise.all([clientTokenPromise, callTokenPromise]);
      }

      // Step 6: Fetch channels
      needsAnonymousRegistration && fetchChannels();
      console.log("currentChannelId ==-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=", currentChannelId);
      mountedRef.current = true;
    } catch (error) {
      console.error("Error initializing Hello services:", error);
    } finally {
      // Ensure we reset the initializing flag even if there's an error
      initializingRef.current = false;
    }
  };

  // useEffect(() => {
  //   if (isHelloUser &&
  //     !mountedRef.current &&
  //     !initializingRef.current &&
  //     (getLocalStorage(`${widgetToken}_HelloClientId`) ||
  //       helloConfig?.unique_id ||
  //       helloConfig?.mail ||
  //       helloConfig?.number ||
  //       widgetToken)) {
  //     initializeHelloServices();
  //   }
  // }, [isHelloUser, helloConfig]);

  return {
    helloMessages,
    loading,
    setLoading,
    sendMessageToHello,
    fetchHelloPreviousHistory,
    addHelloMessage,
    fetchChannels
  };
};

export default useHelloIntegration;