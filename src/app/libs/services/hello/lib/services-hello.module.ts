import { Inject, Injectable, NgModule, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ENVIRONMENT_TOKEN, ENVIRONMENT_TOKEN_NOT_PROVIDED_ERROR, HELLO_API_URL } from '@msg91/constant';

@NgModule({
    imports: [CommonModule],
})
export class ServicesHelloModule {}

@Injectable({
    providedIn: ServicesHelloModule,
})
export class HelloApiUrlService {
    private urls;
    constructor(@Optional() @Inject(ENVIRONMENT_TOKEN) private environment: any) {
        if (!this.environment) {
            throw new Error(ENVIRONMENT_TOKEN_NOT_PROVIDED_ERROR);
        }
        const ApiUrl = HELLO_API_URL(this.environment);
        const kbProxyUrl = this.environment.kbProxyUrl;
        const baseUrl = this.environment.server;
        const voiceUrl = `${this.environment.proxyServer}${this.environment.voiceProxy}`;

        this.urls = {
            URLS: {
                USERS: {
                    SIGN_IN: `${ApiUrl}/generate-user-auth?token=harsh`,
                    LOG_IN: `${ApiUrl}/generate-employee-auth/`,
                    GOOGLE_LOG_IN: `${ApiUrl}/google-login/`,
                    LOGIN_SELECTED_AGENT: `${ApiUrl}/login-selected-agent/`,
                    GET_MOBILE_NUMBER: `${ApiUrl}/forgot_password?username=:username`,
                    GET_OTP: `${ApiUrl}/forgot_password?mobile=:mobile&username=:username&dial_code=:dial_code`,
                    SET_PASSWORD: `${ApiUrl}/forgot_password`,
                    GET_TOKEN_URL: `${ApiUrl}/landing-page?token=:token`,
                    GET_TEMP_PASS: `${ApiUrl}/generate-sip-pass/`,
                    ACTIVE_SESSION: `${ApiUrl}/active-session/`,
                    MY_SESSION: `${ApiUrl}/session/`,
                    RESEND_VERIFICATION_LINK: `${ApiUrl}/resend-verification-mail/`,
                    AGENT_SETTINGS: `${ApiUrl}/agent-settings/`,
                    FCM_TOKEN: `${ApiUrl}/web-fcm-token/`,
                },
                AGENT: {
                    CREATE_AGENT: `${ApiUrl}/v2/agent/`,
                    DELETE_AGENT: `${ApiUrl}/v2/agent/:id`,
                    GET_ALL_AGENT: `${ApiUrl}/v2/agent/`,
                    GET_AGENT: `${ApiUrl}/v2/agent/:id`,
                    UPDATE_AGENT: `${ApiUrl}/v2/agent/:id`,
                    GET_AGENT_LIST: `${ApiUrl}/v2/agent/`,
                    SEND_OTP: `${ApiUrl}/otp-send/`,
                    PROFILE_PIC: `${ApiUrl}/profile-pic/`,
                },
                Team: {
                    CREATE_TEAM: `${ApiUrl}/v2/teams/`,
                    CREATE_TEAM_V5: `${baseUrl}/api/v5/hello/v2/teams/`,
                    DELETE_TEAM: `${ApiUrl}/v2/teams/:id`,
                    DELETE_TEAM_V5: `${baseUrl}/api/v5/hello/v2/teams/:id`,
                    GET_ALL_TEAMS: `${ApiUrl}/v2/teams/`,
                    GET_ALL_TEAMS_WITH_PARAMS: `${ApiUrl}/v2/teams/?`,
                    GET_ALL_TEAMS_WITH_PARAMS_V5: `${baseUrl}/api/v5/hello/v2/teams/?`,
                    GET_TEAM: `${ApiUrl}/v2/teams/:id`,
                    GET_TEAM_BY_ID: `${ApiUrl}/v2/teams/:id`,
                    UPDATE_TEAM: `${ApiUrl}/v2/teams/:id`,
                    UPDATE_TEAM_V5: `${baseUrl}/api/v5/hello/v2/teams/:id`,
                },
                COMPANY: {
                    GET_COMPANIES: `${baseUrl}/api/v5/panel/getAllAccounts`,
                    SWITCH_COMPANY: `${baseUrl}/api/v5/panel/switchAccount`,
                },
                VOICE: {
                    GET_SIP_CREDS: `${voiceUrl}/sip-credentials/`,
                    GET_DID_ASSIGN: `${voiceUrl}/numbers/?page_size=100`,
                    AGENT_SETTING: `${voiceUrl}/agent-settings/`,
                    GET_VPN_CREDS: `${voiceUrl}/vpn-credentials/?server_id=`,
                },
                CALL_LOGS: {
                    ADD: `${ApiUrl}/call-logs`,
                    GET_ALL_LOGS: `${voiceUrl}/call-logs/?start_time_end=:start_time_end&start_time_begin=:start_time_begin&call_type=:call_type&call_on=:call_on&agent_id=:agent_id&page_num=:page_number&page_size=:page_size&sort_by=:sort_by&sort_order=:sort_order&type=hello,utteru`,
                    GET_RECORDING: `${ApiUrl}/call-logs/recording/:id`,
                },
                CALL_WIDGET: {
                    SAVE: `${ApiUrl}/widget/`,
                    DELETE_CHAT: `${ApiUrl}/widget/chat/`,
                    DELETE_CALL: `${ApiUrl}/widget/call/`,
                    DELETE_FIELD: `${ApiUrl}/widget/field/delete/`,
                    UPDATE_FIELD: `${ApiUrl}/widget/field/update/`,
                    IDENTITY_VERIFICATION: `${ApiUrl}/identity-verification/`,
                },
                HIT_MAN: {
                    DRY_RUN: `${ApiUrl}/dry-run/`,
                    SAVE_URL: `${ApiUrl}/crm-url/`,
                },
                INBOX: {
                    GET_ALL_INBOXES_COMPANY: `${ApiUrl}/v2/inbox/`,
                    CREATE_INBOX: `${ApiUrl}/v2/inbox/`,
                    VERIFY_FORWARDING_ADDRESS: `${ApiUrl}/verify/`,
                    ENABLE_INBOX: `${ApiUrl}/v2/inbox/:id?enable=true`,
                    GET_DOMAINS: `${ApiUrl}/v2/inbox/?get_domain=true`,
                    WORKFLOW: `${ApiUrl}/work-flow/`,
                    BOT_LIST: `${ApiUrl}/chat-bot/bots/bot_list/`,
                    WHATS_APP_INBOX: `${ApiUrl}/unread-count/?whatsapp=true`,
                    FACEBOOK_INBOX_COUNT: `${ApiUrl}/unread-count/?facebook=true`,
                    FACEBOOK_INBOX: `${ApiUrl}/get-cc-integration/fb`,
                    ADD_FACEBOOK_INBOX: `${ApiUrl}/facebook-integration/`,
                    DELETE_FACEBOOK_INBOX: `${ApiUrl}/facebook-integration/`,
                    GOOGLE_BUSINESS_CHAT: `${ApiUrl}/google-business-integration/`,
                    SYNC_INBOX: `${ApiUrl}/sync-inbox/`,
                    MOVE_CHANNELS: `${ApiUrl}/transfer-tickets/`,
                    NOTIFICATION_SETTINGS: `${ApiUrl}/v2/notification-setting/`,
                    PERMISSION_SETTINGS: `${ApiUrl}/inbox/permission/:type/:id`,
                    GET_RETRY_STATUS: `${ApiUrl}/retry-mails/`,
                    GET_TWITTER_AUTH_TOKEN: `${ApiUrl}/get-twitter-token/`,
                    INTEGRATE_TWITTER: `${ApiUrl}/save-twitter-data/`,
                    GET_INBOX_BOT_SETTING: `${ApiUrl}/bot-general-setting/inbox/:id/`,
                    UPDATE_INBOX_BOT_SETTING: `${ApiUrl}/bot-general-setting/inbox/`,
                    TEXT_TRANSLATION: `${ApiUrl}/text-translation/`,
                    GET_INBOX_STICKY_SETTING: `${ApiUrl}/sticky-setting/inbox/:id/`,
                    UPDATE_INBOX_STICKY_SETTING: `${ApiUrl}/sticky-setting/inbox/:id/`,
                    INBOX_DISPLAY_NAME_SETTINGS: `${ApiUrl}/custom-name-setting/:type/:id/`,
                    INBOX_AUTO_DELETE_SETTINGS: `${ApiUrl}/inbox-setting/`,
                    CLIENT_ATTACHMENT: `${ApiUrl}/client-attachment/`,
                    INBOX_CUSTOM_FILE_UPLOAD: `${ApiUrl}/custom-file-upload/`,
                    BULK_UPDATE_INBOX_DISPLAY_NAME_SETTINGS: `${ApiUrl}/custom-name-setting/`,
                    DELAYED_INBOX_SETTINGS: `${ApiUrl}/auto-response-setting/:type/:id/`,
                    CONNECT_INSTAGRAM_INBOX: `${ApiUrl}/instagram/login/`,
                },
                CONTACT_CENTER: {
                    GET_ACTIVE_CHANNELS: `${ApiUrl}/v3/pubnub-channels/`,
                    GET_CLOSED_CHANNELS: `${ApiUrl}/v3/pubnub-channels/?type=closed`,
                    GET_SNOOZED_CHANNELS: `${ApiUrl}/v3/pubnub-channels/?type=snoozed`,
                    GET_ACTIVE_EMAIL_CHANNELS: `${ApiUrl}/v2/mail-channel/`,
                    GET_CLOSED_EMAIL_CHANNELS: `${ApiUrl}/v2/mail-channel/?type=closed`,
                    GET_SNOOZED_EMAIL_CHANNELS: `${ApiUrl}/v2/mail-channel/?type=snoozed`,
                    GET_FILTERED_CHANNELS_LIST: `${ApiUrl}/filtered-channels/`,
                    GET_CHANNELS_SEARCH_COUNT: `${ApiUrl}/search-count/`,
                    GET_SPAM_EMAIL_CHANNELS: `${ApiUrl}/v2/mail-channel/?type=spam`,
                    EMAIL_CHANNEL_INFO: `${ApiUrl}/v2/mail-channel/:id`,
                    GET_PUBNUB_KEYS: `${ApiUrl}/pubnub-keys/`,
                    PUBNUB_OUTBOUND_SMS: `${ApiUrl}/pubnub-outbound-sms/`,
                    ACCEPT_CHANNEL: `${ApiUrl}/v3/pubnub-channels/:id`,
                    CLOSE_CHAT: `${ApiUrl}/v3/pubnub-channels/`,
                    SEND_UNREAD_NOTIFICATION: `${ApiUrl}/send-unread-notification/`,
                    READ_RECEIPT: `${ApiUrl}/read-receipt/`,
                    DIVERT: `${ApiUrl}/push-notification/call`,
                    GET_SUBJECT_LIST: `${ApiUrl}/send-cc-mail/?channel_id=:channelId`,
                    GET_MAIL_CONTENT: `${ApiUrl}/mail-details/?id=:id`,
                    GET_MAIL_CONTENT_TO_PRINT: `${ApiUrl}/mail-details/`,
                    CHAT_ATTACHMENT: `${ApiUrl}/chat-attachment/`,
                    CHANNEL_LIST: `${ApiUrl}/v2/pubnub-channels/list/`,
                    BLOCK_CLIENT: `${ApiUrl}/blocked-clients/`,
                    UNREAD_COUNT: `${ApiUrl}/unread-count/`,
                    CHANNEL_INFO: `${ApiUrl}/v3/pubnub-channels/:id`,
                    FILE_UPLOAD: `${ApiUrl}/upload/`,
                    FILE_UPLOAD_V2: `${ApiUrl}/v2/upload/`,
                    COMMON_SEND: `${ApiUrl}/v2/send/`,
                    UNDO_MAIL_SEND: `${ApiUrl}/mail-details/`,
                    SOCKET_TOKEN: `${ApiUrl}/jwt-token/`,
                    HISTORY: `${ApiUrl}/get-history/`,
                    RETRY_FAILED_MAILS: `${ApiUrl}/retry-mails/`,
                    SUMMARIZE_CHAT: `${ApiUrl}/summarize-chat/`,
                    GET_CHANNEL_COUNT_DETAILS: `${ApiUrl}/channel-details/`,
                    TEXT_REPHRASE: `${ApiUrl}/text-rephrase/`,
                    ALLOWED_ACTIONS: `${ApiUrl}/subscription/action/`,
                    OUTBOUND_ALLOWED_ACTIONS: `${ApiUrl}/subscription/check-outbound/`,
                    GET_CURRENT_CHANNEL_DETAILS: `${ApiUrl}/window-details/`,
                    GET_CHANNEL_SOCIAL_DETAILS: `${ApiUrl}/social-profile-details/:channelId/`,
                    GET_INBOX_SOCIAL_DETAILS: `${ApiUrl}/social-profile-details/:inboxId/:type/?inbox=true`,
                    GET_ATTACHMENT_DOWNLOAD_URL: `${ApiUrl}/download/`,
                    NO_REPLY_COUNT: `${ApiUrl}/no-reply-count/`,
                    GET_TIMEZONES: `${ApiUrl}/get-timezone/`,
                },
                LEADS: {
                    CLIENTS: `${ApiUrl}/client/`,
                    CLIENT_FEEDBACK: `${ApiUrl}/client-feedback/`,
                    CLIENT_PARAMS: `${ApiUrl}/client-param/`,
                    IMPORT_LEADS: `${ApiUrl}/import-leads/`,
                    CLIENT_STATUS: `${ApiUrl}/client-status/:client_id/`,
                    CHANNELS_DETAILS: `${ApiUrl}/client/`,
                },
                REPORTS: {
                    REPORT: `${ApiUrl}/report/`,
                    CLIENT_REPORT: `${ApiUrl}/client-report/`,
                },
                KNOWLEDGEBASE: {
                    GET_FODLERS: `${kbProxyUrl}/folders/`,
                    CREATE_FODLERS: `${kbProxyUrl}/folders/`,
                    UPDATE_FODLERS: `${kbProxyUrl}/folders/:id`,
                    DELETE_FODLERS: `${kbProxyUrl}/folders/:id`,
                    GET_ARTICLES: `${kbProxyUrl}/articles/`,
                    CREATE_ARTICLES: `${kbProxyUrl}/articles/`,
                    UPDATE_ARTICLES: `${kbProxyUrl}/articles/:id`,
                    DELETE_ARTICLE: `${kbProxyUrl}/articles/:id`,
                    GET_CONFIG: `${kbProxyUrl}/kb-config/`,
                    UPLOAD_IMAGE: `${kbProxyUrl}/kb-asset/`,
                    DELETE_ASSETS_IMAGE: `${kbProxyUrl}/kb-asset/`,

                    CORRECT_BOT_REPLY: `${ApiUrl}/correctBotReply/`,

                    ARTICLE_REDIRECTIONS: `${kbProxyUrl}/article-redirection/`,

                    // HOVER BUTTONS FUNCTIONS
                    SET_MASTER_ARTICLE: `${kbProxyUrl}/articles/:id`,
                    ARTICLE_PUBLISH_STATUS: `${kbProxyUrl}/articles/:id`,
                },
                SETTINGS: {
                    AUTH_KEY: `${ApiUrl}/api-auth/`,
                    EDIT_PROFILE: `${ApiUrl}/edit-profile/`,
                    GET_DEFAULT_DEVICE: `${ApiUrl}/agent-device-details/`,
                    POST_CALL_FLOW: `${ApiUrl}/post-call-flow/`,
                    DEFAULT_DEVICE: `${ApiUrl}/agent-default-device/`,
                    RCS: `${ApiUrl}/rcs-integration/`,
                    RCS_INTEGRATION: `${ApiUrl}/get-cc-integration/rcs`,
                    ALL_INTEGRATION_STATUS: `${ApiUrl}/get-cc-integration/all`,
                    RCS_AGENT_MESSAGE: `${ApiUrl}/rcs-agent-message/`,
                    WHATSAPP_AGENT_MESSAGE: `${ApiUrl}/send-whatsapp-message/`,
                    WHATSAPP_AGENT_FILE_UPLOAD: `${ApiUrl}/chat-attachment/`,
                    RCS_ADMIN: `${ApiUrl}/rcs-admin-panel/`,
                    GMAIL: {
                        SEND: `${ApiUrl}/send-cc-mail/`,
                        API: `${ApiUrl}/mail-integration/`,
                        STATUS: `${ApiUrl}/get-cc-integration/`,
                    },
                    FB: {
                        GET: `${ApiUrl}/get-cc-integration/fb`,
                        SEND: `${ApiUrl}/send-fb-message/`,
                        API: `${ApiUrl}/facebook-integration/`,
                        GET_VIDEO: `${ApiUrl}/get-fb-video/:message_id/`,
                        GET_FB_ATTACHMENT: `${ApiUrl}/get-fb-attachment/:message_id/`,
                        POST_FB_ATTACHMENT: `${ApiUrl}/get-fb-attachment/`,
                    },
                    CLICK_UP: {
                        GET: `${ApiUrl}/get-cc-integration/click_up`,
                        SEND: `${ApiUrl}/clickup-integration/`,
                    },
                    EMAIL: {
                        GET: `${ApiUrl}/get-cc-integration/email`,
                    },
                    JIRA: {
                        GET: `${ApiUrl}/get-cc-integration/jira`,
                        SEND: `${ApiUrl}/jira-integration/`,
                    },
                    CHAT_BOT: {
                        GET: `${ApiUrl}/get-cc-integration/bot`,
                        SEND: `${ApiUrl}/chatbot-integrate/`,
                        BOT_INTEGRATION: `${ApiUrl}/bot-integration/`,
                    },
                    WHATSAPP: {
                        GET: `${ApiUrl}/get-cc-integration/whatsapp`,
                        SEND: `${ApiUrl}/whatsapp-integration/`,
                        QR: `${ApiUrl}/whatsapp-qr-display/`,
                    },
                    MAIL: {
                        ADD_HOST: `${ApiUrl}/mail-setting/hostname/`,
                        ADD_ACCOUNT: `${ApiUrl}/mail-setting/account/`,
                        DELETE_ACCOUNT: `${ApiUrl}/mail-setting/account/:id`,
                        DELETE_HOST: `${ApiUrl}/mail-setting/hostname/:id`,
                        HOST_DETAILS: `${ApiUrl}/mail-setting/hostname/:id`,
                        SEND_MAIL: `${ApiUrl}/mail-send/`,
                    },
                    UNBLOCK_CLIENT: `${ApiUrl}/blocked-clients/?id=:client_id`,
                    BLOCK_CLIENT_LIST: `${ApiUrl}/blocked-clients/`,
                    BLOCK_CLIENT_LIST_WITH_PARAMS: `${ApiUrl}/blocked-clients/?`,
                    MANAGE_KEYWORDS: {
                        KEYWORDS: `${ApiUrl}/ticket/keywords/`,
                        UPDATE_WEIGHT_KEYWORD: `${ApiUrl}/ticket/weights/`,
                        GET_THRESHOLD: `${ApiUrl}/ticket/threshold/`,
                        UPDATE_THRESHOLD: `${ApiUrl}/ticket/threshold/`,
                    },
                },
                BROWSER_REFRESH: {
                    REFRESH_TOKEN: `${ApiUrl}/refresh-token/`,
                },
                CHAT_ANALYTICS: {
                    GET_ALL_REPORTS: `${ApiUrl}/chat-analytics/`,
                    GET_ALL_AGENT_TEAMS: `${ApiUrl}/v2/agent-team/?all=true`,
                    GET_ALL_INBOXES: `${ApiUrl}/v2/inbox/`,
                    GET_INBOUND_OUTBOUND_STATS: `${ApiUrl}/reports/inbound-outbound`,
                    GET_MATRIX_STATS: `${ApiUrl}/reports/:type`,
                    GET_STATS: `${ApiUrl}/reports/:type`,
                    GET_TRANSFER_HISTORY: `${ApiUrl}/reports/:type`,
                    GET_WORKING_HOURS: `${ApiUrl}/reports/effective-hours`,
                    GET_ACTIVE_AGENTS: `${ApiUrl}/v2/agent/?enabled=true`,
                },
                SAVEDREPLIES: {
                    CREATE_SAVED_REPLY: `${ApiUrl}/saved-replies/`,
                    GET_SAVED_REPLYS: `${ApiUrl}/saved-replies/`,
                    GET_SAVED_REPLY: `${ApiUrl}/saved-replies/:id`,
                    UPDATE_SAVED_REPLY: `${ApiUrl}/saved-replies/:id`,
                    DELETE_SAVED_REPLY: `${ApiUrl}/saved-replies/:id`,
                    DELETE_INTERACTIVE_REPLY: `${ApiUrl}/saved-replies/:id`,
                },
                ASSIGNEMPLOYEE: {
                    ASSIGN_EMPLOYEE_LIST: `${ApiUrl}/v2/agent-team/`,
                    ASSIGN_INBOX_PERMISSION: `${ApiUrl}/inbox/permission/`,
                    ASSIGN_EMPLOYEE: `${ApiUrl}/v3/pubnub-channels/`,
                    ASSIGN_EMPLOYEE_TO_EMAIL: `${ApiUrl}/v2/mail-channel/`,
                    SET_ASSIGN_EMPLOYEE: `${ApiUrl}/v3/pubnub-channels/:id`,
                },
                FEEDBACK: {
                    GET_FEEDBACK: `${ApiUrl}/receive-feedback/?token=:token`,
                    SUBMIT_FEEDBACK: `${ApiUrl}/receive-feedback/`,
                    FEEDBACK_SETTING: `${ApiUrl}/feedback-setting/:inbox_type`,
                },
                CALLING: {
                    CALL_CREDENTIALS: `${ApiUrl}/call-session-creds/:chat-id`,
                },
                TAGS: {
                    CREATE_TAG: `${ApiUrl}/tag/`,
                    GET_TAG_LIST: `${ApiUrl}/tag/`,
                    UPDATE_TAG: `${ApiUrl}/tag/:tag_id`,
                    DELETE_TAG: `${ApiUrl}/tag/:tag_id`,
                    ADD_TAG_CONVERSATION: `${ApiUrl}/tag-conversation/:client_id/`,
                    DELETE_TAG_CONVERSATION: `${ApiUrl}/tag-conversation/:client_id/`,
                    GET_TAG_CONVERSATION: `${ApiUrl}/tag-conversation/:client_id/`,
                    TAG_CHANNEL: `${ApiUrl}/tag-conversation/`,
                    TAG_ANALYTICS: `${ApiUrl}/chat-analytics/?type=tag`,
                },
                CLICK_UP: {
                    API: `${ApiUrl}/clickup-task/?`,
                },
                VALIDATION: {
                    PHONE: `${ApiUrl}/number-validation/`,
                },
                INTERACTIVE_MESSAGE: {
                    GET_ALL: `${ApiUrl}/saved-replies/`,
                },
                COMPOSE: {
                    SUGGESTIONS: `${ApiUrl}/list-auto-completions`,
                },
                SAVED_FILTERS: {
                    SAVED_FILTERS: `${ApiUrl}/saved-filter/`,
                },
            },
        };
    }

    public getApiUrls(): any {
        return this.urls;
    }
}
