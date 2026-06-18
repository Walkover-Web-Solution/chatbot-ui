import { LinearProgress } from '@mui/material';
import Image from 'next/image';
import React, { useEffect, useMemo, useRef } from 'react';

// Context and hooks
import { MessageContext } from '../Interface-Chatbot/InterfaceChatbot';
import { useReduxStateManagement } from './hooks/useReduxManagement';
import useRtlayerEventManager from './hooks/useRtlayerEventManager';

// Components
import ChatbotDrawer from '../Interface-Chatbot/ChatbotDrawer';
import ChatbotHeader from '../Interface-Chatbot/ChatbotHeader';
import ChatbotHeaderTab from '../Interface-Chatbot/ChatbotHeaderTab';
import ChatbotTextField from '../Interface-Chatbot/ChatbotTextField';
import MessageList from '../Interface-Chatbot/Messages/MessageList';
import StarterQuestions from '../Interface-Chatbot/Messages/StarterQuestions';

// Utils
import { ChatBotGif } from '@/assests/assestsIndex';
import { addUrlDataHoc } from '@/hoc/addUrlDataHoc';
import { setToggleDrawer } from '@/store/chat/chatSlice';
import { useAppDispatch } from '@/store/useTypedHooks';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import { useChatEffects } from './hooks/useChatEffects';
import { useColor } from './hooks/useColor';
import { useReduxEffects } from './hooks/useReduxEffects';
import { useScreenSize } from './hooks/useScreenSize';

/**
 * A component that displays a chatbot interface.
 * It includes a header, drawer, and message list.
 */

interface ChatbotProps {
  chatSessionId: string
  tabSessionId: string
}

// Memoized components
const EmptyChatView = React.memo(({ defaultMessage }: { defaultMessage?: string }) => (
  <div className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto mt-[-84px] p-5" data-testid="chatbot-empty-view">
    <div className="flex flex-col items-center w-full">
      <Image
        src={ChatBotGif}
        alt="Chatbot"
        className="block"
        width={100}
        height={100}
        priority
        data-testid="chatbot-empty-gif"
      />
      <h2 className="text-xl font-bold text-base-content" data-testid="chatbot-empty-title">
        {defaultMessage || "What can I help with?"}
      </h2>
    </div>
    <div className="max-w-5xl w-full mt-8">
      <ChatbotTextField />
    </div>
    <StarterQuestions />
  </div>
));

const ActiveChatView = React.memo(() => (
  <div className="flex flex-col h-full overflow-auto" style={{ height: '100vh' }} data-testid="chatbot-active-view">
    <div className="flex-1 overflow-y-auto max-w-5xl mx-auto w-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent" data-testid="chatbot-messages-container">
      <MessageList />
    </div>
    <div className="max-w-5xl mx-auto p-3 pb-3 w-full" data-testid="chatbot-input-section">
      <ChatbotTextField />
    </div>
  </div>
));


function Chatbot({ chatSessionId, tabSessionId }: ChatbotProps) {
  // Refs
  const mountedRef = useRef<boolean>(false);
  const messageRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const { backgroundColor } = useColor();
  const { isSmallScreen } = useScreenSize();
  const dispatch = useAppDispatch();

  // State management
  const { isToggledrawer, chatsLoading, messageIds, subThreadId, defaultMessage } = useCustomSelector((state) => {
    return ({
      isToggledrawer: state.Chat.isToggledrawer,
      chatsLoading: state.Chat.chatsLoading,
      messageIds: state.Chat.messageIds,
      subThreadId: state.Chat.subThreadId,
      defaultMessage: state.appInfo?.[tabSessionId]?.defaultMessage
    })
  });

  // Custom hooks
  useChatEffects({ chatSessionId, tabSessionId, messageRef, timeoutIdRef });
  useReduxEffects({ chatSessionId, tabSessionId });
  useRtlayerEventManager({ timeoutIdRef, chatSessionId, tabSessionId });

  const { currentChatId, isDefaultNavigateToChatScreen } = useReduxStateManagement({ chatSessionId, tabSessionId });

  // Initialize RTLayer event listeners

  // Effect to open drawer for new human users
  useEffect(() => {
    if (!currentChatId && !mountedRef.current) {
      dispatch(setToggleDrawer(true));
    }
    mountedRef.current = true;
  }, [currentChatId, dispatch]);

  // open Chat directly if no team or one team exista
  useEffect(() => {
    if (isDefaultNavigateToChatScreen) {
      dispatch(setToggleDrawer(false));
      if (messageRef.current) {
        messageRef.current.focus();
      }
    }
  }, [isDefaultNavigateToChatScreen])

  // Context value - memoized to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    messageRef,
    timeoutIdRef
  }), [
    messageRef,
    timeoutIdRef
  ]);

  // Check if chat is empty
  const isChatEmpty = !subThreadId || messageIds[subThreadId]?.length === 0;

  return (
    <MessageContext.Provider value={contextValue}>
      <div className="flex h-screen w-full overflow-hidden relative" data-testid="chatbot-main-container">
        {/* Sidebar - visible on large screens */}
        <div className={`bg-base-100 overflow-y-auto transition-all duration-300 ease-in-out ${isToggledrawer && !isSmallScreen ? 'w-96 max-w-[286px]' : 'w-0'}`} data-testid="chatbot-sidebar">
          <ChatbotDrawer
            setToggleDrawer={(data: boolean) => { dispatch(setToggleDrawer(data)) }}
            isToggledrawer={isToggledrawer}
          />
        </div>

        {/* Main content area */}
        <div className="flex flex-col w-full" data-testid="chatbot-main-content">
          {/* Mobile header */}
          <ChatbotHeader />

          {/* Loading indicator */}
          {chatsLoading && (
            <div className="w-full" data-testid="chatbot-loading-indicator">
              <LinearProgress
                color="inherit"
                style={{ color: backgroundColor }}
              />
            </div>
          )}
          <ChatbotHeaderTab />

          {isChatEmpty ? (
            <EmptyChatView defaultMessage={defaultMessage} />
          ) : (
            <ActiveChatView />
          )}
        </div>
      </div>
    </MessageContext.Provider>
  );
}

// Export with HOC for URL data
export default React.memo(addUrlDataHoc(Chatbot));