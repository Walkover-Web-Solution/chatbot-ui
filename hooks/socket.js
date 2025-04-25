// import { useCustomSelector } from "@/utils/deepCheckSelector";
// import { useEffect, useReducer, useRef } from "react";
// // import/no-extraneous-dependencies
// import io from "socket.io-client";

// const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

// const forceUpdateReducer = (x) => x + 1;
// const useSocket = () => {
//   const [, forceUpdate] = useReducer(forceUpdateReducer, 0);
//   const socketRef = useRef(null);
//   const { jwtToken, channelId, eventChannels, channelListData } = useCustomSelector((state) => ({
//     jwtToken: state.Hello?.socketJwt?.jwt,
//     channelId: state.Hello?.Channel?.channel || null,
//     channelListData: state.Hello?.channelListData?.channels || [],
//     eventChannels: state.Hello?.widgetInfo?.event_channels || [],
//   }));

//   useEffect(() => {
//     if (!jwtToken) return;
//     const socketInstance = io(socketUrl, {
//       auth: { token: jwtToken || jwtToken.jwt_token },
//       transports: ['websocket', 'polling'],
//       reconnection: true,
//       timeout: 20000,
//       autoConnect: true,
//     });

//     socketInstance.on("connect", () => {
//       console.log("Connected to WebSocket server", channelId);
//       if (channelId) {
//         const channels = channelListData ? (channelListData.length > 0 ? channelListData?.map((channel) => channel?.channel) : []) : [channelId];
//         channels.push(...eventChannels);
//         socketInstance.emit("subscribe", { channel: channels }, (data) => {
//           console.log("Subscribed channels data:", data);
//         });
//       }
//     });

//     socketInstance.on("disconnect", () => {
//       console.log("Disconnected from WebSocket server");
//     });

//     socketInstance.on("connect_error", (err) => {
//       console.error("Connection Error:", err);
//     });

//     socketRef.current = socketInstance;
//     forceUpdate();

//     // eslint-disable-next-line consistent-return
//     return () => {
//       socketInstance.disconnect();
//     };
//   }, [jwtToken, channelId, eventChannels, channelListData]);

//   return socketRef.current;
// };

// export default useSocket;




// import { useEffect, useRef } from "react";
// import { useCustomSelector } from "@/utils/deepCheckSelector";
// import socketManager from "./socketManager"; // Import the singleton socket manager

// const useSocket = () => {
//   // const socketRef = useRef(null);
//   const { jwtToken, channelId, eventChannels, channelListData } = useCustomSelector((state) => ({
//     jwtToken: state.Hello?.socketJwt?.jwt,
//     channelId: state.Hello?.Channel?.channel || null,
//     channelListData: state.Hello?.channelListData?.channels || [],
//     eventChannels: state.Hello?.widgetInfo?.event_channels || [],
//   }));

//   useEffect(() => {
//     if (!jwtToken) return;

//     // Connect socket using the manager
//     socketManager.connect(jwtToken);

//     // Setup channels for subscription
//     if (channelId) {
//       // Create array of channels to subscribe to
//       const channels = [];
      
//       // Add channels from channelListData if available
//       if (channelListData && channelListData.length > 0) {
//         channels.push(...channelListData.map((channel) => channel?.channel).filter(Boolean));
//       } else if (channelId) {
//         // Otherwise use the single channelId
//         channels.push(channelId);
//       }
      
//       // Add event channels if available
//       if (eventChannels && eventChannels.length > 0) {
//         channels.push(...eventChannels.filter(Boolean));
//       }
      
//       // Subscribe to channels using the manager
//       if (channels.length > 0 && socketManager.isConnected) {
//         debugger
//         socketManager.subscribe(channels);
//       }
//     }

//     // Store the socket manager reference
//     // socketRef.current = socketManager;

//     // Cleanup function - no need to disconnect as the manager handles multiple components
//     return () => {
//       // We don't disconnect here as other components might be using the socket
//       // The socket manager will handle cleanup when the app unmounts
//     };
//   }, [jwtToken, channelId, eventChannels, channelListData, socketManager.isConnected]);

//   return null;
// };

// export default useSocket;



import { useEffect } from "react";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import socketManager from "./socketManager"; // Import the singleton socket manager

const useSocket = () => {
  const { jwtToken, channelId, eventChannels, channelListData } = useCustomSelector((state) => ({
    jwtToken: state.Hello?.socketJwt?.jwt,
    channelId: state.Hello?.Channel?.channel || null,
    channelListData: state.Hello?.channelListData?.channels || [],
    eventChannels: state.Hello?.widgetInfo?.event_channels || [],
  }));

  useEffect(() => {
    if (!jwtToken) return;

    // Connect socket using the manager
    socketManager.connect(jwtToken);

    // Setup channels for subscription
    if (channelId) {
      // Create array of channels to subscribe to
      const channels = [];
      
      // Add channels from channelListData if available
      if (channelListData && channelListData.length > 0) {
        channels.push(...channelListData.map((channel) => channel?.channel).filter(Boolean));
      } else if (channelId) {
        // Otherwise use the single channelId
        channels.push(channelId);
      }
      
      // Add event channels if available
      if (eventChannels && eventChannels.length > 0) {
        channels.push(...eventChannels.filter(Boolean));
      }
      
      // Subscribe to channels using the manager - no need to check isConnected
      // since the subscribe method now handles waiting for connection
      if (channels.length > 0) {
        socketManager.subscribe(channels)
          .catch(error => {
            console.error("Failed to subscribe to channels:", error);
          });
      }
    }

    // Cleanup function - no need to disconnect as the manager handles multiple components
    return () => {
      // We don't disconnect here as other components might be using the socket
      // The socket manager will handle cleanup when the app unmounts
    };
  }, [jwtToken, channelId, eventChannels, channelListData]);

  return null;
};

export default useSocket;