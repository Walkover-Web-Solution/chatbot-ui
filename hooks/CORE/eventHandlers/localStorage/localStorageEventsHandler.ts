import useHelloLocalStorageEventHandlers from "@/hooks/HELLO/eventHandlers/localStorage/localStorageEventsHandler";
import { setHelloKeysData } from "@/store/hello/helloSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export type LocalStorageEventRegistryInstance = InstanceType<typeof LocalStorageEventRegistry>;

class LocalStorageEventRegistry {
  private allowedEvents: string[] = [];
  private eventHandlers: Record<string, (event: CustomEvent<{ key: string, value: string | boolean }>) => void> = {}

  private tabSessionId: string

  constructor(tabSessionId: string) {
    this.allowedEvents = []
    this.eventHandlers = {}
    this.tabSessionId = tabSessionId
  }

  isEventAllowed(eventName: string) {
    return this.allowedEvents.includes(eventName)
  }

  addEventHandler(eventName: string, handler: (event: CustomEvent<{ key: string, value: string | boolean }>) => void) {
    this.allowedEvents.push(eventName)
    this.eventHandlers[eventName] = handler
  }

  getAllEventsHandler(): Record<string, ((event: CustomEvent<{ key: string, value: string | boolean }>) => void)> {
    return this.eventHandlers
  }

  on(eventName: string, event: CustomEvent<{ key: string, value: string | boolean }>) {
    this.eventHandlers[eventName](event)
  }

  getTabSessionId() {
    return this.tabSessionId
  }
}

export const useLocalStorageEventHandler = (tabSessionId: string) => {

  const LocalStorageEventHandler: LocalStorageEventRegistryInstance = new LocalStorageEventRegistry(tabSessionId)

  useHelloLocalStorageEventHandlers(LocalStorageEventHandler)

  const handleStorageUpdate = (event: CustomEvent<{ key: string, value: string | boolean }>) => {
    const { key } = event.detail;
    if (LocalStorageEventHandler.isEventAllowed(key)) {
      LocalStorageEventHandler.on(key, event)
    }
  };

  useEffect(() => {

    window.addEventListener("localstorage-updated", handleStorageUpdate);

    return () => {
      window.removeEventListener("localstorage-updated", handleStorageUpdate);

    };
  }, []);

  return null
}