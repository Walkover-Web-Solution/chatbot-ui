'use client';
import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";
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
import { HelloData } from "@/types/hello/HelloReduxType";
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
  show_close_button: 'hideCloseButton',
  hideFullScreenButton: 'hideFullScreenButton'
}

function ChatbotWrapper({ chatbotId }: ChatbotWrapperProps) {
  const dispatch = useDispatch();

  // Handle messages from parent window
  const handleMessage = useCallback((event: MessageEvent) => {
    if (event?.data?.type !== "interfaceData" && event?.data?.type !== "helloData") return;
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
        ['a_clientId', 'k_clientId', 'userData', 'default_client_created'].forEach(key => setLocalStorage(key, ''));
        setLocalStorage('is_anon', hasUserIdentity ? 'false' : 'true');
      }
    
      // 2. User identity changed
      if (unique_id !== prevUser.unique_id) {
        resetKeys();
      }
    
      // 3. Update stored userData
      setLocalStorage('userData', JSON.stringify({ unique_id, mail, number, user_jwt_token, name }));
    
      // 4. Anonymous cleanup when no identity
      if (!hasUserIdentity && getLocalStorage('k_clientId')) {
        resetKeys();
        setLocalStorage('k_clientId', '');
      }
    
      // 5. Determine anonymity status
      const defaultClientCreated = getLocalStorage('default_client_created') === 'true';
      const isAnon = hasUserIdentity || defaultClientCreated ? 'false' : 'true';
      if (getLocalStorage('is_anon') !== isAnon) {
        resetKeys();
      }
      setLocalStorage('is_anon', isAnon);
    
      // 6. Hide widget form for identified users
      if (hasUserIdentity) {
        dispatch(setHelloKeysData({ showWidgetForm: false }));
      }
    
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