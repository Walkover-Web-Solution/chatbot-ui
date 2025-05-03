// React and Next.js imports
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

// MUI Components
import { lighten, useTheme } from "@mui/material";

// Third-party libraries
import InfiniteScroll from "react-infinite-scroll-component";

// App imports
import { $ReduxCoreType } from "@/types/reduxCore";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { generateNewId } from "@/utils/utilities";
import { MessageContext } from "../InterfaceChatbot";
import MoveToDownButton from "../MoveToDownButton";
import Message from "./Message";

function MessageList() {
  const {
    hasMoreMessages = false,
    newMessage,
    getMoreChats,
    messageIds = [],
    msgIdAndDataMap = {},
    loading,
    setNewMessage
  } = useContext(MessageContext);

  const containerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const lastScrollHeightRef = useRef(0);
  const prevMessagesLengthRef = useRef(0);

  const { IsHuman, assigned_type, currentChannelId, greetingMessage } = useCustomSelector((state: $ReduxCoreType) => ({
    IsHuman: state.Hello?.isHuman,
    assigned_type: state.Hello?.channelListData?.channels?.find(
      (channel: any) => channel?.channel === state.Hello?.currentChannelId
    )?.assigned_type,
    currentChannelId: state.Hello?.currentChannelId,
    greetingMessage: state.Hello?.greeting
  }));

  const theme = useTheme();
  const themePalette = {
    "--primary-main": lighten(theme.palette.secondary.main, 0.4),
  };

  const moveToDown = useCallback(() => {
    const messageContainer = document.getElementById("message-container");
    if (!messageContainer) return;

    messageContainer.scrollTo({
      top: messageContainer.scrollHeight,
      behavior: 'smooth'
    });
    setIsAtBottom(true);
  }, []);

  const handleScroll = useCallback(() => {
    const messageContainer = document.getElementById("message-container");
    if (!messageContainer) return;

    const { scrollTop, scrollHeight, clientHeight } = messageContainer;
    const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;

    setIsAtBottom(isBottom);
    setShowScrollButton(!isBottom);

    // Load more messages when scrolled to top
    if (scrollTop < 100 && hasMoreMessages) {
      // Save current scroll height before loading more
      lastScrollHeightRef.current = scrollHeight;
      getMoreChats();
    }
  }, [hasMoreMessages, getMoreChats]);

  // Handle new message and scroll to bottom
  useEffect(() => {
    if (newMessage) {
      setNewMessage(false);
      setTimeout(moveToDown, 100);
    }
  }, [newMessage, moveToDown, setNewMessage]);

  // Initial scroll to bottom when messages first load
  useEffect(() => {
    const isInitialLoad = messageIds.length > 0 && prevMessagesLengthRef.current === 0;
    if (isInitialLoad || newMessage) {
      setTimeout(moveToDown, 100);
    }
  }, [messageIds.length, moveToDown, newMessage]);

  // Handle new messages vs pagination
  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (!messageContainer) return;

    const messagesWereAdded = messageIds.length > prevMessagesLengthRef.current;

    if (messagesWereAdded) {
      if (isAtBottom) {
        // New messages at the end
        setTimeout(moveToDown, 100);
      } else if (lastScrollHeightRef.current > 0) {
        // Messages added at the beginning (pagination)
        const newScrollHeight = messageContainer.scrollHeight;
        const heightDifference = newScrollHeight - lastScrollHeightRef.current;

        if (heightDifference > 0) {
          messageContainer.scrollTop = heightDifference;
        }
      }
    }

    prevMessagesLengthRef.current = messageIds.length;
  }, [messageIds.length, moveToDown, isAtBottom]);

  // Set up scroll event listener
  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (!messageContainer) return;

    messageContainer.addEventListener("scroll", handleScroll);
    return () => messageContainer.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const renderGreetingMessage = useMemo(() => {
    if (!IsHuman || !greetingMessage ||
      (!greetingMessage.text && !greetingMessage?.options?.length)) {
      return null;
    }

    return (
      <Message
        message={{
          role: 'Bot',
          id: generateNewId(),
          message_type: 'interactive',
          messageJson: {
            type: 'button',
            body: {
              text: greetingMessage.text
            },
            action: {
              buttons: greetingMessage.options?.map((option: any) => ({
                reply: {
                  title: option
                }
              }))
            }
          }
        }}
      />
    );
  }, [IsHuman, greetingMessage]);

  const renderThinkingIndicator = useMemo(() => {
    if (loading && assigned_type === 'bot' && IsHuman) {
      return (
        <div className="w-full flex flex-col px-1">
          <div className="flex flex-wrap gap-2 items-center">
            <p className="text-sm">Thinking...</p>
          </div>
          <div className="loading-indicator" style={themePalette}>
            <div className="loading-bar"></div>
            <div className="loading-bar"></div>
            <div className="loading-bar"></div>
          </div>
        </div>
      );
    }
      return null
  }, [IsHuman, loading, assigned_type, currentChannelId, themePalette]);


  const renderedMessages = useMemo(() => {
    return messageIds.map((msgId, index) => (
      <Message
        key={`${msgId}-${index}`}
        message={msgIdAndDataMap[msgId]}
      />
    ));
  }, [messageIds, msgIdAndDataMap]);

  return (
    <div>
      <div
        ref={containerRef}
        id="scrollableDiv"
        className="h-full overflow-y-auto flex flex-col p-2 sm:p-3 w-full"
      >
        <InfiniteScroll
          dataLength={messageIds.length}
          next={getMoreChats}
          hasMore={hasMoreMessages}
          inverse={true}
          scrollableTarget="message-container"
          scrollThreshold="200px"
        >
          {renderGreetingMessage}
          {renderedMessages}
          {renderThinkingIndicator}
        </InfiniteScroll>
      </div>
      <MoveToDownButton
        movetoDown={moveToDown}
        showScrollButton={showScrollButton}
      />
    </div>
  );
}

export default MessageList;