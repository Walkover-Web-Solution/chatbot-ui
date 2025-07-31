import { useEffect, useState } from 'react';

/**
 * Custom hook that triggers re-renders at specified intervals
 * to keep relative time displays updated
 * @param {number} interval - Update interval in milliseconds (default: 60000 = 1 minute)
 * @returns {number} - Current timestamp that changes at each interval
 */
export const useTimeUpdate = (interval = 60000) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return currentTime;
};
