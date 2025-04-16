import { useCustomSelector } from "@/utils/deepCheckSelector";
import { useEffect, useReducer, useRef } from "react";
// import/no-extraneous-dependencies
import io from "socket.io-client";

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

const forceUpdateReducer = (x) => x + 1;
const useSocket = () => {
  const [, forceUpdate] = useReducer(forceUpdateReducer, 0);
  const socketRef = useRef(null);
  const { jwtToken, channelId, eventChannels, channelListData } = useCustomSelector((state) => ({
    jwtToken: state.Hello?.socketJwt?.jwt,
    channelId: state.Hello?.Channel?.channel || null,
    channelListData: state.Hello?.channelListData?.channels || [],
    eventChannels: state.Hello?.widgetInfo?.event_channels || [],
  }));

  useEffect(() => {
    if (!jwtToken) return;
    const socketInstance = io(socketUrl, {
      auth: { token: jwtToken || jwtToken.jwt_token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      timeout: 20000,
      autoConnect: true,
    });

    socketInstance.on("connect", () => {
      console.log("Connected to WebSocket server", channelId);
      if (channelId) {
        const channels = channelListData ? (channelListData.length > 0 ? channelListData?.map((channel) => channel?.channel) : []) : [channelId];
        channels.push(...eventChannels);
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
  }, [jwtToken, channelId, eventChannels, channelListData]);

  return socketRef.current;
};

export default useSocket;
