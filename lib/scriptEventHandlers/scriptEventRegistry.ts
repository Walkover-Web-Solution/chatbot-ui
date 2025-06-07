import { Dispatch, UnknownAction } from "redux";

type EventHandler = (event: MessageEvent, dispatch: Dispatch<UnknownAction> , handleThemeChange: (theme: string) => void, currentThreadId: string) => void;

const eventHandlers: Record<string, EventHandler[]> = {};
const allowedEventsToSubscribe: Set<string> = new Set<string>();

export function registerEventHandler(eventType: string, handler: EventHandler) {
  if (!eventHandlers[eventType]) {
    eventHandlers[eventType] = [];
  }
  eventHandlers[eventType].push(handler);
  allowedEventsToSubscribe.add(eventType);
}

export function getHandlersForEvent(eventType: string): EventHandler[] {
  return eventHandlers[eventType] || [];
}

export function isEventAllowedToSubscribe(eventType: string): boolean {
  return allowedEventsToSubscribe.has(eventType);
}
  