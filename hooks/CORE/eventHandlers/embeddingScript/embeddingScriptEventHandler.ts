import { useEffect } from "react";
import useHandleGtwyEmbeddingScriptEvents from "../../../GTWY/eventHandlers/embeddingScript/embeddingScriptEventHandler";
import useHandleHelloEmbeddingScriptEvents from "../../../HELLO/eventHandlers/embeddingScript/embeddingScriptEventHandler";


export type EmbeddingScriptEventRegistryInstance = InstanceType<typeof EmbeddingScrpitEventRegistry>;

class EmbeddingScrpitEventRegistry {
  private allowedEvents: string[] = [];
  private eventHandlers: Record<string, (event: MessageEvent) => void> = {}

  private tabSessionId: string
  private chatSessionId: string

  constructor(tabSessionId: string, chatSessionId: string) {
    this.allowedEvents = []
    this.eventHandlers = {}
    this.tabSessionId = tabSessionId
    this.chatSessionId = chatSessionId
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

  getChatSessionId() {
    return this.chatSessionId
  }
}

export const useEmbeddingScriptEventHandler = (tabSessionId: string, chatSessionId: string) => {

  const EmebeddingScriptEventHandler: EmbeddingScriptEventRegistryInstance = new EmbeddingScrpitEventRegistry(tabSessionId, chatSessionId)

  useHandleGtwyEmbeddingScriptEvents(EmebeddingScriptEventHandler)
  useHandleHelloEmbeddingScriptEvents(EmebeddingScriptEventHandler)

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