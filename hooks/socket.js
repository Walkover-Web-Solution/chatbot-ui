import { useCustomSelector } from "@/utils/deepCheckSelector";
import { useEffect, useReducer, useRef } from "react";
// import/no-extraneous-dependencies
import io from "socket.io-client";

const forceUpdateReducer = (x) => x + 1;
const useSocket = () => {
  const [, forceUpdate] = useReducer(forceUpdateReducer, 0);
  const socketRef = useRef(null);
  const { jwtToken, channelId, eventChannels } = useCustomSelector((state) => ({
    jwtToken: state.Hello?.socketJwt?.jwt,
    channelId: state.Hello?.Channel?.channel || null,
    eventChannels: state.Hello?.widgetInfo?.event_channels || [],
  }));

  useEffect(() => {
    if (!jwtToken) return;

    const socketUrl = "https://chat.phone91.com/";
    const socketInstance = io(socketUrl, {
      auth: { token: jwtToken.jwt_token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      timeout: 20000,
      autoConnect: true,
    });

    socketInstance.on("connect", () => {
      console.log("Connected to WebSocket server");
      if (channelId) {
        const channels = [channelId];
        eventChannels.forEach((event_channel) => {
          if (!event_channel.includes("-chat-typing")) {
            channels.push(event_channel);
          }
        });
        socketInstance.emit("subscribe", { channel: channels }, (data) => {
          console.log("Subscribed channels data:", data);
        });
      }
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Connection Error:", err);
    });

    socketRef.current = socketInstance;
    forceUpdate();

    // eslint-disable-next-line consistent-return
    return () => {
      socketInstance.disconnect();
    };
  }, [jwtToken, channelId, eventChannels]);

  return socketRef.current;
};

export default useSocket;
