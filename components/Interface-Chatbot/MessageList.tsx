// React and Next.js imports
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";

// MUI Components
import { Box, LinearProgress, Typography } from "@mui/material";

// Third-party libraries
import InfiniteScroll from "react-infinite-scroll-component";

// App imports
import { $ReduxCoreType } from "@/types/reduxCore";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { MessageContext } from "./InterfaceChatbot";
import Message from "./Message";
import MoveToDownButton from "./MoveToDownButton";
import { ChatBotGif } from "@/assests/assestsIndex";
import { sendFeedbackAction } from "@/config/api";
import Image from "next/image";
import { Chat } from "@mui/icons-material";

interface MessageListProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

function MessageList({ containerRef, shouldScroll, setShouldScroll }: MessageListProps) {
  const {
    fetchMoreData,
    hasMoreMessages = false,
    setNewMessage,
    newMessage,
    currentPage = 1,
    starterQuestions = [],
  } = useContext(MessageContext);
  const MessagesList = useContext(MessageContext);
  const {
    messages = [],
    setMessages,
    addMessage,
    helloMessages = [],
  } = MessagesList;
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [showIcon, setShowGif] = useState(false);
  const [isInverse, setIsInverse] = useState(false);
  const scrollPositionRef = useRef<number>(0);
  const prevMessagesLengthRef = useRef<number>(messages.length);
  const { IsHuman } = useCustomSelector((state: $ReduxCoreType) => ({
    IsHuman: state.Hello?.isHuman,
  }));

  const handleFeedback = useCallback(
    async (
      messageId: string,
      feedbackStatus: number,
      currentStatus: number
    ) => {
      if (messageId && feedbackStatus && currentStatus !== feedbackStatus) {
        setShouldScroll(false);
        const response: any = await sendFeedbackAction({
          messageId,
          feedbackStatus,
        });
        if (response?.success) {
          const messageId = response?.result?.[0]?.message_id;
          // Iterate over messages and update the feedback status of the message whose role is assistant
          for (let i = messages?.length - 1; i >= 0; i--) {
            const message = messages[i];
            if (
              message?.role === "assistant" &&
              message?.message_id === messageId
            ) {
              message.user_feedback = feedbackStatus;
              break; // Assuming only one message needs to be updated
            }
          }
          setMessages([...messages]);
        }
      }
    },
    [messages, setMessages, sendFeedbackAction]
  );

  const movetoDown = useCallback(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, []);


  const handleScroll = useCallback(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    const scrollPosition = currentContainer.scrollTop;
    const maxScrollTop = currentContainer.scrollHeight - currentContainer.clientHeight;

    // Save scroll position when scrolling up
    if (scrollPosition < scrollPositionRef.current) {
      scrollPositionRef.current = scrollPosition;
    }

    setShowScrollButton(scrollPosition < maxScrollTop - 150);

    // Trigger fetchMoreData when scrolled to top
    if (scrollPosition === 0 && hasMoreMessages) {
      fetchMoreData?.();
    }
  }, [containerRef, hasMoreMessages, fetchMoreData]);

  useEffect(() => {

    if (messages.length > prevMessagesLengthRef.current) {
      // New messages added at bottom
      if (shouldScroll || newMessage) {
        movetoDown();
      }
    } else if (messages.length > 0 && containerRef.current) {
      // Messages added at top (pagination)
      const heightDiff = containerRef.current.scrollHeight - containerRef.current.clientHeight;
      containerRef.current.scrollTop = heightDiff - scrollPositionRef.current;
    }
    prevMessagesLengthRef.current = messages.length;
    setNewMessage?.(false);
  }, [messages, IsHuman, newMessage, shouldScroll]);

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (currentContainer) {
      currentContainer.addEventListener("scroll", handleScroll);
      return () => currentContainer.removeEventListener("scroll", handleScroll);
    }
  }, [containerRef, handleScroll]);

  const RenderMessages = useMemo(() => {
    const targetMessages = IsHuman ? helloMessages : messages;
    return targetMessages.map((message, index) => (
      <Message
        key={`${message?.message_id}-${index}`}
        message={message}
        handleFeedback={handleFeedback}
        addMessage={addMessage}
      />
    ));
  }, [messages, handleFeedback, addMessage, helloMessages, IsHuman]);

  useEffect(() => {
    const timer = setTimeout(() => setShowGif(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (IsHuman ? helloMessages.length === 0 : messages.length === 0) ? (
    <div className="flex flex-col items-center h-full w-full">
      <Image
        src={ChatBotGif}
        alt="Chatbot GIF"
        className={`${showIcon ? 'block' : 'hidden'}`}
        width={100}
        height={100}
      />
      <h2 className={`text-xl font-bold text-black ${showIcon ? 'block' : 'hidden'}`}>
        What can I help with?
      </h2>

      {starterQuestions?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full px-4 mt-8">
          {starterQuestions.map((question, index) => (
            <div
              key={index}
              onClick={() => addMessage(question)}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer"
            >
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary-100/20 flex items-center justify-center">
                    <Chat className="h-4 w-4 text-primary-600" />
                  </div>
                  <p className="text-gray-700 font-medium line-clamp-2">
                    {question}
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary-500 to-primary-600 transform scale-x-0 transition-transform group-hover:scale-x-100" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  ) : (
    <Box
      id="scrollableDiv"
      sx={{
        height: "100%",
        overflowY: "auto",
        display: "flex",
        flexDirection: isInverse ? "column" : "column-reverse",
        padding: 2,
      }}
    >
      <InfiniteScroll
        dataLength={messages.length}
        next={fetchMoreData}
        hasMore={hasMoreMessages}
        inverse={!isInverse}
        loader={
          Number(currentPage) > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <LinearProgress
                sx={{
                  height: 4,
                  width: "80%",
                  marginBottom: 2,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'black'
                  }
                }}
              />
            </Box>
          )
        }
        scrollableTarget="message-container"
        style={{
          display: "flex",
          flexDirection: "column",
        }}
        scrollThreshold="230px"
      >
        {RenderMessages}
      </InfiniteScroll>

      <MoveToDownButton
        movetoDown={movetoDown}
        showScrollButton={showScrollButton}
      />
    </Box>
  );
}
export default MessageList;
