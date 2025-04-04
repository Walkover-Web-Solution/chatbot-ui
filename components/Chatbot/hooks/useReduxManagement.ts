import { getAllThreadsApi } from '@/config/api';
import { getHelloDetailsStart } from '@/store/hello/helloSlice';
import { setThreads } from '@/store/interface/interfaceSlice';
import { $ReduxCoreType } from '@/types/reduxCore';
import { GetSessionStorageData } from '@/utils/ChatbotUtility';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import { useMediaQuery, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ChatAction, ChatActionTypes, ChatState } from './chatTypes';

export const useReduxStateManagement = ({ chatbotId, chatDispatch, chatState }: { chatbotId: string, chatState: ChatState, chatDispatch: React.Dispatch<ChatAction> }) => {
  const reduxDispatch = useDispatch();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery('(max-width: 1024px)');
  const {
    threadId,
    bridgeName,
    helloId,
    subThreadId
  } = chatState;

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
    selectedAiServiceAndModal
  } = useCustomSelector((state: $ReduxCoreType) => ({
    interfaceContextData:
      state.Interface?.interfaceContext?.[chatbotId]?.variables,
    reduxThreadId: state.Interface?.threadId || "",
    reduxSubThreadId: state.Interface?.subThreadId || "",
    reduxHeaderButtons: state.Interface?.headerButtons || [],
    reduxBridgeName: state.Interface?.bridgeName || "root",
    reduxHelloId: state.Interface?.helloId || null,
    reduxBridgeVersionId: state.Interface?.version_id || null,
    IsHuman: state.Hello?.isHuman || false,
    uuid: state.Hello?.ChannelList?.uuid,
    unique_id: state.Hello?.ChannelList?.unique_id,
    presence_channel: state.Hello?.ChannelList?.presence_channel,
    team_id: state.Hello?.widgetInfo?.team?.[0]?.id,
    chat_id: state.Hello?.Channel?.id,
    channelId: state.Hello?.Channel?.channel || null,
    mode: state.Hello?.mode || [],
    selectedAiServiceAndModal: state.Interface?.selectedAiServiceAndModal || null
  }));

  // Sync Redux threadId with local state
  useEffect(() => {
    const storedThreadId = GetSessionStorageData("threadId");
    chatDispatch({
      type: ChatActionTypes.SET_THREAD_ID,
      payload: storedThreadId || reduxThreadId
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
    const storedBridgeName = GetSessionStorageData("bridgeName");
    chatDispatch({
      type: ChatActionTypes.SET_BRIDGE_NAME,
      payload: storedBridgeName || reduxBridgeName
    });
  }, [reduxBridgeName, chatDispatch]);

  // Sync Redux headerButtons with local state
  useEffect(() => {
    const storedHeaderButtons = JSON.parse(GetSessionStorageData("headerButtons") || '[]');
    chatDispatch({
      type: ChatActionTypes.SET_HEADER_BUTTONS,
      payload: storedHeaderButtons || reduxHeaderButtons
    });
  }, [reduxHeaderButtons, chatDispatch]);

  // Sync Redux helloId with local state
  useEffect(() => {
    const storedHelloId = GetSessionStorageData("helloId");
    chatDispatch({
      type: ChatActionTypes.SET_HELLO_ID,
      payload: storedHelloId || reduxHelloId
    });
  }, [reduxHelloId, chatDispatch]);

  // Sync Redux bridgeVersionId with local state
  useEffect(() => {
    const storedVersionId = GetSessionStorageData("version_id");
    chatDispatch({
      type: ChatActionTypes.SET_BRIDGE_VERSION_ID,
      payload: storedVersionId || reduxBridgeVersionId
    });
  }, [reduxBridgeVersionId, chatDispatch]);

  // Sync large screen toggle with local state
  useEffect(() => {
    chatDispatch({
      type: ChatActionTypes.SET_TOGGLE_DRAWER,
      payload: !isLargeScreen
    });
  }, [isLargeScreen, chatDispatch]);

  // Subscribe to Hello Channel
  const subscribeToChannel = () => {
    if (bridgeName && threadId) {
      reduxDispatch(
        getHelloDetailsStart({
          slugName: bridgeName,
          threadId: threadId,
          helloId: helloId || null,
          versionId: reduxBridgeVersionId || null,
        })
      );
    }
  };

  // Fetch all threads
  const fetchAllThreads = async () => {
    try {
      const result = await getAllThreadsApi({ threadId });
      if (result?.success) {
        reduxDispatch(
          setThreads({ bridgeName, threadId, threadList: result?.threads })
        );
      }
    } catch (error) {
      console.warn("Error fetching all threads:", error);
    }
  };

  // Subscribe to channel on bridge or thread change
  useEffect(() => {
    subscribeToChannel();
  }, [bridgeName, threadId, helloId]);

  // Fetch all threads on thread or bridge change
  useEffect(() => {
    fetchAllThreads();
  }, [threadId, bridgeName]);

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
    theme
  };
};