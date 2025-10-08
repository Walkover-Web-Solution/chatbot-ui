// useCallUI.ts
import { setDataInAppInfoReducer } from '@/store/appInfo/appInfoSlice';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import helloVoiceService from './HelloVoiceService';
import { useChatActions } from './useChatActions';

export const useCallUI = () => {
  const [callState, setCallState] = useState<"idle" | "ringing" | "connected" | "ended" | "rejoined">("idle");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [mediaStream, setMediaStream] = useState<any>(null);
  const [rejoinSummary, setRejoinSummary] = useState<any>(null);
  const [transcripts, setTranscripts] = useState<Array<{message: string, from: string, timestamp: number}>>([]);
  const dispatch = useDispatch();
  const { clearCallVoiceHistory } = useChatActions();

  useEffect(() => {
    // Initialize service if not already done
    // if (!helloVoiceService.isInitialized()) {
    // helloVoiceService.initialize();
    // }

    // Set initial state
    setCallState(helloVoiceService.getCallState() as "idle" | "ringing" | "connected" | "ended" | "rejoined");
    setIsMuted(helloVoiceService.getMuteStatus());

    // Set up event listeners
    const handleCallStateChange = ({ state, mediaStream, data }: any) => {
      setCallState(state);
      if (mediaStream) {
        setMediaStream(mediaStream);
      }
      if (state === 'connected' && data?.id) {
        dispatch(setDataInAppInfoReducer({ callToken: data?.id }))
      } else if (state === 'idle') {
        dispatch(setDataInAppInfoReducer({ callToken: '' }))
        setRejoinSummary(null)
        setTranscripts([])
      } else if (state === 'rejoined') {
        setRejoinSummary(data?.summary)
      }
    };

    const handleMuteChange = ({ muted }: any) => {
      setIsMuted(muted);
    };

    const handleMessageReceived = ({ message, from, timestamp }: any) => {
      setTranscripts(prev => [...prev, { message, from, timestamp }]);
    };

    helloVoiceService.addEventListener("callStateChanged", handleCallStateChange);
    helloVoiceService.addEventListener("muteStatusChanged", handleMuteChange);
    helloVoiceService.addEventListener("messageReceived", handleMessageReceived);

    // Clean up event listeners
    return () => {
      helloVoiceService.removeEventListener("callStateChanged", handleCallStateChange);
      helloVoiceService.removeEventListener("muteStatusChanged", handleMuteChange);
      helloVoiceService.removeEventListener("messageReceived", handleMessageReceived);
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
    clearCallVoiceHistory();
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
    toggleMute,
    rejoinSummary,
    transcripts
  };
};