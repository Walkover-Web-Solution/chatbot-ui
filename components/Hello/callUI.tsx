// CallUI.tsx
import { Mic, MicOff, Phone, Maximize2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useCallUI } from '../Chatbot/hooks/useCallUI';
import { useScreenSize } from '../Chatbot/hooks/useScreenSize';
import './CallUI.css';


// Simple call timer display component
const CallTimer: React.FC<{ seconds: number }> = ({ seconds }) => {
    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return <div className="timer">{formatTime(seconds)}</div>;
};

const CallUI: React.FC = () => {
    const {
        callState,
        isMuted,
        mediaStream,
        endCall,
        toggleMute,
        rejoinSummary,
        transcripts
    } = useCallUI();

    const audioRef = useRef<HTMLAudioElement>(null);
    const { isSmallScreen } = useScreenSize();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [callTimerSeconds, setCallTimerSeconds] = useState(0);

    // Connect media stream to audio element when available
    useEffect(() => {
        if (mediaStream && audioRef.current) {
            // Ensure we don't reassign the same stream
            if (audioRef.current.srcObject !== mediaStream) {
                audioRef.current.srcObject = mediaStream;
                // Ensure playback continues
                audioRef.current.play().catch(error => {
                    console.log('Audio play failed:', error);
                });
            }
        }
    }, [mediaStream]);

    // Ensure audio continues playing when switching views
    useEffect(() => {
        if (audioRef.current && audioRef.current.srcObject) {
            audioRef.current.play().catch(error => {
                console.log('Audio play failed on view switch:', error);
            });
        }
    }, [isFullscreen]);

    // Handle call timer - initialize and run timer
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (callState === 'connected' || callState === 'rejoined') {
            // Initialize timer based on rejoinSummary if available
            if (rejoinSummary?.answeredAt) {
                const answeredTime = new Date(rejoinSummary.answeredAt).getTime();
                const now = Date.now();
                const diffInSeconds = Math.floor((now - answeredTime) / 1000);
                setCallTimerSeconds(Math.max(diffInSeconds, 0));
            } else {
                setCallTimerSeconds(0);
            }

            // Start the timer
            interval = setInterval(() => {
                setCallTimerSeconds(prev => prev + 1);
            }, 1000);
        } else {
            // Reset timer when call is not active
            setCallTimerSeconds(0);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [callState, rejoinSummary?.answeredAt]);

    // Format timestamp for display (removed as timestamps are commented out)

    // // Close fullscreen on escape key
    // useEffect(() => {
    //     const handleEscKey = (e: KeyboardEvent) => {
    //         if (e.key === 'Escape' && isFullscreen) {
    //             setIsFullscreen(false);
    //         }
    //     };
    //     document.addEventListener('keydown', handleEscKey);
    //     return () => document.removeEventListener('keydown', handleEscKey);
    // }, [isFullscreen]);

    // Render the compact call banner
    const renderCompactBanner = () => {
        switch (callState) {
            case 'ringing':
                return (
                    <div className="flex flex-row items-center w-full justify-between px-3">
                        <h3 className="text-base">Calling...</h3>
                        <div className="flex items-center">
                            <div className="call-animation">
                                <div className="ripple"></div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsFullscreen(true)}
                                className="p-2 rounded-full button-hover text-blue-500 transition-colors"
                                aria-label="Fullscreen"
                            >
                                <Maximize2 size={18} />
                            </button>
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
                        <h3 className="text-base">Ongoing Call</h3>
                        <div className="flex items-center">
                            <CallTimer seconds={callTimerSeconds} />
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={toggleMute}
                                className={`p-2 rounded-full button-hover transition-colors ${isMuted ? 'bg-orange-400 text-white' : 'text-black'
                                    }`}
                                aria-label={isMuted ? 'Unmute' : 'Mute'}
                            >
                                {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                            </button>
                            <button
                                onClick={() => setIsFullscreen(true)}
                                className="p-2 rounded-full button-hover text-blue-500 transition-colors"
                                aria-label="Fullscreen"
                            >
                                <Maximize2 size={18} />
                            </button>
                            <button
                                onClick={endCall}
                                className="p-2 rounded-full button-hover transition-colors bg-red-500 text-white"
                                aria-label="End Call"
                            >
                                <Phone style={{ transform: 'rotate(135deg)' }} size={18} />
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // Render fullscreen phone call UI
    const renderFullscreenUI = () => {
        return (
            <div
                className="fixed inset-0 z-[9999] bg-cover bg-center bg-no-repeat flex flex-col"
                style={{
                    backgroundImage: 'url(/Galaxy.png)'
                }}
            >
                {/* Close button */}
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={() => setIsFullscreen(false)}
                        className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                        aria-label="Close fullscreen"
                    >
                        <X size={22} className="text-white" />
                    </button>
                </div>

                {/* Content area with fixed header and scrollable transcripts */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Call info - fixed header */}
                    <div className="flex-shrink-0 text-center pt-6 pb-4">
                        <h1 className="text-xl font-light text-white mb-1">
                            {callState === 'ringing' ? 'Calling AI Assistant...' : 'Voice Assistant'}
                        </h1>

                        {/* Status and Timer combined */}
                        <div className="flex items-center justify-center space-x-2 text-white/80">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            {(callState === 'connected' || callState === 'rejoined') ? (
                                <div className="text-lg font-light">
                                    <CallTimer seconds={callTimerSeconds} />
                                </div>
                            ) : (
                                <span className="text-lg">Connecting...</span>
                            )}
                        </div>
                    </div>

                    {/* Transcripts section - scrollable */}
                    <div className="flex-1 overflow-hidden">
                        <div className="h-full overflow-y-auto px-6 py-2">
                            <div className="space-y-3 pb-4">
                                {transcripts.length === 0 ? (
                                    <div className="flex items-center justify-center h-32">
                                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                                            <p className="text-center text-white/80">Transcripts will appear here during the conversation</p>
                                        </div>
                                    </div>
                                ) : (
                                    transcripts.map((transcript, index) => (
                                        <div
                                            key={index}
                                            className={`flex ${transcript.from === 'user' ? 'justify-end' : 'justify-start'
                                                }`}
                                        >
                                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl text-sm shadow-lg ${transcript.from === 'user'
                                                ? 'bg-blue-300 text-white'
                                                : 'bg-white/10 backdrop-blur-sm text-white'
                                                }`} style={{ backgroundColor: transcript.from === 'user' ? '#29486b' : '' }}>
                                                <div className="text-xs opacity-75 mb-1">
                                                    {transcript.from === 'user' ? 'You' : 'Assistant'}
                                                </div>
                                                <div>{transcript.message}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom call controls - fixed at bottom */}
                <div className="flex-shrink-0 pb-6">
                    <div className="flex items-center justify-center space-x-8">
                        {(callState === 'connected' || callState === 'rejoined') && (
                            <button
                                onClick={toggleMute}
                                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${isMuted
                                    ? 'bg-red-500 text-white shadow-lg'
                                    : 'text-white hover:text-white/80'
                                    }`}
                                aria-label={isMuted ? 'Unmute' : 'Mute'}
                            >
                                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                            </button>
                        )}

                        <button
                            onClick={endCall}
                            className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all duration-200 shadow-lg hover:scale-105"
                            aria-label="End Call"
                        >
                            <Phone style={{ transform: 'rotate(135deg)' }} size={24} />
                        </button>
                    </div>
                </div>

            </div>
        );
    };

    const [isVisible, setIsVisible] = React.useState(false);

    // Handle the two-phase animation and reset fullscreen on call end
    useEffect(() => {
        if (callState !== 'idle') {
            // First make it render
            // Short delay to ensure DOM is ready before animating
            setTimeout(() => setIsVisible(true), 50);
        } else {
            // First hide with animation
            setIsVisible(false);
            // Reset fullscreen state when call ends
            setIsFullscreen(false);
            // Then remove from DOM after animation completes
        }
    }, [callState]);

    // Don't render anything if not needed
    if (callState === 'idle') {
        return null;
    }

    return (
        <>
            {/* Audio element - always rendered first to maintain continuity */}
            <audio ref={audioRef} autoPlay style={{ display: 'none' }} />

            {/* Render fullscreen modal if active */}
            {isFullscreen ? (
                <div className={`${isSmallScreen ? 'w-full' : 'w-1/2 max-w-lg'}`}>
                    {renderFullscreenUI()}
                </div>
            ) : (
                <div
                    className={`transition-all duration-500 ease-in-out transform
                           ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
                           flex items-center justify-center mx-auto p-3 bg-white
                           ${isSmallScreen ? 'w-full' : 'w-1/2 max-w-lg'}
                           border border-gray-300 rounded-bl-lg rounded-br-lg
                           shadow-lg overflow-hidden`}
                >
                    {renderCompactBanner()}
                </div>
            )}
        </>
    );
};

export default CallUI;