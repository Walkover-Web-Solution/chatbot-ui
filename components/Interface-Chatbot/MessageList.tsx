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

import { $ReduxCoreType } from "@/types/reduxCore";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { MessageContext } from "./InterfaceChatbot";
import Message from "./Message";
import MoveToDownButton from "./MoveToDownButton";

interface MessageListProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

function MessageList({ containerRef }: MessageListProps) {
  const {
    // fetchMoreData,
    hasMoreMessages = false,
    newMessage,
    currentPage = 1,
    getMoreChats,
    messageIds,
    msgIdAndDataMap,
    helloMsgIdAndDataMap,
    helloMsgIds,
    helloMessages
  } = useContext(MessageContext);
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isInverse, setIsInverse] = useState(false);
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

    if (messageIds.length === prevMessagesLengthRef.current) {
      // New messageIds added at bottom
      movetoDown();
    } else if (messageIds.length > 0 && containerRef.current) {
      // messageIds added at top (pagination)
      const heightDiff = containerRef.current.scrollHeight - containerRef.current.clientHeight;
      containerRef.current.scrollTop = heightDiff - scrollPositionRef.current;
    }
    prevMessagesLengthRef.current = messageIds.length;
  }, [messageIds, IsHuman, newMessage]);

  useEffect(() => {
    const currentContainer = containerRef?.current;
    if (currentContainer) {
      currentContainer.addEventListener("scroll", handleScroll);
      return () => currentContainer.removeEventListener("scroll", handleScroll);
    }
  }, [containerRef, handleScroll]);

  const RenderMessages = useMemo(() => {
    if (IsHuman) {
      return helloMessages?.map((msg, index) => {
        return <Message
          // testKey={`${msgId}-${index}`}
          key={`${msg?.id}-${index}`}
          message={msg}
        />
      });
    } else {
      return messageIds?.map((msgId, index) => {
        return <Message
          // testKey={`${msgId}-${index}`}
          key={`${msgId}-${index}`}
          message={msgIdAndDataMap[msgId]}
        />
      });
    }

    const targetMessages = IsHuman ? helloMessages : messageIds;
    const data = IsHuman ? helloMsgIdAndDataMap : msgIdAndDataMap;
    return targetMessages?.map((msgId, index) => {
      return <Message
        // testKey={`${msgId}-${index}`}
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
      className="p-2 sm:p-3 w-full"
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
