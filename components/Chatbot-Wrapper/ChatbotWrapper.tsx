'use client';
import InterfaceChatbot from "@/components/Interface-Chatbot/InterfaceChatbot";
import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";
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
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

function ChatbotWrapper({ chatbotId, loadInterface = true }) {
  const dispatch = useDispatch();

  useEffect(() => {
    window?.parent?.postMessage({ type: "interfaceLoaded" }, "*");
  }, []);

  useEffect(() => {

    const handleMessage = (event: MessageEvent) => {
      if (event?.data?.type === "interfaceData") {
        const receivedData = event?.data?.data;
        if (receivedData) {
          const {
            threadId = null,
            bridgeName = null,
            vision = null,
            helloId = null,
            version_id = null,
            headerButtons = [],
            eventsToSubscribe = [],
            modalConfig = {},
            allowModalSwitch = false,
            hideCloseButton = false,
            chatTitle = "",
            chatSubTitle="",
            chatIcon = "",
            allowBridgeSwitch = true
          } = receivedData;

          if (threadId) {
            dispatch(setThreadId({ threadId: threadId }));
          }
          if (helloId) {
            dispatch(setThreadId({ helloId: helloId }));
          }
          if (version_id === 'null' ||  version_id) {
            dispatch(setThreadId({ version_id: version_id }));
          }
          if (bridgeName) {
            dispatch(setThreadId({ bridgeName: bridgeName || "root" }));
            dispatch(
              addDefaultContext({
                variables: { ...receivedData?.variables },
                bridgeName: bridgeName,
              })
            );
          }
          if (vision) {
            dispatch(setConfig({ vision: vision }));
          } else {
            dispatch(
              addDefaultContext({ variables: { ...receivedData?.variables } })
            );
          }
          if (Array.isArray(headerButtons)) {
            dispatch(setHeaderActionButtons(headerButtons))
          }
          if (Array.isArray(eventsToSubscribe) && eventsToSubscribe?.length) {
            dispatch(setEventsSubsribedByParent(eventsToSubscribe?.filter((item) => Object.values(ALLOWED_EVENTS_TO_SUBSCRIBE)?.includes(item))))
          }
          if (modalConfig) {
            dispatch(setModalConfig(modalConfig))
          }
          dispatch(setDataInInterfaceRedux({ allowModalSwitch, hideCloseButton, chatTitle, chatIcon ,chatSubTitle,allowBridgeSwitch}))
        }
      }
    };

    if (loadInterface) {
      window.addEventListener("message", handleMessage);
    }
    return () => {
      if (loadInterface) {
        window.removeEventListener("message", handleMessage);
      }
    };
  }, [dispatch, chatbotId, loadInterface]);

  return <InterfaceChatbot />;
}

export default React.memo(
  addUrlDataHoc(React.memo(ChatbotWrapper), [ParamsEnums.chatbotId])
);