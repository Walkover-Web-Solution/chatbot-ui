// CallUI.tsx
import { Mic, MicOff, Phone } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { useCallUI } from '../Chatbot/hooks/useCallUI';
import { useScreenSize } from '../Chatbot/hooks/useScreenSize';
import './CallUI.css';

const CallUI: React.FC = () => {
    const {
        callState,
        isMuted,
        mediaStream,
        endCall,
        toggleMute,
        rejoinSummary
    } = useCallUI();

    const audioRef = useRef<HTMLAudioElement>(null);
    const { isSmallScreen } = useScreenSize();

    // Connect media stream to audio element when available
    useEffect(() => {
        if (mediaStream && audioRef.current) {
            audioRef.current.srcObject = mediaStream;
        }
    }, [mediaStream]);

    // Render different UI based on call state
    const renderCallUI = () => {
        switch (callState) {
            case 'idle':
                return null;

            case 'ringing':
                return (
                    <div className="flex flex-row items-center w-full justify-between px-3">
                        <h3 className="text-md">Calling...</h3>
                        <div className="flex items-center">
                            <div className="call-animation">
                                <div className="ripple"></div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={endCall}
                                className="p-2 rounded-full button-hover text-red-500 transition-colors end-button"
                                aria-label="End Call"
                            >
                                <Phone style={{ transform: 'rotate(135deg)' }} size={18} />
                            </button>
                        </div>
                    </div>
                );

            case 'connected':
            case 'rejoined':
                return (
                    <div className="flex flex-row items-center justify-between px-3 w-full">
                        <h3 className="text-md">Ongoing Call</h3>
                        <div className="flex items-center">
                            <CallTimer answeredAt={rejoinSummary?.answeredAt} />
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={toggleMute}
                                className={`p-2 rounded-full button-hover transition-colors ${isMuted ? 'bg-orange-500' : 'bg-blue-500'} text-white`}
                                aria-label={isMuted ? 'Unmute' : 'Mute'}
                            >
                                {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                            </button>
                            <button
                                onClick={endCall}
                                className="p-2 rounded-full button-hover transition-colors bg-red-500 text-white"
                                aria-label="End Call"
                            >
                                <Phone style={{ transform: 'rotate(135deg)' }} size={18} />
                            </button>
                        </div>
                        <audio ref={audioRef} autoPlay />
                    </div>
                );

            case 'ended':
                return null;

            default:
                return null;
        }
    };

    const [isVisible, setIsVisible] = React.useState(false);

    // Handle the two-phase animation
    useEffect(() => {
        if (callState !== 'idle') {
            // First make it render
            // Short delay to ensure DOM is ready before animating
            setTimeout(() => setIsVisible(true), 50);
        } else {
            // First hide with animation
            setIsVisible(false);
            // Then remove from DOM after animation completes
        }
    }, [callState]);

    // Don't render anything if not needed
    if (callState === 'idle') {
        return null;
    }

    return (
        <div
            className={`transition-all duration-500 ease-in-out transform
                   ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
                   flex items-center justify-center mx-auto p-3 bg-white
                   ${isSmallScreen ? 'w-full' : 'w-1/2 max-w-lg'}
                   border border-gray-300 rounded-bl-lg rounded-br-lg
                   shadow-lg overflow-hidden`}
        >
            {renderCallUI()}
        </div>
    );
};

// Simple call timer component
const CallTimer: React.FC<{ answeredAt: number }> = ({ answeredAt = 0 }) => {
    const [seconds, setSeconds] = React.useState(() => {
        if (answeredAt) {
            const answeredTime = new Date(answeredAt).getTime();
            const now = Date.now();
            const diffInSeconds = Math.floor((now - answeredTime) / 1000);
            return Math.max(diffInSeconds, 0);
        }
        return 0;
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return <div className="timer">{formatTime(seconds)}</div>;
};

export default CallUI;