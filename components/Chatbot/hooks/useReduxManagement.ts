import { $ReduxCoreType } from '@/types/reduxCore';
import { GetSessionStorageData } from '@/utils/ChatbotUtility';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import { useMediaQuery, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { ChatAction, ChatActionTypes } from './chatTypes';

// Helper to get storage with fallback
const getStoredValueOrDefault = (key: string, defaultValue: any, isJson = false) => {
  const storedValue = GetSessionStorageData(key);
  if (!storedValue) return defaultValue;
  return isJson ? JSON.parse(storedValue) : storedValue;
};

export const useReduxStateManagement = ({ chatbotId, chatDispatch }: { chatbotId: string, chatDispatch: React.Dispatch<ChatAction> }) => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery('(max-width: 1024px)');
  const isSmallScreen = useMediaQuery('(max-width:1023px)');

  // Get Redux state
  const {
    reduxThreadId,
    reduxSubThreadId,
    reduxBridgeName,
    reduxHelloId,
    reduxBridgeVersionId,
    reduxHeaderButtons,
    interfaceContextData,
    IsHuman,
    uuid,
    unique_id,
    presence_channel,
    team_id,
    chat_id,
    channelId,
    mode,
    selectedAiServiceAndModal,
    unique_id_hello,
    widgetToken,
    currentChatId,
    currentChannelId,
    currentTeamId,
  } = useCustomSelector((state: $ReduxCoreType) => ({
    interfaceContextData: state.Interface?.interfaceContext?.[chatbotId]?.variables,
    reduxThreadId: state.appInfo?.threadId || "",
    reduxSubThreadId: state.appInfo?.subThreadId || "",
    reduxHeaderButtons: state.Interface?.headerButtons || [],
    reduxBridgeName: state.appInfo?.bridgeName || "root",
    reduxHelloId: state.Interface?.helloId || null,
    reduxBridgeVersionId: state.Interface?.version_id || null,
    IsHuman: state.Hello?.isHuman || false,
    uuid: state.Hello?.channelListData?.uuid,
    unique_id: state.Hello?.channelListData?.unique_id,
    presence_channel: state.Hello?.channelListData?.presence_channel,
    team_id: state.Hello?.widgetInfo?.team?.[0]?.id,
    chat_id: state.Hello?.Channel?.id,
    channelId: state.Hello?.Channel?.channel || null,
    mode: state.Hello?.mode || [],
    selectedAiServiceAndModal: state.Interface?.selectedAiServiceAndModal || null,
    unique_id_hello: state?.Hello?.helloConfig?.unique_id,
    widgetToken: state?.Hello?.helloConfig?.widgetToken,
    currentChatId: state.Hello?.currentChatId,
    currentChannelId: state.Hello?.currentChannelId,
    currentTeamId: state.Hello?.currentTeamId,
  }));

  // Sync Redux threadId with local state
  useEffect(() => {
    chatDispatch({
      type: ChatActionTypes.SET_THREAD_ID,
      payload: getStoredValueOrDefault("threadId", reduxThreadId)
    });
  }, [reduxThreadId, chatDispatch]);

  // Sync Redux subThreadId with local state
  useEffect(() => {
    chatDispatch({
      type: ChatActionTypes.SET_SUB_THREAD_ID,
      payload: reduxSubThreadId
    });
  }, [reduxSubThreadId, chatDispatch]);

  // Sync Redux bridgeName with local state
  useEffect(() => {
    chatDispatch({
      type: ChatActionTypes.SET_BRIDGE_NAME,
      payload: getStoredValueOrDefault("bridgeName", reduxBridgeName)
    });
  }, [reduxBridgeName, chatDispatch]);

  // Sync Redux headerButtons with local state
  useEffect(() => {
    chatDispatch({
      type: ChatActionTypes.SET_HEADER_BUTTONS,
      payload: getStoredValueOrDefault("headerButtons", reduxHeaderButtons, true)
    });
  }, [reduxHeaderButtons, chatDispatch]);

  // Sync Redux helloId with local state
  useEffect(() => {
    chatDispatch({
      type: ChatActionTypes.SET_HELLO_ID,
      payload: getStoredValueOrDefault("helloId", reduxHelloId)
    });
  }, [reduxHelloId, chatDispatch]);

  // Sync Redux bridgeVersionId with local state
  useEffect(() => {
    chatDispatch({
      type: ChatActionTypes.SET_BRIDGE_VERSION_ID,
      payload: getStoredValueOrDefault("version_id", reduxBridgeVersionId)
    });
  }, [reduxBridgeVersionId, chatDispatch]);

  // Sync IsHuman with local state
  useEffect(() => {
    chatDispatch({
      type: ChatActionTypes.SET_DATA,
      payload: {
        isHelloUser: IsHuman
      }
    });
  }, [IsHuman, chatDispatch]);

  // Sync large screen toggle with local state
  useEffect(() => {
    chatDispatch({
      type: ChatActionTypes.SET_TOGGLE_DRAWER,
      payload: !isLargeScreen
    });
  }, [isLargeScreen, chatDispatch]);

  return {
    interfaceContextData,
    IsHuman,
    uuid,
    unique_id,
    presence_channel,
    team_id,
    chat_id,
    channelId,
    mode,
    selectedAiServiceAndModal,
    theme,
    unique_id_hello,
    widgetToken,
    currentChatId,
    currentChannelId,
    currentTeamId,
    isSmallScreen
  };
};