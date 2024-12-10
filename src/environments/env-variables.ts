export const envVariables = {
    apiUrl: process.env.CHAT_WIDGET_API_URL,
    appUrl: process.env.CHAT_WIDGET_APP_URL,
    baseUrl: process.env.CHAT_WIDGET_BASE_URL,
    appUrlHello: process.env.CHAT_WIDGET_APP_URL_HELLO,
    socketUrl: process.env.CHAT_WIDGET_SOCKET_URL,
    pushNotificationSocketUrl: process.env.CHAT_WIDGET_PUSH_NOTIFICATION_SOCKET_URL,
    anonymousUuidExpiryInDays: JSON.parse(process.env.CHAT_WIDGET_ANONYMOUS_UUID_EXPIRY_IN_DAYS ?? 'null'),
    uuidExpiryInDays: JSON.parse(process.env.CHAT_WIDGET_UUID_EXPIRY_IN_DAYS ?? 'null'),
    enableHelloNewSocketSubscription: JSON.parse(process.env.CHAT_WIDGET_HELLO_NEW_SOCKET_SUBSCRIPTION ?? 'null'),
};
