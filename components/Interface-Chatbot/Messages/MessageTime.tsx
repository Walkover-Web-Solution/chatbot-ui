import { useTimeUpdate } from '@/hooks/useTimeUpdate';
import { formatTime } from '@/utils/utilities';
import { useMemo } from 'react';

function MessageTime({ message }: { message: any }) {
    // Use time update hook to trigger re-renders for relative time updates
    const currentTime = useTimeUpdate(60000); // Update every minute
    // Memoized formatted time that updates with currentTime
    const formattedTime = useMemo(() =>
        message?.time ? formatTime(message.time, 'timeAgo') : null,
        [message?.time, currentTime]
    );

    if (!formattedTime) {
        return null;
    }

    return (
        <div className="tooltip" data-tip={formatTime(message.time, 'shortTime') || ''}>
            <p className="text-xs text-gray-500">{formattedTime}</p>
        </div>
    )
}

export default MessageTime