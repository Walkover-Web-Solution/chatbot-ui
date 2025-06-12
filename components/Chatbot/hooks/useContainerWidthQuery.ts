import { useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';

interface UseContainerWidthQueryProps {
    containerId?: string;
    maxWidth?: number;
}

export const useContainerWidthQuery = ({
    containerId = 'hello-chatbot-iframe-container',
    maxWidth = 1023,
}: UseContainerWidthQueryProps) => {
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const isSmallScreenIframe = useMediaQuery('(max-width:1023px)');
    useEffect(() => {
        let container = document.getElementById(containerId);

        if (!container) {
            console.warn(`Container with id "${containerId}" not found. Falling back to window.innerWidth.`);
            setIsSmallScreen(isSmallScreenIframe);
            return;
        }

        const checkWidth = (width: number) => {
            setIsSmallScreen(width <= maxWidth);
        };

        checkWidth(container.offsetWidth);

        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                checkWidth(entry.contentRect.width);
            }
        });

        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
        };
    }, [containerId, maxWidth,]);

    return isSmallScreen;
};
