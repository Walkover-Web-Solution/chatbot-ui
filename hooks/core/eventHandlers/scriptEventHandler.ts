'use client';

import { getHandlersForEvent, isEventAllowedToSubscribe } from "@/lib/scriptEventHandlers/scriptEventRegistry";

// REGISTER SERVICE WISE EVENTS
import '@/lib/scriptEventHandlers/gtwy/gtwyScriptEventHandler';
import '@/lib/scriptEventHandlers/hello/helloScriptEventHandler';

import { ThemeContext } from "@/components/AppWrapper";
import { useCallback, useContext, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { $ReduxCoreType } from "@/types/reduxCore";

const useScriptEventHandler = (tabSessionId: string) => {
    const dispatch = useDispatch()
    const { handleThemeChange } = useContext(ThemeContext)
    const { currentThreadId} = useCustomSelector((state: $ReduxCoreType) => ({
        currentThreadId: state.appInfo?.[tabSessionId]?.threadId
      }));
    
    const handleMessage = useCallback((event: MessageEvent) => {
        const eventType = event?.data?.type;
        if (!eventType) return;
        if (!isEventAllowedToSubscribe(eventType)) return;
        
        const handlers = getHandlersForEvent(eventType);
        handlers.forEach(handler => handler(event, dispatch, handleThemeChange, currentThreadId));
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
