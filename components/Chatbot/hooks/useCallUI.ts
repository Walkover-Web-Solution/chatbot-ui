// useCallUI.ts
import { useState, useEffect } from 'react';
import helloVoiceService from './HelloVoiceService';

export const useCallUI = () => {
  const [callState, setCallState] = useState<"idle" | "ringing" | "connected" | "ended">("idle");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [mediaStream, setMediaStream] = useState<any>(null);

  useEffect(() => {
    // Initialize service if not already done
    if (!helloVoiceService.isInitialized()) {
      helloVoiceService.initialize();
    }

    // Set initial state
    setCallState(helloVoiceService.getCallState());
    setIsMuted(helloVoiceService.getMuteStatus());

    // Set up event listeners
    const handleCallStateChange = ({ state, mediaStream, data }: any) => {
      setCallState(state);
      if (mediaStream) {
        setMediaStream(mediaStream);
      }
    };

    const handleMuteChange = ({ muted }: any) => {
      setIsMuted(muted);
    };

    helloVoiceService.addEventListener("callStateChanged", handleCallStateChange);
    helloVoiceService.addEventListener("muteStatusChanged", handleMuteChange);

    // Clean up event listeners
    return () => {
      helloVoiceService.removeEventListener("callStateChanged", handleCallStateChange);
      helloVoiceService.removeEventListener("muteStatusChanged", handleMuteChange);
    };
  }, []);

  const makeCall = () => {
    helloVoiceService.initiateCall();
  };

  const answerCall = () => {
    helloVoiceService.answerCall();
  };

  const endCall = () => {
    helloVoiceService.endCall();
  };

  const toggleMute = () => {
    helloVoiceService.toggleMute();
  };

  return {
    callState,
    isMuted,
    mediaStream,
    makeCall,
    answerCall,
    endCall,
    toggleMute
  };
};