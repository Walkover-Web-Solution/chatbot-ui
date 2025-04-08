// React and Next.js imports
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// MUI Components
import { Box, LinearProgress } from "@mui/material";

// Third-party libraries
import InfiniteScroll from "react-infinite-scroll-component";

// App imports

import { sendFeedbackAction } from "@/config/api";
import { $ReduxCoreType } from "@/types/reduxCore";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { MessageContext } from "./InterfaceChatbot";
import Message from "./Message";
import MoveToDownButton from "./MoveToDownButton";
import { useChatActions } from "../Chatbot/hooks/useChatActions";

interface MessageListProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

function MessageList({ containerRef }: MessageListProps) {
  const {
    // fetchMoreData,
    hasMoreMessages = false,
    setNewMessage,
    newMessage,
    currentPage = 1,
    getMoreChats,
    messages = [],
    setMessages, addMessage, helloMessages = [],
    messageIds,
    msgIdAndDataMap,
    helloMsgIdAndDataMap,
    helloMsgIds
  } = useContext(MessageContext);
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isInverse, setIsInverse] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(true);
  const scrollPositionRef = useRef<number>(0);
  const prevMessagesLengthRef = useRef<number>(messageIds?.length);
  const { IsHuman } = useCustomSelector((state: $ReduxCoreType) => ({
    IsHuman: state.Hello?.isHuman,
  }));


  const movetoDown = useCallback(() => {
    containerRef?.current?.scrollTo({
      top: containerRef?.current.scrollHeight,
      behavior: "smooth",
    });
  }, []);


  const handleScroll = useCallback(() => {
    const currentContainer = containerRef?.current;
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
      getMoreChats()
    }
  }, [containerRef, hasMoreMessages, currentPage]);

  useEffect(() => {

    if (messages.length === prevMessagesLengthRef.current) {
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
    const currentContainer = containerRef?.current;
    if (currentContainer) {
      currentContainer.addEventListener("scroll", handleScroll);
      return () => currentContainer.removeEventListener("scroll", handleScroll);
    }
  }, [containerRef, handleScroll]);

  const RenderMessages = useMemo(() => {
    const targetMessages = IsHuman ? helloMsgIds : messageIds;
    const data = IsHuman ? helloMsgIdAndDataMap : msgIdAndDataMap;
    return targetMessages?.map((msgId, index) => {
      return <Message
        testKey={`${msgId}-${index}`}
        key={`${msgId}-${index}`}
        message={data[msgId]}
      />
    });
  }, [messageIds, helloMsgIds, IsHuman]);

  return (
    <Box
      id="scrollableDiv"
      sx={{
        height: "100%",
        overflowY: "auto",
        display: "flex",
        flexDirection: isInverse ? "column" : "column-reverse",
      }}
      className="p-2 sm:p-3"
    >
      <InfiniteScroll
        dataLength={messageIds?.length}
        next={() => getMoreChats()}
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
