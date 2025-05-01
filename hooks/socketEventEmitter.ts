// useTypingStatus.ts
import { useCallback, useRef } from "react";
import socketManager from "./socketManager";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { $ReduxCoreType } from "@/types/reduxCore";

/**
 * Hook to manage socket typing status with deduplication
 * @param channelId - Channel ID to emit the event on
 * @returns emitTypingStatus - function to emit 'typing' or 'not-typing'
 */
export const useTypingStatus = () => {
    const { currentChannelId, typeingEventChannel } = useCustomSelector((state: $ReduxCoreType) => ({
        currentChannelId: state.Hello?.currentChannelId,
        typeingEventChannel: state.Hello?.widgetInfo?.event_channels?.find((channel: any) => channel.includes("typing"))
    }));
    const hasSentTyping = useRef(false);

    /**
     * Emits typing or not-typing event if valid and needed
     * @param type - 'typing' | 'not-typing'
     */
    const emitTypingStatus = useCallback((type: 'typing' | 'not-typing') => {
        if (!currentChannelId || !typeingEventChannel) return;

        const alreadyTyped = hasSentTyping.current;

        // Avoid redundant emits
        if (type === 'typing' && alreadyTyped) return;
        if (type === 'not-typing' && !alreadyTyped) return;

        const payload = {
            channel: typeingEventChannel,
            data: {
                action: type,
                channel: currentChannelId,
            },
        };

        socketManager.emitEvent(type, payload, () => { });
        hasSentTyping.current = type === 'typing';
    }, [currentChannelId]);

    return emitTypingStatus;
};
