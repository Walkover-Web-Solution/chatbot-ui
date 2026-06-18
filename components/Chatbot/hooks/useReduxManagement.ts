import { useCustomSelector } from '@/utils/deepCheckSelector';

export const useReduxStateManagement = ({
  chatSessionId,
  tabSessionId
}: {
  chatSessionId: string;
  tabSessionId: string;
}) => {

  // Get Redux state
  const {
    interfaceContextData,
    selectedAiServiceAndModal,
    currentChatId,
    currentChannelId,
    currentTeamId,
  } = useCustomSelector((state) => ({
    interfaceContextData: state.Interface?.[`${chatSessionId}_${tabSessionId}`]?.interfaceContext?.variables,
    selectedAiServiceAndModal: state.Interface?.[`${chatSessionId}_${tabSessionId}`]?.selectedAiServiceAndModal || null,
    currentChatId: state?.appInfo?.[tabSessionId]?.currentChatId,
    currentChannelId: state?.appInfo?.[tabSessionId]?.currentChannelId,
    currentTeamId: state?.appInfo?.[tabSessionId]?.currentTeamId,
  }));

  return {
    interfaceContextData,
    selectedAiServiceAndModal,
    currentChatId,
    currentChannelId,
    currentTeamId
  };
};