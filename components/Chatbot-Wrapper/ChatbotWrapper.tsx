'use client';
import { addDomainToHello, saveClientDetails } from "@/config/helloApi";
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
import { setDataInTabInfo } from "@/store/tabInfo/tabInfoSlice";
import { $ReduxCoreType } from "@/types/reduxCore";
import { GetSessionStorageData, SetSessionStorage } from "@/utils/ChatbotUtility";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { ALLOWED_EVENTS_TO_SUBSCRIBE } from "@/utils/enums";
import { getLocalStorage, setLocalStorage } from "@/utils/utilities";
import isPlainObject from "lodash.isplainobject";
import React, { useCallback, useContext, useEffect } from "react";
import { useDispatch } from "react-redux";
import { ThemeContext } from "../AppWrapper";
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
  chatSessionId?: string;
}

const helloToChatbotPropsMap: Record<string, string> = {
  // show_close_button: 'hideCloseButton',
  hideFullScreenButton: 'hideFullScreenButton'
}

function ChatbotWrapper({ chatSessionId }: ChatbotWrapperProps) {
  const dispatch = useDispatch();
  const { handleThemeChange } = useContext(ThemeContext)
  const { reduxChatSessionId } = useCustomSelector((state: $ReduxCoreType) => ({
    reduxChatSessionId: state.tabInfo?.widgetToken || state?.tabInfo?.chatbotId || '',
  }));
  // Handle messages from parent window
  const handleMessage = useCallback((event: MessageEvent) => {
    const allowedEvents = ["interfaceData", "helloData", "parent-route-changed", "ADD_COBROWSE_SCRIPT", "ADD_USER_EVENT_SEGMENTO", "UPDATE_USER_DATA_SEGMENTO"];
    if (!allowedEvents.includes(event?.data?.type)) return;

    if (event?.data?.type === 'ADD_COBROWSE_SCRIPT') {
      CBManger.injectScript(event?.data?.data?.origin)
    }

    // User Event Storing
    if (event?.data?.type === 'ADD_USER_EVENT_SEGMENTO' && event?.data?.data && isPlainObject(event?.data?.data)) {
      addDomainToHello({ userEvent: event?.data?.data })
      return
    }

    // UPDATE USER INFO ON SEGMENTO
    if (event?.data?.type === 'UPDATE_USER_DATA_SEGMENTO' && event?.data?.data && isPlainObject(event?.data?.data)) {
      saveClientDetails(event?.data?.data)
      return
    }

    // Domain Tracking
    if (event?.data?.type == 'parent-route-changed' && event?.data?.data?.websiteUrl) {
      addDomainToHello({ domain: event?.data?.data?.websiteUrl });
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
        sdkConfig,
        ...restProps
      } = event.data.data;

      if (sdkConfig?.customTheme) {
        handleThemeChange(sdkConfig?.customTheme)
      }

      const fullWidgetToken = unique_id ? `${widgetToken}_${unique_id}` : `${widgetToken}`;
      const prevWidgetId = GetSessionStorageData('widgetToken');
      const prevUser = JSON.parse(getLocalStorage('userData') || '{}');
      SetSessionStorage('widgetToken', fullWidgetToken)
      const hasUserIdentity = Boolean(unique_id || mail || number);

      // Helper: reset Redux keys and sub-thread
      const resetKeys = () => {
        dispatch(setDataInAppInfoReducer({ subThreadId: '', currentChannelId: '', currentChatId: '', currentTeamId: '' }));
      };

      // 1. Widget token changed
      if (unique_id ? `${widgetToken}_${unique_id}` !== prevWidgetId : widgetToken !== prevWidgetId) {
        resetKeys();
        // ['a_clientId', 'k_clientId', 'userData', 'client', 'default_client_created'].forEach(key => setLocalStorage(key, ''));
        // setLocalStorage('is_anon', hasUserIdentity ? 'false' : 'true');
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
      const isAnon = hasUserIdentity ? 'false' : getLocalStorage('is_anon') === 'false' ? 'false' : 'true';

      console.log(getLocalStorage('is_anon'), 123123)
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
      SetSessionStorage('helloConfig', JSON.stringify(event.data.data))
      dispatch(setDataInTabInfo({ widgetToken: fullWidgetToken }));
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

    if (Object.keys(interfaceDataToUpdate || {}).length > 0) {
      dispatch(setDataInInterfaceRedux(interfaceDataToUpdate));
    }
  }, [dispatch]);

  const handleStorageUpdate = (e: CustomEvent<{ key: string, value: string | boolean }>) => {
    if (e.detail.key === 'k_clientId' || e.detail.key === 'a_clientId') {
      dispatch(setHelloKeysData({ [e.detail.key]: e.detail.value }))
    }
    if (e.detail.key === 'is_anon') {
      dispatch(setHelloKeysData({ is_anon: e.detail.value }));
    }
  };

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    window.addEventListener("localstorage-updated", handleStorageUpdate);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("localstorage-updated", handleStorageUpdate);

    };
  }, [handleMessage, chatSessionId]);

  // Notify parent when interface is loaded
  useEffect(() => {
    setTimeout(() => {
      window?.parent?.postMessage({ type: "interfaceLoaded" }, "*");
    }, 0);
  }, []);

  if (!reduxChatSessionId) {
    return null
  }

  return <Chatbot />
}

export default React.memo(
  addUrlDataHoc(React.memo(ChatbotWrapper))
);