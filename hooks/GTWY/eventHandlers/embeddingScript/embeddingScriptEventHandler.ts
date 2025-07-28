import { EmbeddingScriptEventRegistryInstance } from "@/hooks/CORE/eventHandlers/embeddingScript/embeddingScriptEventHandler";
import { setDataInAppInfoReducer } from "@/store/appInfo/appInfoSlice";
import { addDefaultContext, setDataInInterfaceRedux, setEventsSubsribedByParent, setHeaderActionButtons, setModalConfig } from "@/store/interface/interfaceSlice";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { ALLOWED_EVENTS_TO_SUBSCRIBE } from "@/utils/enums";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

interface InterfaceData {
  threadId?: string | null;
  bridgeName?: string | null;
  helloId?: string | null;
  versionId?: string | null;
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
  modelChanged?: string;
  serviceChanged?: string;
}

const useHandleGtwyEmbeddingScriptEvents = (eventHandler: EmbeddingScriptEventRegistryInstance) => {

  const dispatch = useDispatch()
  const tabSessionId = eventHandler.getTabSessionId()
  const { currentThreadId } = useCustomSelector((state) => ({
    currentThreadId: state.appInfo?.[tabSessionId]?.threadId
  }));

  const handleInterfaceData = (event: MessageEvent) => {

    const receivedData: InterfaceData = event.data.data;
    if (Object.keys(receivedData || {}).length === 0) return;
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

    // Process gtwy model change
    if(receivedData.modelChanged){
      dispatch(setDataInAppInfoReducer({ modelChanged: receivedData.modelChanged }))
    }

    // Process gtwy service change
    if(receivedData.serviceChanged){
      dispatch(setDataInAppInfoReducer({ serviceChanged: receivedData.serviceChanged }))
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
    // Separate hideCloseButton and hideFullScreenButton from other interface properties
    const standardInterfaceProperties = [
      'allowModalSwitch', 'chatTitle',
      'chatIcon', 'chatSubTitle', 'allowBridgeSwitch'
    ];

    // Process standard interface properties
    const interfaceDataToUpdate = standardInterfaceProperties.reduce((acc, prop) => {
      if (prop in receivedData) {
        acc[prop] = receivedData[prop];
      }
      return acc;
    }, {} as Record<string, any>);

    // Dispatch standard interface properties if any exist
    if (Object.keys(interfaceDataToUpdate).length > 0) {
      dispatch(setDataInInterfaceRedux(interfaceDataToUpdate));
    }

    // Handle hideCloseButton and hideFullScreenButton separately
    if ('hideCloseButton' in receivedData) {
      dispatch(setDataInAppInfoReducer({ hideCloseButton: receivedData.hideCloseButton }));
    }

    if ('hideFullScreenButton' in receivedData) {
      dispatch(setDataInAppInfoReducer({ hideFullScreenButton: receivedData.hideFullScreenButton }));
    }
  }

  useEffect(() => {
    eventHandler.addEventHandler('interfaceData', handleInterfaceData)
  }, [])

  return null
}

export default useHandleGtwyEmbeddingScriptEvents;