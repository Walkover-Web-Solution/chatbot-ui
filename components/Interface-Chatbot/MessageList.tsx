// React and Next.js imports
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// MUI Components
import { lighten, LinearProgress, useTheme } from "@mui/material";

// Third-party libraries
import InfiniteScroll from "react-infinite-scroll-component";

// App imports
import { $ReduxCoreType } from "@/types/reduxCore";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { MessageContext } from "./InterfaceChatbot";
import Message from "./Message";
import MoveToDownButton from "./MoveToDownButton";

function MessageList() {
  const {
    hasMoreMessages = false,
    newMessage,
    getMoreChats,
    messageIds,
    msgIdAndDataMap,
    loading,
    setNewMessage
  } = useContext(MessageContext);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const lastScrollHeightRef = useRef<number>(0);
  const prevMessagesLengthRef = useRef<number>(0);
  const { IsHuman, assigned_type, currentChannelId, greetingMessage } = useCustomSelector((state: $ReduxCoreType) => ({
    IsHuman: state.Hello?.isHuman,
    assigned_type: state.Hello?.channelListData?.channels?.find((channel: any) => channel?.channel === state?.Hello?.currentChannelId)?.assigned_type || 'bot',
    currentChannelId: state.Hello?.currentChannelId,
    greetingMessage : state.Hello?.greeting
  }));
  const theme = useTheme();
  const themePalette = {
    "--primary-main": lighten(theme.palette.secondary.main, 0.4),
  };

  const movetoDown = useCallback(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: 'smooth'
      });
      setIsAtBottom(true);
    }
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
      // Trigger loading more messages
      getMoreChats();
    }
  }, [hasMoreMessages, getMoreChats]);


  useEffect(() => {
    if (newMessage) {
      setNewMessage(false);
      setTimeout(movetoDown, 100);
    }
  }, [newMessage, movetoDown]);

  // Initial scroll to bottom when messages first load
  useEffect(() => {
    if ((messageIds?.length > 0 && prevMessagesLengthRef.current === 0) || newMessage) {
      setTimeout(movetoDown, 100);
    }
  }, [messageIds?.length, movetoDown, newMessage]);

  // Handle new messages vs pagination
  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (!messageContainer) return;

    // If messages were added at the end (new messages)
    if (messageIds?.length > prevMessagesLengthRef.current && isAtBottom) {
      setTimeout(movetoDown, 100);
    }
    // If messages were added at the beginning (pagination)
    else if (messageIds?.length > prevMessagesLengthRef.current && lastScrollHeightRef.current > 0) {
      const newScrollHeight = messageContainer.scrollHeight;
      const heightDifference = newScrollHeight - lastScrollHeightRef.current;

      if (heightDifference > 0) {
        messageContainer.scrollTop = heightDifference;
      }
    }

    prevMessagesLengthRef.current = messageIds?.length || 0;
  }, [messageIds?.length, movetoDown, isAtBottom]);

  // Set up scroll event listener
  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.addEventListener("scroll", handleScroll);
      return () => messageContainer.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const RenderMessages = useMemo(() => {
    const targetMessages = messageIds;
    const targetMap = msgIdAndDataMap;

    return targetMessages?.map((msgId, index) => (
      <Message
        key={`${msgId}-${index}`}
        message={targetMap?.[msgId]}
      />
    ));
  }, [messageIds, IsHuman, msgIdAndDataMap]);

  // Function to manually trigger loading more messages
  return (
    <div>
      <div
        ref={containerRef}
        id="scrollableDiv"
        className="h-full overflow-y-auto flex flex-col p-2 sm:p-3 w-full"
      >
        <InfiniteScroll
          dataLength={messageIds?.length || 0}
          next={getMoreChats}
          hasMore={hasMoreMessages}
          inverse={true}
          scrollableTarget="message-container"
          scrollThreshold="200px"
        // style={{ display: 'flex', flexDirection: 'column-reverse' }}
        >
          {IsHuman && greetingMessage && (greetingMessage?.text || greetingMessage?.options?.length > 0) && <Message message={{
            role: 'Bot',
            id: '12312312312312312312',
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
          }} />}
          {RenderMessages}
          {IsHuman && loading && assigned_type === 'bot' && currentChannelId && <div className="w-full">
            <div className="flex flex-wrap gap-2 items-center">
              <p className="text-sm">Thinking...</p>
            </div>
            <div className="loading-indicator" style={themePalette}>
              <div className="loading-bar"></div>
              <div className="loading-bar"></div>
              <div className="loading-bar"></div>
            </div>
          </div>
          }
        </InfiniteScroll>
      </div>
      <MoveToDownButton
        movetoDown={movetoDown}
        showScrollButton={showScrollButton}
      />
    </div>
  );
}

export default MessageList;
