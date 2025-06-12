'use client';
import React from 'react';
import ChatbotWrapper from '@/components/Chatbot-Wrapper/ChatbotWrapper';

export const runtime = 'edge';
// export function generateStaticParams() {
//     return [{ chatbotId: 'hello' }];
// }

function Chatbot() {
    return (
        <ChatbotWrapper />
    )
}

export default Chatbot