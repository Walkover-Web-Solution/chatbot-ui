import React from 'react'

function RenderHelloVedioCallMessage({message}:any) {
  // Calculate expiration time if available
  const calculateExpirationTime = () => {
    const expirationTime = message?.messageJson?.expiration_time;
    if (!expirationTime) return null;
    
    const now = Date.now();
    const timeLeft = expirationTime - now;
    
    if (timeLeft <= 0) return "Meet has expired";
    
    const minutesLeft = Math.floor(timeLeft / (1000 * 60));
    return `Note: Meet will expire in next ${minutesLeft} mins`;
  };

  const expirationNote = calculateExpirationTime();
  const isMeetExpired = expirationNote === "Meet has expired";

  const handleJoinCall = () => {
    if (!isMeetExpired && (message?.content || message?.messageJson?.text)) {
      window.open(message?.content || message?.messageJson?.text, "_blank");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button 
        onClick={handleJoinCall}
        style={{ maxWidth: '220px' }}
        className={`px-4 py-2 ${isMeetExpired ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-md transition-colors flex items-center gap-2`}
        disabled={isMeetExpired}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 7l-7 5 7 5V7z"></path>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
        </svg>
        Click here to join Meet
      </button>
      {expirationNote && (
        <div className={`text-sm ${isMeetExpired ? 'text-red-600' : 'text-gray-600'}`}>
          {expirationNote}
        </div>
      )}
    </div>
  );
}

export default RenderHelloVedioCallMessage