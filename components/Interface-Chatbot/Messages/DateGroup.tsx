import { formatTime } from '@/utils/utilities';
import dayjs from 'dayjs';
import React from 'react'

function DateGroup({ prevTime, messageTime, backgroundColor, textColor }: { prevTime: any, messageTime: number, backgroundColor: string, textColor: string }) {
    const messageTimeRange = dayjs(messageTime);
    const prevTimeRange = dayjs(prevTime);


    // Check if both times are on the same date and within 24 hours of each other
    const shouldShowTimestamp = !prevTime ||
        !(messageTimeRange.diff(prevTimeRange, 'hour') < 24 &&
            prevTimeRange.get('date') === messageTimeRange.get('date'));

    if (!shouldShowTimestamp) {
        return null;
    }

    return (
        <div className="flex justify-center my-8">
            <div className="flex items-center w-full">
                <div className="flex-1 h-px bg-gray-300"></div>
                <div className="badge mx-2 text-xs bg-transparent border p-3" style={{ borderColor: backgroundColor }}>{formatTime(+messageTime, 'shortDate')}</div>
                <div className="flex-1 h-px bg-gray-300"></div>
            </div>
        </div>
    )
}

export default DateGroup