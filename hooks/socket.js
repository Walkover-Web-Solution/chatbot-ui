import { useEffect } from "react";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import socketManager from "./socketManager"; // Import the singleton socket manager
import { getLocalStorage } from "@/utils/utilities";

const useSocket = ({ chatSessionId }) => {
  const { jwtToken, eventChannels, channelListData, company_id } = useCustomSelector((state) => ({
    jwtToken: state.Hello?.[chatSessionId]?.socketJwt?.jwt,
    channelListData: state.Hello?.[chatSessionId]?.channelListData?.channels || [],
    eventChannels: state.Hello?.[chatSessionId]?.widgetInfo?.event_channels || [],
    company_id: state.Hello?.[chatSessionId]?.widgetInfo?.company_id || [],
  }));

  useEffect(() => {
    if (!jwtToken) return;

    // Connect socket using the manager
    socketManager.connect(jwtToken);

    // Setup channels for subscription
    const clientId = getLocalStorage('k_clientId') || getLocalStorage('a_clientId')

      // Create array of channels to subscribe to
      const channels = [];

      // Add user events channels via clientId
      if (company_id && clientId) {
        channels.push(`ch-comp-${company_id}-${clientId}`);
      }

      // Add channels from channelListData if available
      if (channelListData && channelListData.length > 0) {
        channels.push(...channelListData.map((channel) => channel?.channel).filter(Boolean));
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


    // Cleanup function - no need to disconnect as the manager handles multiple components
    return () => {
      // We don't disconnect here as other components might be using the socket
      // The socket manager will handle cleanup when the app unmounts
    };
  }, [jwtToken, eventChannels, channelListData]);

  return null;
};

export default useSocket;