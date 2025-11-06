import { useSendMessage } from '@/components/Chatbot/hooks/useChatActions';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import { TrendingUp } from 'lucide-react';
import { useTheme } from '@mui/material';
import { useMemo } from 'react';

function StarterQuestions() {
    const sendMessage = useSendMessage({});
    const theme = useTheme();

    const { starterQuestions } = useCustomSelector((state) => ({
        starterQuestions: state.Chat.starterQuestions || []
    }))

    if (starterQuestions?.length === 0) return null;

    const cardStyles = useMemo(() => ({
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#ffffff',
        borderColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#e5e7eb',
        color: theme.palette.text.primary,
    }), [theme]);

    const iconColor = theme.palette.text.secondary;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-4 w-full max-5xl">
            {starterQuestions?.map((question: string, index: number) => (
                <div
                    key={index}
                    onClick={() => sendMessage({ message: question })}
                    className="group relative overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer"
                    style={cardStyles}
                >
                    <div className="p-3">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium line-clamp-2" style={{ color: theme.palette.text.primary }}>
                                {question}
                            </p>
                            <TrendingUp color={iconColor} />
                        </div>
                        <div
                            className="absolute bottom-0 left-0 h-0.5 w-full transform scale-x-0 transition-transform group-hover:scale-x-100"
                            style={{
                                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark || theme.palette.primary.main})`
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default StarterQuestions;