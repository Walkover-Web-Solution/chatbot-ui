// CallUI.tsx
import React, { useEffect, useRef } from 'react';
import { useCallUI } from '../Chatbot/hooks/useCallUI';
import './CallUI.css';

const CallUI: React.FC = () => {
    const {
        callState,
        isMuted,
        mediaStream,
        makeCall,
        answerCall,
        endCall,
        toggleMute
    } = useCallUI();

    const audioRef = useRef<HTMLAudioElement>(null);

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
                return (
                    <div className="call-container">
                        <h3>Voice Call</h3>
                        <button onClick={makeCall} className="call-button">
                            Make Call
                        </button>
                    </div>
                );

            case 'ringing':
                return (
                    <div className="call-container">
                        <h3>Calling...</h3>
                        <div className="call-animation">
                            <div className="ripple"></div>
                        </div>
                        <div className="call-actions">
                            <button onClick={endCall} className="end-button">
                                Decline
                            </button>
                        </div>
                    </div>
                );

            case 'connected':
                return (
                    <div className="call-container">
                        <h3>Call in Progress</h3>
                        <div className="call-timer">
                            <CallTimer />
                        </div>
                        <div className="call-actions">
                            <button
                                onClick={toggleMute}
                                className={`mute-button ${isMuted ? 'muted' : ''}`}
                            >
                                {isMuted ? 'Unmute' : 'Mute'}
                            </button>
                            <button onClick={endCall} className="end-button">
                                End Call
                            </button>
                        </div>
                        {/* Hidden audio element to play remote audio */}
                        <audio ref={audioRef} autoPlay />
                    </div>
                );

            case 'ended':
                return (
                    <div className="call-container">
                        <h3>Call Ended</h3>
                        <button onClick={makeCall} className="call-button">
                            Call Again
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="call-ui">
            {renderCallUI()}
        </div>
    );
};

// Simple call timer component
const CallTimer: React.FC = () => {
    const [seconds, setSeconds] = React.useState(0);

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