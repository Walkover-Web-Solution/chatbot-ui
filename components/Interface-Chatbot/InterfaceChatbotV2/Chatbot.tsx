import { ChatBotGif } from '@/assests/assestsIndex';
import { LinearProgress, useTheme } from '@mui/material';
import Image from 'next/image';
import { useReducer, useRef } from 'react';
import ChatbotDrawer from '../ChatbotDrawer';
import ChatbotHeader from '../ChatbotHeader';
import ChatbotHeaderTab from '../ChatbotHeaderTab';
import ChatbotTextField from '../ChatbotTextField';
import { MessageContext } from '../InterfaceChatbot';
import MessageList from '../MessageList';
import StarterQuestions from '../StarterQuestions';
import { chatReducer, initialState } from './chatReducer';
import { useChatActions } from './useChatActions';

function Chatbot() {
    const [state, dispatch] = useReducer(chatReducer, initialState);
    const actions = useChatActions(state, dispatch);
    const { addMessage, loadMoreMessages, setBridgeName, setThreadId, toggleDrawer } = actions;
    const containerRef = useRef<any>(null);
    const messageRef = useRef<any>(null);
    const theme = useTheme();
    const {
        messages,
        helloMessages,
        loading,
        hasMoreMessages,
        currentPage,
        threadId,
        subThreadId,
        bridgeName,
        helloId,
        bridgeVersionId,
        starterQuestions,
        headerButtons,
        options,
        images,
        chatsLoading,
        isToggledrawer,
        IsHuman
    } = state

    const handleChatsLoading = (loading: boolean) => {
        dispatch({ type: 'SET_CHATS_LOADING', payload: loading })
    }
    return (
        <MessageContext.Provider value={{ state, actions }}>
            {/* <FormComponent open={open} setOpen={setOpen} /> */}
            <div className="flex h-screen w-full overflow-hidden relative">
                {/* Sidebar - always visible on large screens */}
                <div className={`hidden lg:block bg-base-100 border-r overflow-y-auto transition-all duration-300 ease-in-out ${isToggledrawer ? ' w-64' : 'w-0'}`}>
                    <ChatbotDrawer setToggleDrawer={toggleDrawer} isToggledrawer={isToggledrawer} />
                </div>

                {/* Main content area */}

                <div className="flex flex-col flex-1 w-full">
                    {/* Mobile header - hidden on large screens */}
                    <ChatbotHeader
                        setLoading={(loading) => dispatch({ type: 'SET_LOADING', payload: loading })}
                        setChatsLoading={handleChatsLoading}
                        setToggleDrawer={toggleDrawer}
                        isToggledrawer={isToggledrawer}
                        threadId={threadId}
                        reduxBridgeName={bridgeName}
                        headerButtons={headerButtons}
                    />
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
                                <ChatbotTextField
                                    loading={loading}
                                    options={options}
                                    setChatsLoading={handleChatsLoading}
                                    onSend={() => {
                                        IsHuman ? onSendHello() : onSend();
                                    }}
                                    setImages={(images) => dispatch({ type: 'SET_IMAGES', payload: images })}
                                    images={images}
                                    messageRef={messageRef}
                                />
                            </div>
                            <StarterQuestions starterQuestions={starterQuestions} addMessage={addMessage} />
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
                                <ChatbotTextField
                                    loading={loading}
                                    options={options}
                                    setChatsLoading={handleChatsLoading}
                                    onSend={() => {
                                        IsHuman ? onSendHello() : onSend();
                                    }}
                                    setImages={(images) => dispatch({ type: 'SET_IMAGES', payload: images })}
                                    images={images}
                                    messageRef={messageRef}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </MessageContext.Provider>
    );
}

export default Chatbot