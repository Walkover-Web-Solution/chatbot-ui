import { useEffect, useRef } from "react";
import WebRTC from "msg91-webrtc-call";

const useHelloVoiceIntegration = ({ user }: { user: any }) => {
  const webrtcRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;

    const webrtc = WebRTC(JSON.stringify(user));
    webrtcRef.current = webrtc;

    const handleCall = (call: any) => {
      if (call.type === "incoming-call") {
        // Handle incoming call
        call.accept();
      }
    };

    webrtc.on("call", handleCall);

    return () => {
      webrtc.off("call", handleCall);
    };
  }, [user]);

  const initiateCall = (callee: any) => {
    if (webrtcRef.current) {
      webrtcRef.current.call(JSON.stringify(callee));
    }
  };

  return { initiateCall };
};

export default useHelloVoiceIntegration;
