
import { setDataInAppInfoReducer } from "@/store/appInfo/appInfoSlice";
import { addDefaultContext, setDataInInterfaceRedux, setEventsSubsribedByParent, setHeaderActionButtons, setModalConfig, setThreadId } from "@/store/interface/interfaceSlice";
import { setConfig } from "next/config";
import { Dispatch, UnknownAction } from "redux";
import { registerEventHandler } from "../scriptEventRegistry";
import { InterfaceData } from "@/types/interface/InterfaceReduxType";

registerEventHandler('interfaceData', (event: MessageEvent, dispatch: Dispatch<UnknownAction>) => {
  const receivedData: InterfaceData = event.data.data;
  if (!receivedData || Object.keys(receivedData).length === 0) return;

  const {
    threadId,
    helloId,
    version_id,
    bridgeName,
    variables = {},
    vision,
    headerButtons,
    eventsToSubscribe = [],
    modalConfig,
  } = receivedData;

  // Thread-related data
  if (threadId) {
    dispatch(setThreadId({ threadId }));
    dispatch(setDataInAppInfoReducer({ threadId }));
  }

  if (helloId) {
    dispatch(setThreadId({ helloId }));
  }

  if ('version_id' in receivedData) {
    dispatch(setThreadId({ version_id }));
  }

  // Bridge data
  if (bridgeName) {
    dispatch(setDataInAppInfoReducer({ bridgeName }));
    dispatch(setThreadId({ bridgeName }));
    dispatch(
      addDefaultContext({
        variables: { ...variables },
        bridgeName,
      })
    );
  } else if (Object.keys(variables).length > 0) {
    dispatch(addDefaultContext({ variables: { ...variables } }));
  }

  // Vision config
  if (vision) {
    dispatch(setConfig({ vision }));
  }

  // UI-related data
  if (Array.isArray(headerButtons)) {
    dispatch(setHeaderActionButtons(headerButtons));
  }

  if (eventsToSubscribe.length > 0) {
    const validEvents = eventsToSubscribe.filter((item) =>
      Object.values(ALLOWED_EVENTS_TO_SUBSCRIBE).includes(item)
    );
    dispatch(setEventsSubsribedByParent(validEvents));
  }

  if (modalConfig) {
    dispatch(setModalConfig(modalConfig));
  }

  // Interface properties
  const interfaceProperties = [
    'allowModalSwitch',
    'hideCloseButton',
    'chatTitle',
    'chatIcon',
    'chatSubTitle',
    'allowBridgeSwitch',
    'hideFullScreenButton',
  ];

  const interfaceDataToUpdate = interfaceProperties.reduce<Record<string, any>>((acc, prop) => {
    if (prop in receivedData) {
      acc[prop] = (receivedData as any)[prop];
    }
    return acc;
  }, {});

  if (Object.keys(interfaceDataToUpdate).length > 0) {
    dispatch(setDataInInterfaceRedux(interfaceDataToUpdate));
  }
});
