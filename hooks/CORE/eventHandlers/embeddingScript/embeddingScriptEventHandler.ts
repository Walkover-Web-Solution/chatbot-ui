import { useEffect } from "react";
import useHandleGtwyEmbeddingScriptEvents from "../../../GTWY/eventHandlers/embeddingScript/embeddingScriptEventHandler";
import useHandleHelloEmbeddingScriptEvents from "../../../HELLO/eventHandlers/embeddingScript/embeddingScriptEventHandler";


export type EmbeddingScriptEventRegistryInstance = InstanceType<typeof EmbeddingScrpitEventRegistry>;

class EmbeddingScrpitEventRegistry {
  private allowedEvents: string[] = [];
  private eventHandlers: Record<string, (event: MessageEvent) => void> = {}

  private tabSessionId: string

  constructor(tabSessionId: string) {
    this.allowedEvents = []
    this.eventHandlers = {}
    this.tabSessionId = tabSessionId
  }

  isEventAllowed(eventName: string) {
    return this.allowedEvents.includes(eventName)
  }

  addEventHandler(eventName: string, handler: (event: MessageEvent) => void) {
    this.allowedEvents.push(eventName)
    this.eventHandlers[eventName] = handler
  }

  getAllEventsHandler(): Record<string, ((event: MessageEvent) => void)> {
    return this.eventHandlers
  }

  on(eventName: string, event: MessageEvent) {
    this.eventHandlers[eventName](event)
  }

  getTabSessionId() {
    return this.tabSessionId
  }
}

export const useEmbeddingScriptEventHandler = (tabSessionId: string, chatSessionId: string) => {
  const EmebeddingScriptEventHandler: EmbeddingScriptEventRegistryInstance = new EmbeddingScrpitEventRegistry(tabSessionId)

  useHandleGtwyEmbeddingScriptEvents(EmebeddingScriptEventHandler)
  useHandleHelloEmbeddingScriptEvents(EmebeddingScriptEventHandler, chatSessionId)

  const handleMessage = (event: MessageEvent) => {
    const { type } = event.data;
    if (EmebeddingScriptEventHandler.isEventAllowed(type)) {
      EmebeddingScriptEventHandler.on(type, event)
    }
  }

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);

    };
  }, []);

  return null
}