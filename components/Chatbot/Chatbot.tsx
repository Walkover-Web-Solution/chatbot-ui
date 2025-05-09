import { LinearProgress, useTheme } from '@mui/material';
import Image from 'next/image';
import { memo, useEffect, useReducer, useRef } from 'react';

// Context and hooks
import { MessageContext } from '../Interface-Chatbot/InterfaceChatbot';
import { chatReducer, initialChatState } from './hooks/chatReducer';
import { ChatActionTypes } from './hooks/chatTypes';
import { useChatActions } from './hooks/useChatActions';
import useHelloIntegration from './hooks/useHelloIntegration';
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
import { ParamsEnums } from '@/utils/enums';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import { $ReduxCoreType } from '@/types/reduxCore';

interface ChatbotProps {
  chatbotId: string;
}

function Chatbot({ chatbotId }: ChatbotProps) {
  // Refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef<boolean>(false);
  const messageRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  // State management
  const [chatState, chatDispatch] = useReducer(chatReducer, initialChatState);
  const {
    openHelloForm,
    isToggledrawer,
    chatsLoading,
    messageIds,
    msgIdAndDataMap,
    subThreadId,
    helloMsgIds,
    isTyping
  } = chatState;

  // Custom hooks
  const { sendMessageToHello, fetchHelloPreviousHistory, fetchChannels } =
    useHelloIntegration({
      chatbotId,
      chatDispatch,
      chatState,
      messageRef
    });

  const { IsHuman, isSmallScreen, currentChatId, isDefaultNavigateToChatScreen } =
    useReduxStateManagement({
      chatbotId,
      chatDispatch
    });

  const { show_widget_form, is_anon } = useCustomSelector((state: $ReduxCoreType) => {
    const helloConfig = state.Hello?.helloConfig
    return ({
      show_widget_form: typeof helloConfig?.show_widget_form === 'boolean' ? helloConfig?.show_widget_form : state.Hello?.widgetInfo?.show_widget_form,
      is_anon: state.Hello?.is_anon == 'true'
    })
  });

  const chatActions = useChatActions({
    chatbotId,
    chatDispatch,
    chatState,
    messageRef,
    timeoutIdRef
  });

  // Initialize RTLayer event listeners
  useRtlayerEventManager({
    chatbotId,
    chatDispatch,
    chatState,
    messageRef,
    timeoutIdRef
  });

  const theme = useTheme();

  // Effect to open drawer for new human users
  useEffect(() => {
    if (IsHuman && !currentChatId && !mountedRef.current) {
      chatActions.setToggleDrawer(true);
    }
    mountedRef.current = true;
  }, [IsHuman, currentChatId, chatActions]);

  // open Chat directly if no team or one team exista
  useEffect(() => {
    if (isDefaultNavigateToChatScreen) {
      chatActions.setToggleDrawer(false);
      if (messageRef.current) {
        messageRef.current.focus();
      }
    }
  }, [isDefaultNavigateToChatScreen])

  // Context value
  const contextValue = {
    ...chatState,
    sendMessageToHello,
    fetchHelloPreviousHistory,
    messageRef,
    chatDispatch,
    messageIds: messageIds?.[subThreadId] || [],
    msgIdAndDataMap: msgIdAndDataMap?.[subThreadId],
    allMessages: messageIds,
    allMessagesData: msgIdAndDataMap,
    isSmallScreen,
    isTyping: isTyping?.[subThreadId],
    fetchChannels,
    ...chatActions
  };

  // Check if chat is empty
  const isChatEmpty = IsHuman
    ? helloMsgIds[subThreadId]?.length === 0
    : messageIds[subThreadId]?.length === 0;

  return (
    <MessageContext.Provider value={contextValue}>
      <div className="flex h-screen w-full overflow-hidden relative">
        {/* Sidebar - visible on large screens */}
        <div className={`hidden lg:block bg-base-100 border-r overflow-y-auto transition-all duration-300 ease-in-out ${isToggledrawer ? 'w-64' : 'w-0'}`}>
          <ChatbotDrawer
            setToggleDrawer={chatActions.setToggleDrawer}
            isToggledrawer={isToggledrawer}
          />
        </div>

        {/* Main content area */}
        <div className="flex flex-col flex-1 w-full">
          {/* Mobile header */}
          <ChatbotHeader />

          {/* Loading indicator */}
          {chatsLoading && (
            <div className="w-full">
              <LinearProgress
                color="inherit"
                style={{ color: theme.palette.primary.main }}
              />
            </div>
          )}

          {/* Form and UI components */}
          {IsHuman && show_widget_form && !is_anon && (
            <FormComponent
              open={openHelloForm}
              setOpen={(isFormOpen: boolean) =>
                chatDispatch({
                  type: ChatActionTypes.SET_OPEN_HELLO_FORM,
                  payload: isFormOpen
                })
              }
              isSmallScreen={isSmallScreen}
            />
          )}
          <CallUI />
          <ChatbotHeaderTab />

          {isChatEmpty ? (
            <EmptyChatView />
          ) : (
            <ActiveChatView
              containerRef={containerRef}
              subThreadId={subThreadId}
              messageIds={messageIds}
            />
          )}
        </div>
      </div>
    </MessageContext.Provider>
  );
}

interface EmptyChatViewProps { }

// Empty chat component
function EmptyChatView({ }: EmptyChatViewProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto mt-[-70px] p-5">
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
  );
}

interface ActiveChatViewProps {
  containerRef: React.RefObject<HTMLDivElement>;
  subThreadId: string;
  messageIds: Record<string, string[]>;
}

// Active chat component
function ActiveChatView({ containerRef, subThreadId, messageIds }: ActiveChatViewProps) {
  return (
    <>
      {/* Messages container */}
      <div
        className={`overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent flex-1 ${messageIds?.[subThreadId]?.length === 0 ? 'flex items-center justify-center' : 'pb-6'
          }`}
        id="message-container"
        ref={containerRef}
      >
        <div className="w-full max-w-5xl mx-auto">
          <MessageList />
        </div>
      </div>

      {/* Text input */}
      <div className="max-w-5xl mx-auto px-4 pb-3 w-full">
        <ChatbotTextField />
      </div>
    </>
  );
}

// Export with HOC for URL data
export default addUrlDataHoc(memo(Chatbot), [ParamsEnums.chatbotId]);