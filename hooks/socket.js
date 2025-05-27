import { useEffect } from "react";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import socketManager from "./socketManager"; // Import the singleton socket manager

const useSocket = ({chatSessionId}) => {
  const { jwtToken, channelId, eventChannels, channelListData } = useCustomSelector((state) => ({
    jwtToken: state.Hello?.[chatSessionId]?.socketJwt?.jwt,
    channelId: state.Hello?.[chatSessionId]?.Channel?.channel || null,
    channelListData: state.Hello?.[chatSessionId]?.channelListData?.channels || [],
    eventChannels: state.Hello?.[chatSessionId]?.widgetInfo?.event_channels || [],
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