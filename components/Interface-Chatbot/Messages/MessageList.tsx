
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

// MUI Components
import { lighten } from "@mui/material";

// Third-party libraries
import InfiniteScroll from "react-infinite-scroll-component";

// App imports
import { useChatActions, useGetMoreChats } from "@/components/Chatbot/hooks/useChatActions";
import { useColor } from "@/components/Chatbot/hooks/useColor";
import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { ParamsEnums } from "@/utils/enums";
import { generateNewId } from "@/utils/utilities";
import MoveToDownButton from "../MoveToDownButton";
import Message from "./Message";

// Constants
const NEAR_BOTTOM_THRESHOLD = 80;

/**
 * A component that displays a list of messages.
 * It includes an infinite scroll component to load more messages as needed.
 */

function MessageList({ chatSessionId, currentChannelId = "" }: { chatSessionId: string, currentChannelId: string }) {
  const getMoreChats = useGetMoreChats();
  const { setNewMessage } = useChatActions();
  const { backgroundColor, textColor } = useColor();

  const { newMessage, messageIds, msgIdAndDataMap, loading, hasMoreMessages } = useCustomSelector((state) => ({
    newMessage: state.Chat.newMessage || false,
    messageIds: state.Chat.messageIds?.[state.Chat?.subThreadId] || [],
    msgIdAndDataMap: state.Chat.msgIdAndDataMap?.[state.Chat?.subThreadId] || {},
    loading: state.Chat.loading,
    hasMoreMessages: state.Chat.hasMoreMessages || false,
  }))

  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const themePalette = useMemo(() => ({
    "--primary-main": lighten(backgroundColor, 0.4),
  }), [backgroundColor]);

  const fetchMoreData = useCallback(() => {
    getMoreChats();
  }, [getMoreChats]);

  const moveToDown = useCallback(() => {
    if (scrollableDivRef.current) {
      scrollableDivRef.current.scrollTo({
        top: scrollableDivRef.current.scrollHeight,
        behavior: 'smooth'
      });
      setShowScrollButton(false);
    }
  }, []);

  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isNearBottom = distanceFromBottom < NEAR_BOTTOM_THRESHOLD;
    isAtBottomRef.current = isNearBottom;
    setShowScrollButton(!isNearBottom);
  }, []);

  // Handle new message and scroll to bottom
  useEffect(() => {
    if (newMessage) {
      setNewMessage(false);
      setTimeout(moveToDown, 100);
    }
  }, [newMessage, moveToDown, setNewMessage]);

  const latestMessage = useMemo(() => {
    if (messageIds.length > 0) {
      return msgIdAndDataMap[messageIds[0]];
    }
    return null;
  }, [messageIds, msgIdAndDataMap]);

  // Handle auto-scrolling during continuous streaming without stuttering smooth-scroll
  useEffect(() => {
    if (latestMessage?.isStreaming && isAtBottomRef.current && scrollableDivRef.current) {
      scrollableDivRef.current.scrollTo({
        top: scrollableDivRef.current.scrollHeight,
        behavior: 'auto'
      });
    }
  }, [latestMessage?.content, latestMessage?.tools_data, latestMessage?.isStreaming]);

  const ThinkingIndicator = React.memo(({ themePalette }: { themePalette: any }) => (
    <div className="w-full" data-testid="chatbot-thinking-indicator">
      <div className="loading-indicator" style={themePalette}>
        <div className="loading-bar" />
        <div className="loading-bar" />
        <div className="loading-bar" />
      </div>
    </div>
  ));

  const renderThinkingIndicator = useMemo(() => {
    const isLatestMessageAssistant = latestMessage?.role === "assistant";
    const isLatestMessageStreaming = latestMessage?.isStreaming === true;
    const isLatestMessageWaiting = latestMessage?.wait === true;

    const shouldShow = loading && !(isLatestMessageAssistant && (isLatestMessageStreaming || isLatestMessageWaiting));
    return shouldShow ? <ThinkingIndicator themePalette={themePalette} /> : null;
  }, [loading, latestMessage?.role, latestMessage?.isStreaming, latestMessage?.wait, themePalette]);

  const renderedMessages = useMemo(() => {
    let lastHumanOrBotIndex = -1;

    return messageIds.map((msgId, index) => {
      const message = msgIdAndDataMap[msgId];

      // Find the first HumanOrBot message (most recent in reversed list)
      if (lastHumanOrBotIndex === -1 && (message?.role === 'Human' || message?.role === 'Bot')) {
        lastHumanOrBotIndex = index;
      }

      const prevTime = messageIds[index + 1] && msgIdAndDataMap[messageIds[index + 1]]
        ? msgIdAndDataMap[messageIds[index + 1]]?.time || null
        : null;

      return (
        <Message
          key={`${msgId}`}
          data-testid={`chatbot-message-${msgId}`}
          message={message}
          prevTime={prevTime}
          isLastMessage={index === lastHumanOrBotIndex}
        />
      );
    });
  }, [messageIds, msgIdAndDataMap]);

  const Loader = React.memo(() => (
    <div className="flex justify-center p-4" data-testid="chatbot-message-loader">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ));

  return (
    <div
      id="scrollableDiv"
      ref={scrollableDivRef}
      onScroll={handleScroll}
      className="w-full h-full flex-1 overflow-auto px-3 sm:p-4"
      data-testid="chatbot-messages-scroll-container"
      style={{
        display: 'flex',
        flexDirection: 'column-reverse',
        minHeight: 0 // Important for flex child to properly scroll
      }}
    >
      <InfiniteScroll
        dataLength={messageIds.length}
        next={fetchMoreData}
        hasMore={hasMoreMessages}
        loader={<Loader />}
        scrollableTarget="scrollableDiv"
        scrollThreshold='200px'
        inverse={true}
        style={{
          display: 'flex',
          flexDirection: 'column-reverse'
        }}
      >
        {renderThinkingIndicator}
        {renderedMessages}
      </InfiniteScroll>
      <MoveToDownButton
        movetoDown={moveToDown}
        showScrollButton={showScrollButton}
        backgroundColor={lighten(backgroundColor, 0.1)}
        textColor={textColor}
      />
    </div>
  );

}

export default React.memo(addUrlDataHoc(MessageList, [ParamsEnums.currentChannelId]));