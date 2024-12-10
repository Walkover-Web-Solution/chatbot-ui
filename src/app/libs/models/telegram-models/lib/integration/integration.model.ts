export interface ITelegramAdminClientResponse {
    client_data: ITelegramAdminClient[];
    current_page_client_count: number;
    total_client_count: number;
}

export interface ITelegramAdminClient {
    id: number;
    company_id: number;
    bot_id: number;
    bot_username: string;
    mobile_number: number;
    status: 'active' | 'inactive';
    last_seen: string;
    statusValue?: boolean;
}

export interface ITelegramAdminClientUpdateReq {
    company_id: number;
    status: 'active' | 'inactive';
}

export interface ITelegramClientIntegrationReq {
    mobile_number: string;
    access_token: string;
    inbound_setting: string;
    webhook?: string;
}
export interface ITelegramClientQRIntegrationReq {
    mobile_number: string;
    bot_name: string;
    inbound_setting: string;
    webhook?: string;
}

export interface ITelegramClientIntegrationDataRes {
    integrations: IIntegrationsData[];
    total_integration_count: number;
}

export interface IIntegrationsData {
    id: number;
    bot_id: number;
    bot_username: string;
    inbound_setting: string;
    status: string;
    webhook: string;
    header: { [key: string]: string };
}
export interface ITelegramUpdateReq {
    inbound_setting: string;
    webhook?: string;
    status?: 'active' | 'inactive';
}

export interface IQrIntegrateBotRes {
    integration_uuid: string;
    message: string;
}

export interface ITelegramAdminLogResponse {
    data: ITelegramLogs[];
    metadata: any;
}

export interface ITelegramLogs {
    botId: string;
    botUsername: string;
    chatId: string;
    companyId: number;
    content: any;
    customerName: string;
    direction: number;
    failureReason: string;
    inboundSetting: string;
    isEdited: boolean;
    isForwarded: boolean;
    messageId: string;
    messageType: string;
    recipientNumber: string;
    sentAt: string;
    status: string;
}

export const TELEGRAM_LOG_STATUSES = ['delivered', 'failed', 'sent', 'submitted'];
export const TELEGRAM_LOG_MESSAGE_TYPES = ['text', 'media', 'location', 'template'];
export const TELEGRAM_LOG_DIRECTIONS = ['inbound', 'outbound'];
export const TELEGRAM_LOG_EXPORT_FIELDS = [
    'sentAt',
    'companyId',
    'botUsername',
    'botId',
    'messageId',
    'messageType',
    'chatId',
    'recipientNumber',
    'customerName',
    'direction',
    'isEdited',
    'isForwarded',
    'content',
    'status',
    'inboundSetting',
    'failureReason',
];
export const VOICE_LOGS_STATUSES = [
    'queued',
    'ringing',
    'in-progress',
    'completed',
    'busy',
    'no-answer',
    'canceled',
    'failed',
    'out-of-balance',
];
export const NOTIFICATION_LOGS_STATUS = ['sent', 'delivered', 'failed'];
export const SMS_LOGS_STATUS = ['delivered', 'failed', 'rejected', 'ndnc'];
