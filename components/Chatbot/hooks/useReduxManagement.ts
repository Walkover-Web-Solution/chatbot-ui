import { setBridgeName, setBridgeVersionId, setData, setHeaderButtons, setHelloId, setSubThreadId, setThreadId, setToggleDrawer } from '@/store/chat/chatSlice';
import { useAppDispatch } from '@/store/useTypedHooks';
import { $ReduxCoreType } from '@/types/reduxCore';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import { useMediaQuery, useTheme } from '@mui/material';
import { useEffect } from 'react';

function isDefaultNavigateToChatScreenFn(state: $ReduxCoreType, chatSessionId: string) {
  const teams = state.Hello?.[chatSessionId]?.widgetInfo?.teams || [];
  const channels = state.Hello?.[chatSessionId]?.channelListData?.channels || [];
  return teams && teams.length <= 1 && channels?.length <= 1 && !channels?.[0]?.id;
}

export const useReduxStateManagement = ({
  chatSessionId,
  tabSessionId
}: {
  chatSessionId: string;
  tabSessionId: string;
}) => {
  // FIXED: Always call hooks at the top level, in the same order
  const dispatch = useAppDispatch();
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
  } = useCustomSelector((state) => ({
    interfaceContextData: state.Interface?.[chatSessionId]?.interfaceContext?.variables,
    reduxThreadId: state.appInfo?.[tabSessionId]?.threadId || "",
    reduxSubThreadId: state.appInfo?.[tabSessionId]?.subThreadId || "",
    reduxHeaderButtons: state.Interface?.[chatSessionId]?.headerButtons || [],
    reduxBridgeName: state.appInfo?.[tabSessionId]?.bridgeName || "root",
    reduxHelloId: state.appInfo?.[tabSessionId]?.helloId || null,
    reduxBridgeVersionId: state.appInfo?.[tabSessionId]?.versionId || null,
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
    currentChatId: state?.appInfo?.[tabSessionId]?.currentChatId,
    currentChannelId: state?.appInfo?.[tabSessionId]?.currentChannelId,
    currentTeamId: state?.appInfo?.[tabSessionId]?.currentTeamId,
  }));

  // Sync Redux threadId with local state
  useEffect(() => {
    dispatch(setThreadId(reduxThreadId));
  }, [reduxThreadId, dispatch]);

  // Sync Redux subThreadId with local state
  useEffect(() => {
    dispatch(setSubThreadId(reduxSubThreadId));
  }, [reduxSubThreadId, dispatch]);

  // Sync Redux bridgeName with local state
  useEffect(() => {
    dispatch(setBridgeName(reduxBridgeName));
  }, [reduxBridgeName, dispatch]);

  // Sync Redux headerButtons with local state
  useEffect(() => {
    dispatch(setHeaderButtons(reduxHeaderButtons));
  }, [reduxHeaderButtons, dispatch]);

  // Sync Redux helloId with local state
  useEffect(() => {
    dispatch(setHelloId(reduxHelloId));
  }, [reduxHelloId, dispatch]);

  // Sync Redux bridgeVersionId with local state
  useEffect(() => {
    dispatch(setBridgeVersionId(reduxBridgeVersionId));
  }, [reduxBridgeVersionId, dispatch]);

  // Sync isHelloUser with local state
  useEffect(() => {
    dispatch(setData({ isHelloUser }))
  }, [isHelloUser, dispatch]);

  // Sync large screen toggle with local state
  useEffect(() => {
    dispatch(setToggleDrawer(!isLargeScreen));
  }, [isLargeScreen, dispatch]);

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
    unique_id_hello,
    widgetToken,
    currentChatId,
    currentChannelId,
    currentTeamId,
    isSmallScreen
  };
};