'use client';
import { addDomainToHello } from "@/config/helloApi";
import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";
import { CBManger } from "@/hooks/coBrowser/CBManger";
import { setDataInAppInfoReducer } from "@/store/appInfo/appInfoSlice";
import { setHelloConfig, setHelloKeysData } from "@/store/hello/helloSlice";
import {
  addDefaultContext,
  setConfig,
  setDataInInterfaceRedux,
  setEventsSubsribedByParent,
  setHeaderActionButtons,
  setModalConfig,
  setThreadId
} from "@/store/interface/interfaceSlice";
import { ALLOWED_EVENTS_TO_SUBSCRIBE, ParamsEnums } from "@/utils/enums";
import { getLocalStorage, setLocalStorage } from "@/utils/utilities";
import React, { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import Chatbot from "../Chatbot/Chatbot";

interface InterfaceData {
  threadId?: string | null;
  bridgeName?: string | null;
  vision?: any;
  helloId?: string | null;
  version_id?: string | null;
  headerButtons?: Array<any>;
  eventsToSubscribe?: Array<string>;
  modalConfig?: Record<string, any>;
  allowModalSwitch?: boolean;
  chatTitle?: string;
  chatSubTitle?: string;
  chatIcon?: string;
  allowBridgeSwitch?: boolean;
  hideCloseButton?: boolean;
  variables?: Record<string, any>;
  [key: string]: any; // Allow for other properties
}

interface ChatbotWrapperProps {
  chatbotId?: string;
}

const helloToChatbotPropsMap: Record<string, string> = {
  // show_close_button: 'hideCloseButton',
  hideFullScreenButton: 'hideFullScreenButton'
}

function ChatbotWrapper({ chatbotId }: ChatbotWrapperProps) {
  const dispatch = useDispatch();

  // Handle messages from parent window
  const handleMessage = useCallback((event: MessageEvent) => {
    const allowedEvents = ["interfaceData", "helloData", "parent-route-changed", "ADD_COBROWSE_SCRIPT", "ADD_USER_EVENT_SEGMENTO"];
    if (!allowedEvents.includes(event?.data?.type)) return;

    if (event?.data?.type === 'ADD_COBROWSE_SCRIPT') {
      CBManger.injectScript(event?.data?.data?.origin)
    }

    // User Event Storing
    if (event?.data?.type === 'ADD_USER_EVENT_SEGMENTO' && event?.data?.data) {
      const { websiteUrl, ...rest } = event?.data?.data
      addDomainToHello(websiteUrl, rest)
      return
    }

    // Domain Tracking
    if (event?.data?.type == 'parent-route-changed' && event?.data?.data?.websiteUrl) {
      addDomainToHello(event?.data?.data?.websiteUrl);
      return;
    }

    if (event?.data?.type === "helloData") {
      const {
        widgetToken,
        unique_id,
        mail,
        number,
        user_jwt_token,
        name,
        ...restProps
      } = event.data.data;

      const prevWidgetId = getLocalStorage('WidgetId');
      const prevUser = JSON.parse(getLocalStorage('userData') || '{}');
      const hasUserIdentity = Boolean(unique_id || mail || number || user_jwt_token);

      // Helper: reset Redux keys and sub-thread
      const resetKeys = () => {
        dispatch(setHelloKeysData({ currentChannelId: '', currentChatId: '', currentTeamId: '' }));
        dispatch(setDataInAppInfoReducer({ subThreadId: '' }));
      };

      // 1. Widget token changed
      if (widgetToken !== prevWidgetId) {
        resetKeys();
        ['a_clientId', 'k_clientId', 'userData', 'client', 'default_client_created'].forEach(key => setLocalStorage(key, ''));
        setLocalStorage('is_anon', hasUserIdentity ? 'false' : 'true');
      }

      // 2. User identity changed
      if (unique_id !== prevUser.unique_id) {
        setLocalStorage('client', '{}');
        setLocalStorage('userData', '{}');
        resetKeys();
      }

      // 3. Update stored userData
      const { mail: clientMail, number: clientNumber, name: clientName, country_code: clientCountryCode } = JSON.parse(getLocalStorage('client') || '{}');
      if (mail && number && name) {
        setLocalStorage('client', JSON.stringify({ mail: mail, number: number, name: name, country_code: clientCountryCode || "+91" }));
        dispatch(setHelloKeysData({ showWidgetForm: false }));
      } else {
        setLocalStorage('client', JSON.stringify({ mail: clientMail, number: clientNumber, name: clientName, country_code: clientCountryCode || "+91" }));
      }

      setLocalStorage('userData', JSON.stringify({ unique_id, mail, number, user_jwt_token, name }));

      // 4. Anonymous cleanup when no identity
      if (!hasUserIdentity && getLocalStorage('k_clientId')) {
        resetKeys();
        setLocalStorage('k_clientId', '');
      }

      // 5. Determine anonymity status
      const defaultClientCreated = getLocalStorage('default_client_created') === 'true';
      const isAnon = hasUserIdentity || defaultClientCreated ? 'false' : 'true';

      if (getLocalStorage('is_anon') != isAnon) {
        resetKeys();
      }

      setLocalStorage('is_anon', isAnon);

      // 7. Map additional interface props
      Object.entries(restProps).forEach(([key, value]) => {
        const mappedKey = helloToChatbotPropsMap[key];
        if (!mappedKey) return;

        const finalValue = mappedKey === 'hideCloseButton' ? !value : value;
        dispatch(setDataInInterfaceRedux({ [mappedKey]: finalValue }));
      });

      // 8. Persist new widget token and config
      setLocalStorage('WidgetId', widgetToken);
      dispatch(setHelloConfig(event.data.data));
      return;
    }
    if(event?.data?.type == 'parent-route-changed' && event?.data?.data?.websiteUrl){
      addDomainToHello(event?.data?.data?.websiteUrl);
      return;
    }
    const receivedData: InterfaceData = event.data.data;
    if (Object.keys(receivedData || {}).length === 0) return;
    // Process thread-related data
    if (receivedData.threadId) {
      dispatch(setThreadId({ threadId: receivedData.threadId }));
      dispatch(setDataInAppInfoReducer({ threadId: receivedData.threadId }))
    }

    if (receivedData.helloId) {
      dispatch(setThreadId({ helloId: receivedData.helloId }));
    }

    if (receivedData.version_id === 'null' || receivedData.version_id) {
      dispatch(setThreadId({ version_id: receivedData.version_id }));
    }

    // Process bridge data
    if (receivedData.bridgeName) {
      dispatch(setDataInAppInfoReducer({ bridgeName: receivedData.bridgeName }))
      dispatch(setThreadId({ bridgeName: receivedData.bridgeName || "root" }));
      dispatch(
        addDefaultContext({
          variables: { ...receivedData.variables },
          bridgeName: receivedData.bridgeName,
        })
      );
    } else if (receivedData.variables) {
      dispatch(addDefaultContext({ variables: { ...receivedData.variables } }));
    }

    // Process vision config
    if (receivedData.vision) {
      dispatch(setConfig({ vision: receivedData.vision }));
    }

    // Process UI-related data
    if (Array.isArray(receivedData.headerButtons)) {
      dispatch(setHeaderActionButtons(receivedData.headerButtons));
    }

    if (Array.isArray(receivedData.eventsToSubscribe) && receivedData.eventsToSubscribe.length > 0) {
      const validEvents = receivedData.eventsToSubscribe.filter(
        (item) => Object.values(ALLOWED_EVENTS_TO_SUBSCRIBE).includes(item)
      );
      dispatch(setEventsSubsribedByParent(validEvents));
    }

    if (receivedData.modalConfig) {
      dispatch(setModalConfig(receivedData.modalConfig));
    }

    // Extract and process interface data properties
    const interfaceProperties = [
      'allowModalSwitch', 'hideCloseButton', 'chatTitle',
      'chatIcon', 'chatSubTitle', 'allowBridgeSwitch', 'hideFullScreenButton'
    ];

    const interfaceDataToUpdate = interfaceProperties.reduce((acc, prop) => {
      if (prop in receivedData) {
        acc[prop] = receivedData[prop];
      }
      return acc;
    }, {} as Record<string, any>);

    if (Object.keys(interfaceDataToUpdate).length > 0) {
      dispatch(setDataInInterfaceRedux(interfaceDataToUpdate));
    }
  }, [dispatch]);

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [handleMessage, chatbotId]);

  // Notify parent when interface is loaded
  useEffect(() => {
    setTimeout(() => {
      window?.parent?.postMessage({ type: "interfaceLoaded" }, "*");
    }, 0);
  }, []);

  return <Chatbot />
}

export default React.memo(
  addUrlDataHoc(React.memo(ChatbotWrapper), [ParamsEnums.chatbotId])
);