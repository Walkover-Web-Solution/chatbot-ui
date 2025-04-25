import { TrendingUp } from 'lucide-react';
import { SendMessagePayloadType } from '../Chatbot/hooks/chatTypes';
import { useContext } from 'react';
import { MessageContext } from './InterfaceChatbot';

function StarterQuestions() {
    const {
        starterQuestions,
        sendMessage
    } = useContext(MessageContext)
    
    if (starterQuestions?.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-4 w-full max-5xl">
            {starterQuestions?.map((question: string, index: number) => (
                <div
                    key={index}
                    onClick={() => sendMessage({ message: question })}
                    className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer"
                >
                    <div className="p-3">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-gray-700 text-sm font-medium line-clamp-2">
                                {question}
                            </p>
                            <TrendingUp />
                        </div>
                        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-primary-500 to-primary-600 transform scale-x-0 transition-transform group-hover:scale-x-100" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default StarterQuestions;