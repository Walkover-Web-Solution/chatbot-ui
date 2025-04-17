'use client';
import InterfaceChatbot from "@/components/Interface-Chatbot/InterfaceChatbot";
import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";
import { setDataInAppInfoReducer } from "@/store/appInfo/appInfoSlice";
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
import React, { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import Chatbot from "../Chatbot/Chatbot";
import { HelloData } from "@/types/hello/HelloReduxType";
import { setHelloConfig } from "@/store/hello/helloSlice";

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

function ChatbotWrapper({ chatbotId }: ChatbotWrapperProps) {
  const dispatch = useDispatch();

  // Handle messages from parent window
  const handleMessage = useCallback((event: MessageEvent) => {
    if (event?.data?.type !== "interfaceData" && event?.data?.type !== "helloData") return;
    if (event?.data?.type === "helloData") {
      const receivedHelloData: HelloData = event.data.data;
      localStorage.setItem('WidgetId', receivedHelloData?.widgetToken)
      if(!localStorage.getItem('is_anon') )
        localStorage.setItem('is_anon',receivedHelloData?.unique_id ? 'false' : 'true')
      dispatch(setHelloConfig(receivedHelloData));
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

  // return <InterfaceChatbot />;
  return <Chatbot />
}

export default React.memo(
  addUrlDataHoc(React.memo(ChatbotWrapper), [ParamsEnums.chatbotId])
);