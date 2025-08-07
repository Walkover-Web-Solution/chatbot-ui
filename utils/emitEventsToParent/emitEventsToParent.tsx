/**
 * Event types that can be emitted to the parent window
 */
export type ParentEventType =
  | 'PUSH_NOTIFICATION'
  | 'FRONT_END_ACTION'
  | 'HEADER_BUTTON_PRESS'
  | 'MESSAGE_CLICK'
  | 'BRIDGE_SWITCH'
  | 'CLOSE_CHATBOT'
  | 'uuid'
  | 'ENABLE_DOMAIN_TRACKING'
  | 'SET_BADGE_COUNT'
  | 'RELOAD_PARENT'
  | 'MINIMIZE_CHATBOT'
  | 'OPEN_CHATBOT'
  | 'SHOW_STARTER_QUESTION'
  | 'HIDE_STARTER_QUESTION'
/**
 * Emits an event to the parent window using postMessage
 * @param type - The type of event to emit
 * @param data - The data to send with the event
 */
export function emitEventToParent(type: ParentEventType, data: any = null): void {
  const eventData = {
    type,
    data,
  };

  if (window?.parent) {
    window.parent.postMessage(eventData, "*");
  }
}