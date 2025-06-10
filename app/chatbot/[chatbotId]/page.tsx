import ChatbotWrapper from '@/components/Chatbot-Wrapper/ChatbotWrapper';

export function generateStaticParams() {
    return [{ chatbotId: 'hello' }];
}

function Chatbot() {
    return (
        <ChatbotWrapper />
    )
}

export default Chatbot