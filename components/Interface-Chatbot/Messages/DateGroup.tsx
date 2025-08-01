import { formatTime } from '@/utils/utilities';
import dayjs from 'dayjs';
import React from 'react'

/**
 * A component that groups messages by date, displaying a timestamp
 * between messages that are from different days. It checks if the 
 * previous message time and the current message time are on the same 
 * date and within 24 hours of each other, and only shows the timestamp 
 * if they are from different dates.
 */

function DateGroup({ prevTime, messageTime, backgroundColor, textColor }: { prevTime: any, messageTime: number, backgroundColor: string, textColor: string }) {
    const messageTimeRange = dayjs(messageTime);
    const prevTimeRange = dayjs(prevTime);

    // Don't show if no previous time AND message is from today
    if (prevTime === null && messageTimeRange.isSame(dayjs(), 'day')) {
        return null;
    }
    // Check if both times are on the same date
    const isSameDate = messageTimeRange.format('YYYY-MM-DD') === prevTimeRange.format('YYYY-MM-DD');

    // Only show timestamp if messages are from different dates
    if (isSameDate) {
        return null;
    }

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
                <div className=" mx-2 text-xs bg-transparent p-3">{formatTime(+messageTime, 'shortDate')}</div>
                <div className="flex-1 h-px bg-gray-300"></div>
            </div>
        </div>
    )
}
export default DateGroup