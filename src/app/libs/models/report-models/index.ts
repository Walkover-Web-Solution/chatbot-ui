export interface SmsReportData {
    date: string;
    sent: number;
    rejected: number;
    delivered: number;
    failed: number;
    autoFailed: number;
    ndnc: number;
    blocked: number;
    balanceDeducted: number;
    avgDeliveryTime: number | null;
}
export interface SmsReportTotal {
    message: number;
    filtered: number;
    delivered: number;
    totalCredits: number;
    avgDeliveryTime: number;
}
export interface SmsReportResponse extends ReportsBaseResponse {
    data: Array<SmsReportData>;
    total: SmsReportTotal;
}

export interface WhatsappReportData {
    date: string;
    total: number;
    sent: number;
    read: number;
    delivered: number;
    failed: number;
    submitted: number;
    avgDeliveryTime: number;
}
export interface WhatsappReportTotal {
    delivered: number;
    read: number;
    sent: number;
    total: number;
    failed: number;
    submitted: number;
    avgDeliveryTime: number;
}
export interface WhatsappReportResponse extends ReportsBaseResponse {
    data: Array<WhatsappReportData>;
    total: WhatsappReportTotal;
}

export type VoiceReportResponse = {
    data: Array<VoiceReportData>;
};
export interface NumbersReportData extends NumbersReportTotal {
    date: string;
}
export interface VoiceReportData {
    date: string;
    total: number;
    failed: number;
    busy: number;
    canceled: number;
    charge: number;
    completed: number;
    duration: number;
    no_answer: number;
    out_of_balance: number;
    billingDuration: number;
}
export interface NumbersReportTotal {
    total: number;
    success: number;
    failed: number;
    webhook_delivered: number;
    on_hold: number;
}
export interface NumbersReportResponse extends ReportsBaseResponse {
    data: Array<NumbersReportData | VoiceReportData>;
    total?: NumbersReportTotal;
}

export interface ICampaignReportsModel {
    sms?: SmsReportResponse;
    mail?: EmailReportResponse;
}

export interface IParams {
    startDate: null | string;
    endDate: null | string;
    page?: number;
    pageSize?: number;
    timeZone?: string;
    campaignName?: string;
}

export interface EmailReportData {
    accepted: number;
    bounced: number;
    date: string;
    delivered: number;
    failed: number;
    rejected: number;
    queued: number;
    total: number;
}
export interface EmailReportTotal {
    accepted: number;
    bounced: number;
    delivered: number;
    failed: number;
    rejected: number;
    total: number;
}

export interface EmailReportResponse extends ReportsBaseResponse {
    data: Array<EmailReportData>;
    total: EmailReportTotal;
}

export interface RequestExportReportsResponse extends ReportsBaseResponse {
    status: string;
    timezone: string;
    createdAt: string;
    updatedAt: string;
    resourceType: string;
    companyId: string;
    startDate: string;
    endDate: string;
    query: Query;
    id: string;
}

export interface Query {
    companyId: string;
    startDate: string;
    endDate: string;
    timezone: string;
}

export interface DownloadedDataResponse extends RequestExportReportsResponse {
    file: string;
}

// Campaign Report Graph Models
export interface IFormattedGraphData {
    deliveredEmails: number[];
    deliveredSMS: number[];
    failedEmails: number[];
    failedSMS: number[];
    totalEmails: number[];
    totalSMS: number[];
    dates: Date[];
}

export interface IFirstGraphData {
    deliveredSMS: number[];
    failedSMS: number[];
    deliveredEmails: number[];
    failedEmails: number[];
    barDates: Date[];
}

export interface ISecondGraphData {
    totalSMS: number[];
    totalEmails: number[];
    lineDates: Date[];
}
export interface Total {
    date: Date | string;
    total: number;
}

export interface Delivered {
    date: Date | string;
    sent: number;
}

export interface Failed {
    date: Date | string;
    failed: number;
}

export enum NumberServiceTypes {
    InboundSms = 'Inbound SMS',
    InboundVoice = 'Inbound Voice',
}
export interface IEmailLogsReportResponse<P> {
    data: P;
    metadata: {
        datasetId: string;
        paginationToken: string;
        total: number;
    };
}

export interface ReportsBaseResponse {
    error?: string;
}
export interface PushNotificationReportData extends PushNotificationReportTotal {
    date: string;
}
export interface PushNotificationReportTotal {
    total: number;
    delivered: number;
    failed: number;
    sent: number;
}
export type PushNotificationReportResponse = {
    data: Array<PushNotificationReportData>;
    total: PushNotificationReportTotal;
};

export interface TelegramReportData extends TelegramReportTotal {
    date: string;
}
export interface TelegramReportTotal {
    total: number;
    failed: number;
    sent: number;
}
export type TelegramReportResponse = {
    data: Array<PushNotificationReportData>;
    total: PushNotificationReportTotal;
};
export interface IPushNotificationLogs {
    campaignName: string;
    companyId: number;
    contactId: string;
    content: string;
    nodeId: string;
    report: any[];
    status: string;
    templateName: string;
    timestamp: string;
    totalClicked: null;
}
