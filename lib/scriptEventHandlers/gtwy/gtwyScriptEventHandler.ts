
import { setDataInAppInfoReducer } from "@/store/appInfo/appInfoSlice";
import { addDefaultContext, setDataInInterfaceRedux, setEventsSubsribedByParent, setHeaderActionButtons, setModalConfig } from "@/store/interface/interfaceSlice";
import { InterfaceData } from "@/types/interface/InterfaceReduxType";
import { Dispatch, UnknownAction } from "redux";
import { registerEventHandler } from "../scriptEventRegistry";

registerEventHandler('interfaceData', (event: MessageEvent, dispatch: Dispatch<UnknownAction>, handleThemeChange: (theme: string) => void, currentThreadId: string) => {
  const receivedData: InterfaceData = event.data.data;
  if (!receivedData || Object.keys(receivedData).length === 0) return;
  
  // Process thread-related data
  if (receivedData.threadId) {
    dispatch(setDataInAppInfoReducer({ threadId: receivedData.threadId }))
    if (receivedData?.threadId !== currentThreadId) {
      dispatch(setDataInAppInfoReducer({ subThreadId: '' }))
    }
  }

  if (receivedData.helloId) {
    dispatch(setDataInAppInfoReducer({ helloId: receivedData.helloId }))
  }

  if (receivedData.version_id === 'null' || receivedData.version_id) {
    dispatch(setDataInAppInfoReducer({ versionId: receivedData.version_id }))
  }

  // Process bridge data
  if (receivedData.bridgeName) {
    dispatch(setDataInAppInfoReducer({ bridgeName: receivedData.bridgeName }))
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
    dispatch(setDataInAppInfoReducer({ isVision: receivedData.vision }))
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
});
