
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
import Message from "./Message";

function MessageList() {
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

  const fetchMoreData = useCallback(() => {
    if (IsHuman) {
      getMoreHelloChats();
    } else {
      getMoreChats();
    }
  }, [IsHuman, getMoreHelloChats, getMoreChats]);

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
      // fetchMoreData();
    }
  }, [hasMoreMessages, fetchMoreData]);

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
  }, [IsHuman, loading, assigned_type, currentChannelId, themePalette]);

  const renderedMessages = useMemo(() => {
    console.log(messageIds, 2323)
    return messageIds.map((msgId, index) => (
      <Message
        key={`${msgId}-${index}`}
        message={msgIdAndDataMap[msgId]}
        prevTime={
          index > 0 && messageIds[index - 1] && msgIdAndDataMap[messageIds[index - 1]]
            ? msgIdAndDataMap[messageIds[index - 1]]?.time || null
            : null
        }
      />
    ));
  }, [messageIds, msgIdAndDataMap]);

  // return (
  //   <div>
  //     <div
  //       ref={containerRef}
  //       id="scrollableDiv"
  //       className="h-full overflow-y-auto flex flex-col p-3 sm:p-4 w-full"
  //     >
  //       <InfiniteScroll
  //         dataLength={messageIds.length}
  //         next={getMoreChats}
  //         hasMore={hasMoreMessages}
  //         inverse={true}
  //         scrollableTarget="message-container"
  //         scrollThreshold="200px"
  //       >
  //         {renderGreetingMessage}
  //         {renderedMessages}
  //         {renderThinkingIndicator}
  //       </InfiniteScroll>
  //     </div>
  //     <MoveToDownButton
  //       movetoDown={moveToDown}
  //       showScrollButton={showScrollButton}
  //       backgroundColor={lighten(theme.palette.secondary.main, 0.1)}
  //     />
  //   </div>
  // );


  const Loader = () => (
    <div className="flex justify-center p-4">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // End message when no more data
  const EndMessage = () => (
    <div className="text-center p-4 text-gray-500">
      Yay! You have seen all items.
    </div>
  );


  return (
    <div
      id="scrollableDiv"
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
        endMessage={<EndMessage />}
        scrollableTarget="scrollableDiv"
        inverse={true}
        style={{
          display: 'flex',
          flexDirection: 'column-reverse'
        }}
      >
        {renderGreetingMessage}
        {renderedMessages}
        {renderThinkingIndicator}
      </InfiniteScroll>
    </div>
  );

}

export default MessageList;


// export default function MessageList() {
//   // State management
//   const [items, setItems] = useState([]);
//   const [hasMore, setHasMore] = useState(true);
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Number of items to fetch per request
//   const itemsPerPage = 20;

//   // Initial load of data
//   useEffect(() => {
//     fetchMoreData();
//   }, []);

//   // Function to fetch more data
//   const fetchMoreData = () => {
//     console.log('first')
//     setLoading(true);

//     // Simulate API call with delay
//     setTimeout(() => {
//       try {
//         // Mock data generation - replace with your API call
//         const newItems = Array(itemsPerPage).fill().map((_, index) => ({
//           id: (page - 1) * itemsPerPage + index + 1,
//           title: `Item ${(page - 1) * itemsPerPage + index + 1}`,
//           description: `This is the description for item ${(page - 1) * itemsPerPage + index + 1}`
//         }));

//         // Append new items to existing items
//         setItems([...items, ...newItems]);

//         // Stop infinite loading after 100 items (for demo purposes)
//         if (items.length + newItems.length >= 1000) {
//           setHasMore(false);
//         }

//         setPage(page + 1);
//         setLoading(false);
//       } catch (err) {
//         setError("Failed to load more data");
//         setLoading(false);
//       }
//     }, 1000);
//   };

//   // Loading indicator component
//   const Loader = () => (
//     <div className="flex justify-center p-4">
//       <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//     </div>
//   );

//   // End message when no more data
//   const EndMessage = () => (
//     <div className="text-center p-4 text-gray-500">
//       Yay! You have seen all items.
//     </div>
//   );

//   // Error display
//   if (error) return <div className="text-red-500 p-4 text-center">{error}</div>;

//   return (
//     <div className="w-full max-w-4xl mx-auto p-4 overflow-auto">
//       <h2 className="text-2xl font-bold mb-6">Infinite Scroll List</h2>

//       <InfiniteScroll
//         dataLength={items.length}
//         next={fetchMoreData}
//         hasMore={hasMore}
//         loader={<Loader />}
//         endMessage={<EndMessage />}
//         scrollThreshold={0.9}
//         className="overflow-hidden"
//         style={{ display: 'flex', flexDirection: 'column-reverse' }}
//         inverse={true}
//       >
//         <div className="space-y-4">
//           {items.map(item => (
//             <div
//               key={item.id}
//               className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
//             >
//               <h3 className="text-lg font-semibold">{item?.title || 'Title'}</h3>
//               <p className="text-gray-600">{item.description || 'description'}</p>
//             </div>
//           ))}
//         </div>
//       </InfiniteScroll>
//     </div>
//   );
// }

// export default function MessageList() {
//   // Parent container ref to make component take available height
//   const containerRef = useRef(null);

//   // State management
//   const [messages, setMessages] = useState([]);
//   const [hasMore, setHasMore] = useState(true);
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Number of messages to fetch per request
//   const messagesPerPage = 15;

//   // Total mock messages available (for demo purposes)
//   const totalAvailableMessages = 100;

//   // Effect to adjust for window resize
//   useEffect(() => {
//     const handleResize = () => {
//       // No specific action needed as we're using flex and viewport units
//     };

//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   // Initial load of data - starting with most recent messages
//   useEffect(() => {
//     // Get the initial batch of messages (most recent)
//     fetchMessages();
//   }, []);

//   // Function to fetch older messages
//   const fetchMessages = () => {
//     setLoading(true);

//     // Simulate API call with delay
//     setTimeout(() => {
//       try {
//         // Calculate starting message index for this page
//         // This creates messages in reverse chronological order
//         const startIdx = totalAvailableMessages - (page * messagesPerPage);

//         // Create new batch of messages
//         const newMessages = Array(messagesPerPage).fill().map((_, index) => {
//           const messageId = Math.max(1, startIdx + index + 1);

//           // Don't create messages beyond our total available
//           if (messageId > totalAvailableMessages || messageId <= 0) return null;

//           return {
//             id: messageId,
//             text: `This is message #${messageId}`,
//             sender: messageId % 3 === 0 ? 'other' : 'self',
//             timestamp: new Date(Date.now() - (totalAvailableMessages - messageId) * 60000).toISOString()
//           };
//         }).filter(Boolean); // Remove null items

//         // Append older messages to existing messages
//         setMessages([...messages, ...newMessages]);

//         // Stop infinite loading when we've loaded all messages
//         if (startIdx <= 0) {
//           setHasMore(false);
//         }

//         setPage(page + 1);
//         setLoading(false);
//       } catch (err) {
//         setError("Failed to load older messages");
//         setLoading(false);
//       }
//     }, 800);
//   };

//   // Format timestamp into readable format
//   const formatTime = (timestamp) => {
//     const date = new Date(timestamp);
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   // Loading indicator component
//   const Loader = () => (
//     <div className="flex justify-center p-2">
//       <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//     </div>
//   );

//   // End message when no more data
//   const EndMessage = () => (
//     <div className="text-center p-2 text-gray-500 text-sm">
//       No more messages to load
//     </div>
//   );

//   // Error display
//   if (error) return <div className="text-red-500 p-4 text-center">{error}</div>;
//   return (
//     <div
//       id="scrollableDiv"
//       className="w-full h-full flex-1 overflow-auto"
//       style={{
//         display: 'flex',
//         flexDirection: 'column-reverse',
//         minHeight: 0 // Important for flex child to properly scroll
//       }}
//     >
//       <InfiniteScroll
//         dataLength={messages.length}
//         next={fetchMessages}
//         hasMore={hasMore}
//         loader={<Loader />}
//         endMessage={<EndMessage />}
//         scrollableTarget="scrollableDiv"
//         inverse={true}
//         style={{
//           display: 'flex',
//           flexDirection: 'column-reverse'
//         }}
//       >
//         <div className="flex flex-col-reverse gap-2 px-2">
//           {messages.map((message) => (
//             <div
//               key={message.id}
//               className={`p-3 rounded-lg max-w-xs ${message.sender === 'self'
//                 ? 'bg-blue-500 text-white self-end'
//                 : 'bg-gray-200 text-gray-800 self-start'
//                 }`}
//             >
//               <p>{message.text}</p>
//               <div
//                 className={`text-xs mt-1 ${message.sender === 'self' ? 'text-blue-100' : 'text-gray-500'
//                   }`}
//               >
//                 {formatTime(message.timestamp)}
//               </div>
//             </div>
//           ))}
//         </div>
//       </InfiniteScroll>
//     </div>
//   );
// }