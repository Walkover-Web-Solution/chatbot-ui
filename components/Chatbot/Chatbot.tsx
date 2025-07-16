import { LinearProgress } from '@mui/material';
import Image from 'next/image';
import React, { useEffect, useMemo, useRef } from 'react';

// Context and hooks
import { MessageContext } from '../Interface-Chatbot/InterfaceChatbot';
import { useReduxStateManagement } from './hooks/useReduxManagement';
import useRtlayerEventManager from './hooks/useRtlayerEventManager';

// Components
import FormComponent from '../FormComponent';
import CallUI from '../Hello/callUI';
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
import { useHelloEffects } from './hooks/useHelloEffects';
import { useReduxEffects } from './hooks/useReduxEffects';
import { useScreenSize } from './hooks/useScreenSize';

interface ChatbotProps {
  chatSessionId: string
  tabSessionId: string
}

// Memoized components
const EmptyChatView = React.memo(() => (
  <div className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto mt-[-100px] p-5">
    <div className="flex flex-col items-center w-full">
      <Image
        src={ChatBotGif}
        alt="Chatbot"
        className="block"
        width={100}
        height={100}
        priority
      />
      <h2 className="text-xl font-bold text-black">
        What can I help with?
      </h2>
    </div>
    <div className="max-w-5xl w-full mt-8">
      <ChatbotTextField />
    </div>
    <StarterQuestions />
  </div>
));

const ActiveChatView = React.memo(() => (
  <div className="flex flex-col h-full overflow-auto" style={{ height: '100vh' }}>
    <div className="flex-1 overflow-y-auto max-w-5xl mx-auto w-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
      <MessageList />
    </div>
    <div className="max-w-5xl mx-auto px-4 pb-3 w-full">
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
  const { show_widget_form, is_anon, greetingMessage, isToggledrawer, chatsLoading, messageIds, subThreadId, helloMsgIds } = useCustomSelector((state) => {
    const widgetInfo = state.Hello?.[chatSessionId]?.widgetInfo
    return ({
      show_widget_form: typeof widgetInfo?.show_widget_form === 'boolean' ? widgetInfo?.show_widget_form : state.Hello?.[chatSessionId]?.showWidgetForm,
      is_anon: state.Hello?.[chatSessionId]?.is_anon == 'true',
      greetingMessage: state.Hello?.[chatSessionId]?.greeting as any,
      isToggledrawer: state.Chat.isToggledrawer,
      chatsLoading: state.Chat.chatsLoading,
      messageIds: state.Chat.messageIds,
      subThreadId: state.Chat.subThreadId,
      helloMsgIds: state.Chat.helloMsgIds
    })
  });

  // Custom hooks
  useChatEffects({ chatSessionId, tabSessionId, messageRef, timeoutIdRef });
  useHelloEffects({ chatSessionId, tabSessionId, messageRef });
  useReduxEffects({ chatSessionId, tabSessionId });
  useRtlayerEventManager({ timeoutIdRef, chatSessionId, tabSessionId });

  const { isHelloUser, currentChatId, isDefaultNavigateToChatScreen } = useReduxStateManagement({ chatSessionId, tabSessionId });

  // Initialize RTLayer event listeners

  // Effect to open drawer for new human users
  useEffect(() => {
    if (isHelloUser && !currentChatId && !mountedRef.current) {
      dispatch(setToggleDrawer(true));
    }
    mountedRef.current = true;
  }, [isHelloUser, currentChatId, dispatch]);

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
  const isChatEmpty = isHelloUser
    ? (!subThreadId || helloMsgIds[subThreadId]?.length === 0) &&
    (!greetingMessage || (!greetingMessage.text && !greetingMessage?.options?.length))
    : !subThreadId || messageIds[subThreadId]?.length === 0;

  return (
    <MessageContext.Provider value={contextValue}>
      <div className="flex h-screen w-full overflow-hidden relative">
        {/* Sidebar - visible on large screens */}
        <div className={`bg-base-100 border-r overflow-y-auto transition-all duration-300 ease-in-out ${isToggledrawer && !isSmallScreen ? 'w-96 max-w-[286px]' : 'w-0'}`}>
          <ChatbotDrawer
            setToggleDrawer={(data: boolean) => { dispatch(setToggleDrawer(data)) }}
            isToggledrawer={isToggledrawer}
          />
        </div>

        {/* Main content area */}
        <div className="flex flex-col w-full">
          {/* Mobile header */}
          <ChatbotHeader />

          {/* Loading indicator */}
          {chatsLoading && (
            <div className="w-full">
              <LinearProgress
                color="inherit"
                style={{ color: backgroundColor }}
              />
            </div>
          )}

          {/* Form and UI components */}
          {isHelloUser && show_widget_form && !is_anon && (
            <FormComponent />
          )}
          <CallUI />
          <ChatbotHeaderTab />

          {isChatEmpty ? (
            <EmptyChatView />
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