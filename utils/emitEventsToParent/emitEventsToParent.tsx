export function emitEventToParent(type: 'FRONT_END_ACTION' | 'HEADER_BUTTON_PRESS' | 'MESSAGE_CLICK' | 'BRIDGE_SWITCH' | 'CLOSE_CHATBOT' |'uuid', data: any) {
  const eventData = {
    type,
    data:data,
  };
  window?.parent?.postMessage(eventData, "*");
}
