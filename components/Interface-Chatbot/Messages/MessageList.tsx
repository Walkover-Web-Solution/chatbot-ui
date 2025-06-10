
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

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
import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";
import { ParamsEnums } from "@/utils/enums";

function MessageList({ chatSessionId, currentChannelId = "" }: { chatSessionId: string, currentChannelId: string }) {
  const {
    hasMoreMessages = false,
    newMessage,
    getMoreChats,
    getMoreHelloChats,
    messageIds = [],
    msgIdAndDataMap = {},
    loading,
    setNewMessage
  } = useContext(MessageContext);

  const scrollableDivRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const { isHelloUser, assigned_type, greetingMessage } = useCustomSelector((state: $ReduxCoreType) => ({
    isHelloUser: state.Hello?.[chatSessionId]?.isHelloUser,
    assigned_type: state.Hello?.[chatSessionId]?.channelListData?.channels?.find((channel: any) => channel?.channel === currentChannelId)?.assigned_type,
    greetingMessage: state.Hello?.[chatSessionId]?.greeting
  }));

  const theme = useTheme();
  const themePalette = {
    "--primary-main": lighten(theme.palette.secondary.main, 0.4),
  };

  const fetchMoreData = useCallback(() => {
    if (isHelloUser) {
      getMoreHelloChats();
    } else {
      getMoreChats();
    }
  }, [isHelloUser, getMoreHelloChats, getMoreChats]);

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
    const { scrollTop } = e.target;

    // In inverse scroll, scrollTop === 0 means you're at the bottom
    // scrollTop becomes more negative as you scroll up
    const buffer = -500; // buffer zone: only show button if user scrolled > 500px up

    const isNearBottom = scrollTop > buffer;

    setShowScrollButton(!isNearBottom);
  }, []);

  // Handle new message and scroll to bottom
  useEffect(() => {
    if (newMessage) {
      setNewMessage(false);
      setTimeout(moveToDown, 100);
    }
  }, [newMessage, moveToDown, setNewMessage]);

  // this is the greeting message that is shown when the user first opens the chat
  const renderGreetingMessage = useMemo(() => {
    if (!isHelloUser || !greetingMessage ||
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
  }, [isHelloUser, greetingMessage]);

  const renderThinkingIndicator = useMemo(() => {
    if (loading && assigned_type === 'bot' && isHelloUser) {
      return (
        <div className="w-full">
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
  }, [isHelloUser, loading, assigned_type, currentChannelId, themePalette]);

  const renderedMessages = useMemo(() => {
    return messageIds.map((msgId, index) => {
      const prevTime = messageIds[index + 1] && msgIdAndDataMap[messageIds[index + 1]]
        ? msgIdAndDataMap[messageIds[index + 1]]?.time || null
        : null;
      return (
        <Message
          key={`${msgId}`}
          message={msgIdAndDataMap[msgId]}
          prevTime={prevTime}
        />
      );
    });
  }, [messageIds, msgIdAndDataMap]);

  const Loader = () => (
    <div className="flex justify-center p-4">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div
      id="scrollableDiv"
      ref={scrollableDivRef}
      onScroll={handleScroll}
      className="w-full h-full flex-1 overflow-auto p-3 sm:p-4"
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
        {renderGreetingMessage}
      </InfiniteScroll>
      <MoveToDownButton
        movetoDown={moveToDown}
        showScrollButton={showScrollButton}
        backgroundColor={lighten(theme.palette.secondary.main, 0.1)}
      />
    </div>
  );

}

export default React.memo(addUrlDataHoc(MessageList, [ParamsEnums.currentChannelId]));