import { ChatBotGif } from '@/assests/assestsIndex';
import { addUrlDataHoc } from '@/hoc/addUrlDataHoc';
import { ParamsEnums } from '@/utils/enums';
import { LinearProgress, useTheme } from '@mui/material';
import Image from 'next/image';
import React, { useReducer } from 'react';
import FormComponent from '../FormComponent';
import ChatbotDrawer from '../Interface-Chatbot/ChatbotDrawer';
import ChatbotHeader from '../Interface-Chatbot/ChatbotHeader';
import ChatbotHeaderTab from '../Interface-Chatbot/ChatbotHeaderTab';
import ChatbotTextField from '../Interface-Chatbot/ChatbotTextField';
import { MessageContext } from '../Interface-Chatbot/InterfaceChatbot';
import MessageList from '../Interface-Chatbot/MessageList';
import StarterQuestions from '../Interface-Chatbot/StarterQuestions';
import { chatReducer, initialChatState } from './hooks/chatReducer';
import { ChatActionTypes } from './hooks/chatTypes';
import { useChatActions } from './hooks/useChatActions';
import useHelloIntegration from './hooks/useHelloIntegration';
import { useReduxStateManagement } from './hooks/useReduxManagement';
import useRtlayerEventManager from './hooks/useRtlayerEventManager';

function Chatbot({ chatbotId }: { chatbotId: string }) {
    // refs
    const containerRef = React.useRef<HTMLDivElement>(null);
    const messageRef = React.useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
    const timeoutIdRef = React.useRef<NodeJS.Timeout | null>(null);

    // hooks
    const [chatState, chatDispatch] = useReducer(chatReducer, initialChatState);
    const { sendMessageToHello } = useHelloIntegration({ chatbotId, chatDispatch, chatState, messageRef });
    const { IsHuman } = useReduxStateManagement({ chatbotId, chatDispatch, chatState });
    const {
        setToggleDrawer,
        setLoading,
        setChatsLoading,
        sendMessage,
        setImages,
        setOptions,
        getMoreChats,
        setNewMessage,
        setMessages
    } = useChatActions({ chatbotId, chatDispatch, chatState, messageRef, timeoutIdRef });

    const theme = useTheme();

    // RTLayer Event Listiner
    useRtlayerEventManager({ chatbotId, chatDispatch, chatState, messageRef, timeoutIdRef })
    const { openHelloForm, isToggledrawer, chatsLoading, helloMessages, messages, messageIds, msgIdAndDataMap, subThreadId } = chatState;


    return (
        <MessageContext.Provider value={{
            ...chatState,
            sendMessageToHello,
            sendMessage,
            setImages,
            setToggleDrawer,
            setLoading,
            setChatsLoading,
            messageRef,
            setOptions,
            chatDispatch,
            getMoreChats,
            setNewMessage,
            setMessages,
            messageIds: messageIds[subThreadId],
            msgIdAndDataMap: msgIdAndDataMap[subThreadId]
        }}>
            <FormComponent open={openHelloForm} setOpen={() => chatDispatch({ type: ChatActionTypes.SET_OPEN_HELLO_FORM, payload: true })} />
            <div className="flex h-screen w-full overflow-hidden relative">
                {/* Sidebar - always visible on large screens */}
                <div className={`hidden lg:block bg-base-100 border-r overflow-y-auto transition-all duration-300 ease-in-out ${isToggledrawer ? ' w-64' : 'w-0'}`}>
                    <ChatbotDrawer setToggleDrawer={setToggleDrawer} isToggledrawer={isToggledrawer} />
                </div>

                {/* Main content area */}

                <div className="flex flex-col flex-1 w-full">
                    {/* Mobile header - hidden on large screens */}
                    <ChatbotHeader />
                    <ChatbotHeaderTab />
                    {chatsLoading && (
                        <div className="w-full">
                            <LinearProgress color="inherit" style={{ color: theme.palette.primary.main }} />
                        </div>
                    )}

                    {(IsHuman ? helloMessages?.length === 0 : messages?.length === 0) ? (
                        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto mt-[-70px] p-5">
                            <div className="flex flex-col items-center w-full">
                                <Image
                                    src={ChatBotGif}
                                    alt="Chatbot GIF"
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
                    ) : (
                        <>
                            {/* Messages container with flex layout */}
                            <div
                                className={`overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent flex-1 ${messages.length === 0 ? 'flex items-center justify-center' : 'pb-10'}`}
                                id="message-container"
                                ref={containerRef}
                            >
                                <div className="w-full max-w-5xl mx-auto">
                                    <MessageList containerRef={containerRef} />
                                </div>
                            </div>

                            {/* Text input at bottom */}
                            <div className="max-w-5xl mx-auto px-4 pb-3 w-full">
                                <ChatbotTextField />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </MessageContext.Provider>
    )
}

export default React.memo(
    addUrlDataHoc(React.memo(Chatbot), [ParamsEnums.chatbotId])
);