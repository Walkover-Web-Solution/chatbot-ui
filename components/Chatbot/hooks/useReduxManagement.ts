import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useChatContext } from './ChatContext';
import { ChatActionTypes } from './chatTypes';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import { $ReduxCoreType } from '@/types/reduxCore';
import { getHelloDetailsStart, setChannel } from '@/store/hello/helloSlice';
import { setThreads } from '@/store/interface/interfaceSlice';
import { GetSessionStorageData } from '@/utils/ChatbotUtility';
import { useMediaQuery, useTheme } from '@mui/material';
import { getAllThreadsApi } from '@/config/api';

export const useReduxStateManagement = (chatbotId: string) => {
  const reduxDispatch = useDispatch();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery('(max-width: 1024px)');
  
  const { 
    dispatch,
    threadId,
    bridgeName,
    helloId,
    subThreadId
  } = useChatContext();
  
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
    dispatch({ 
      type: ChatActionTypes.SET_THREAD_ID, 
      payload: storedThreadId || reduxThreadId 
    });
  }, [reduxThreadId, dispatch]);

  // Sync Redux subThreadId with local state
  useEffect(() => {
    dispatch({ 
      type: ChatActionTypes.SET_SUB_THREAD_ID, 
      payload: reduxSubThreadId 
    });
  }, [reduxSubThreadId, dispatch]);

  // Sync Redux bridgeName with local state
  useEffect(() => {
    const storedBridgeName = GetSessionStorageData("bridgeName");
    dispatch({ 
      type: ChatActionTypes.SET_BRIDGE_NAME, 
      payload: storedBridgeName || reduxBridgeName 
    });
  }, [reduxBridgeName, dispatch]);

  // Sync Redux headerButtons with local state
  useEffect(() => {
    const storedHeaderButtons = JSON.parse(GetSessionStorageData("headerButtons") || '[]');
    dispatch({ 
      type: ChatActionTypes.SET_HEADER_BUTTONS, 
      payload: storedHeaderButtons || reduxHeaderButtons 
    });
  }, [reduxHeaderButtons, dispatch]);

  // Sync Redux helloId with local state
  useEffect(() => {
    const storedHelloId = GetSessionStorageData("helloId");
    dispatch({ 
      type: ChatActionTypes.SET_HELLO_ID, 
      payload: storedHelloId || reduxHelloId 
    });
  }, [reduxHelloId, dispatch]);

  // Sync Redux bridgeVersionId with local state
  useEffect(() => {
    const storedVersionId = GetSessionStorageData("version_id");
    dispatch({ 
      type: ChatActionTypes.SET_BRIDGE_VERSION_ID, 
      payload: storedVersionId || reduxBridgeVersionId 
    });
  }, [reduxBridgeVersionId, dispatch]);

  // Sync large screen toggle with local state
  useEffect(() => {
    dispatch({
      type: ChatActionTypes.SET_TOGGLE_DRAWER,
      payload: !isLargeScreen
    });
  }, [isLargeScreen, dispatch]);

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
    reduxState: {
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
    },
    setChannel: (channelData: any) => reduxDispatch(setChannel({ Channel: channelData }))
  };
};