import React from 'react'

interface ChatbotProviderProps {
    // Define any props needed for the ChatbotProvider
    embedToken: string;
}
function ChatbotProvider({ embedToken }: ChatbotProviderProps) {
    return (
        <div className='w-full, h-full'>ChatbotProvider</div>
    )
}

export default ChatbotProvider