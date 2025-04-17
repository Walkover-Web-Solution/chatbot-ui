export const URLS = {
    FAQS: {
        GET_FODLERS: `:URL/folders/`,
        GET_ARTICLES: `:URL/articles/`,
    },
    CHAT: {
        CREATE_CHANNEL: `:URL/pubnub-channels/`,
        CHANNEL_LIST: `:URL/v2/pubnub-channels/list/`,
        CLIENTS: `:URL/client/`,
        GET_KEYS: `:URL/pubnub-keys/`,
        CLIENT_PARAM: `:URL/client-param/`,
        WIDGET_INFO: `:URL/widget-info/`,
        AGENT_TEAM_LIST: `:URL/v2/agent-team/`,
        ADD_DOMAIN: `:URL/add-domain/`,
        READ_RECEIPT: `:URL/read-receipt/`,
        UNREAD_NOTIFICATION: `:URL/send-unread-notification/`,
        ATTACHMENT: `:URL/chat-attachment/`,
        BOT_CONVERSATION: `:URL/bot-conversation/`,
        RECEIVE_FEEDBACK: `:URL/receive-feedback/`,
        CLASSIFY_CHANNEL: `:URL/ticket/classify/`,
        SEND: `:URL/v2/send/`,
        ATTACHMENT_UPLOAD: `:URL/upload/`,
        ATTACHMENT_UPLOAD_V2: `:URL/v2/upload/`,
        SOCKET_TOKEN: `:URL/jwt-token/`,
        HISTORY: `:URL/get-history/`,
        GREETING: `:URL/chat-gpt/greeting/`,
        LEX_GREETING: `:URL/chat-bot/welcome/get-welcome/`,
        CREATE_ANONYMOUS_USER: ':URL/anonymous-client-details/',
        GET_CLIENT_TOKEN:':URL/web-rtc/get-client-token/',
        GET_CALL_TOKEN:':URL/web-rtc/get-call-token/'
    },
    PUBNUB: {
        GET_KEYS: `:URL/pubnub-keys/`,
    },
    VALIDATION: {
        PHONE: `:URL/number-validation/`,
    },
};
