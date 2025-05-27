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

function isDefaultNavigateToChatScreenFn(state: $ReduxCoreType, chatSessionId: string) {
  const teams = state.Hello?.[chatSessionId]?.widgetInfo?.teams || [];
  const channels = state.Hello?.[chatSessionId]?.channelListData?.channels || [];
  return teams && teams.length <= 1 && channels?.length <= 1 && !channels?.[0]?.id;
}

export const useReduxStateManagement = ({ 
  chatDispatch, 
  chatSessionId 
}: { 
  chatDispatch: React.Dispatch<ChatAction>; 
  chatSessionId: string;
}) => {
  // FIXED: Always call hooks at the top level, in the same order
  const theme = useTheme();
  const isLargeScreen = useMediaQuery('(max-width: 1024px)');
  const isSmallScreen = useMediaQuery('(max-width: 1023px)');

  // Get Redux state
  const {
    reduxThreadId,
    reduxSubThreadId,
    reduxBridgeName,
    reduxHelloId,
    reduxBridgeVersionId,
    reduxHeaderButtons,
    interfaceContextData,
    isHelloUser,
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
    isDefaultNavigateToChatScreen
  } = useCustomSelector((state: $ReduxCoreType) => ({
    interfaceContextData: state.Interface?.[chatSessionId]?.interfaceContext?.variables,
    reduxThreadId: state.appInfo?.[chatSessionId]?.threadId || "",
    reduxSubThreadId: state.appInfo?.[chatSessionId]?.subThreadId || "",
    reduxHeaderButtons: state.Interface?.[chatSessionId]?.headerButtons || [],
    reduxBridgeName: state.appInfo?.[chatSessionId]?.bridgeName || "root",
    reduxHelloId: state.Interface?.[chatSessionId]?.helloId || null,
    reduxBridgeVersionId: state.Interface?.[chatSessionId]?.version_id || null,
    isHelloUser: state.Hello?.[chatSessionId]?.isHelloUser || false,
    uuid: state.Hello?.[chatSessionId]?.channelListData?.uuid,
    unique_id: state.Hello?.[chatSessionId]?.channelListData?.unique_id,
    presence_channel: state.Hello?.[chatSessionId]?.channelListData?.presence_channel,
    team_id: state.Hello?.[chatSessionId]?.widgetInfo?.team?.[0]?.id,
    isDefaultNavigateToChatScreen: isDefaultNavigateToChatScreenFn(state, chatSessionId),
    chat_id: state.Hello?.[chatSessionId]?.Channel?.id,
    channelId: state.Hello?.[chatSessionId]?.Channel?.channel || null,
    mode: state.Hello?.[chatSessionId]?.mode || [],
    selectedAiServiceAndModal: state.Interface?.[chatSessionId]?.selectedAiServiceAndModal || null,
    unique_id_hello: state?.Hello?.[chatSessionId]?.helloConfig?.unique_id,
    widgetToken: state?.Hello?.[chatSessionId]?.helloConfig?.widgetToken,
    currentChatId: state.Hello?.[chatSessionId]?.currentChatId,
    currentChannelId: state.Hello?.[chatSessionId]?.currentChannelId,
    currentTeamId: state.Hello?.[chatSessionId]?.currentTeamId,
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

  // Sync isHelloUser with local state
  useEffect(() => {
    chatDispatch({
      type: ChatActionTypes.SET_DATA,
      payload: {
        isHelloUser: isHelloUser
      }
    });
  }, [isHelloUser, chatDispatch]);

  // Sync large screen toggle with local state
  useEffect(() => {
    chatDispatch({
      type: ChatActionTypes.SET_TOGGLE_DRAWER,
      payload: !isLargeScreen
    });
  }, [isLargeScreen, chatDispatch]);

  return {
    interfaceContextData,
    isHelloUser,
    uuid,
    unique_id,
    presence_channel,
    team_id,
    isDefaultNavigateToChatScreen,
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