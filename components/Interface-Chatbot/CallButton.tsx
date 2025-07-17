import { addUrlDataHoc } from '@/hoc/addUrlDataHoc';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import { darken, lighten } from '@mui/material';
import { Phone } from 'lucide-react';
import React from 'react';
import helloVoiceService from '../Chatbot/hooks/HelloVoiceService';
import { useCallUI } from '../Chatbot/hooks/useCallUI';
import { useColor } from '../Chatbot/hooks/useColor';

interface CallButtonProps {
    chatSessionId: string
}

function CallButton({ chatSessionId }: CallButtonProps) {
    const { isHelloUser, voice_call_widget } = useCustomSelector((state) => ({
        isHelloUser: state.draftData?.isHelloUser || false,
        voice_call_widget: state.Hello?.[chatSessionId]?.widgetInfo?.voice_call_widget || false
    }));
    const { backgroundColor } = useColor();
    const { callState } = useCallUI();

    // Handler for voice call
    const handleVoiceCall = () => {
        helloVoiceService.initiateCall();
    };

    if (!isHelloUser || !voice_call_widget) return null;

    const isCallDisabled = callState !== "idle";

    return (
        <div
            className={`rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:scale-105 transition-transform duration-200 cursor-pointer ${isCallDisabled
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:bg-gray-200"
                }`}
            style={{ backgroundColor: lighten(backgroundColor, 0.8) }}
            onClick={() => { if (!isCallDisabled) handleVoiceCall() }}
        >
            <Phone className={`w-4 h-4 md:w-4 md:h-4`} style={{ color: darken(backgroundColor, 0.2) }} />
        </div>
    );
}

export default React.memo(addUrlDataHoc(CallButton, []));