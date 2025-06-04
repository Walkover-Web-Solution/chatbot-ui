'use client';

import { getHandlersForEvent, isEventAllowedToSubscribe } from "@/lib/scriptEventHandlers/scriptEventRegistry";

// REGISTER SERVICE WISE EVENTS
import '@/lib/scriptEventHandlers/gtwy/gtwyScriptEventHandler';
import '@/lib/scriptEventHandlers/hello/helloScriptEventHandler';

import { ThemeContext } from "@/components/AppWrapper";
import { useCallback, useContext, useEffect } from "react";
import { useDispatch } from "react-redux";

const useScriptEventHandler = () => {
    const dispatch = useDispatch()
    const { handleThemeChange } = useContext(ThemeContext)
    const handleMessage = useCallback((event: MessageEvent) => {
        const eventType = event?.data?.type;
        if (!eventType) return;
        if (!isEventAllowedToSubscribe(eventType)) return;
        
        const handlers = getHandlersForEvent(eventType);
        handlers.forEach(handler => handler(event, dispatch, handleThemeChange));
    }, [dispatch]);

    useEffect(() => {
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [handleMessage]);


    return null
}

export default useScriptEventHandler;
