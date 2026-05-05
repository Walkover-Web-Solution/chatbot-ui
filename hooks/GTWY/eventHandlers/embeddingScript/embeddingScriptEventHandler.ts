import { ThemeContext } from "@/components/AppWrapper";
import { EmbeddingScriptEventRegistryInstance } from "@/hooks/CORE/eventHandlers/embeddingScript/embeddingScriptEventHandler";
import { setDataInAppInfoReducer } from "@/store/appInfo/appInfoSlice";
import { addDefaultContext, setDataInInterfaceRedux, setEventsSubsribedByParent, setHeaderActionButtons, setModalConfig } from "@/store/interface/interfaceSlice";
import { ALLOWED_EVENTS_TO_SUBSCRIBE } from "@/utils/enums";
import { SetSessionStorage } from "@/utils/ChatbotUtility";
import { useContext, useEffect } from "react";
import { useDispatch, useStore } from "react-redux";
import { useCustomSelector } from "@/utils/deepCheckSelector";

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
  stream?: string;
  theme?: "light" | "dark" | "system";
}

const useHandleGtwyEmbeddingScriptEvents = (eventHandler: EmbeddingScriptEventRegistryInstance) => {
  const dispatch = useDispatch();
  const store = useStore();
  const { handleColorSchemeChange } = useContext(ThemeContext);
  const tabSessionId = useCustomSelector((state) => `${state.draftData.chatSessionId}_${state.draftData.tabSessionId}`);

  const handleInterfaceData = (event: MessageEvent) => {

    const receivedData: InterfaceData = event.data.data;
    if (Object.keys(receivedData || {}).length === 0) return;

    // If theme attribute is present → store in session and apply
    // If theme attribute is absent → clear session so config/system theme takes over
    if ('theme' in receivedData) {
      if (receivedData.theme === "light" || receivedData.theme === "dark" || receivedData.theme === "system") {
        SetSessionStorage('chatbotTheme', receivedData.theme);
        handleColorSchemeChange(receivedData.theme);
      }
    } else {
      sessionStorage.removeItem('chatbotTheme');
    }

    // Process thread-related data
    if (receivedData.threadId) {
      dispatch(setDataInAppInfoReducer({ threadId: receivedData.threadId }))
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
    if (receivedData.modelChanged) {
      dispatch(setDataInAppInfoReducer({ modelChanged: receivedData.modelChanged }))
    }

    //process stream change
    if (receivedData?.stream !== undefined) {
      dispatch(setDataInAppInfoReducer({ stream: receivedData?.stream }))
    }
    
    //process image_model change
    if (receivedData?.image_model !== undefined) {
      dispatch(setDataInAppInfoReducer({ image_model: receivedData?.image_model }))
    }
    //process widget change
    if (receivedData?.widget !== undefined) {
      dispatch(setDataInAppInfoReducer({ widget: receivedData?.widget }))
    }

    //process mode (enables/disables Fast vs Planning dropdown)
    if (receivedData?.mode !== undefined) {
      const modeValue = receivedData?.mode;
      const normalizedMode = modeValue === true || modeValue === "true";
      const existingConfig = (store.getState() as any)?.appInfo?.[tabSessionId]?.config || {};
      dispatch(setDataInAppInfoReducer({
        mode: normalizedMode,
        config: { ...existingConfig, mode: normalizedMode },
      }))
    }

    // Process gtwy service change
    if (receivedData.serviceChanged) {
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
