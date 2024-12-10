/* eslint-disable @typescript-eslint/interface-name-prefix */
export class BaseFilterRequest {
    pageNo = 1;
    itemsPerPage = 25;
    search = '';
    s?: string;
    sortOrder?: 'asc' | 'desc' = 'desc';
    sortBy?: string;
    filterBy: string;
    totalPageCount: number;
    ui_view?: boolean | number;
    is_ai_query?: boolean;
}

export class MessageData {
    public type: 'Error' | 'Info';
    public title: string;
    public message: string;
}

export type errorType = string[] | string | { [key: string]: [] };

export class BaseResponse<T, TRequest> {
    public data: T;
    public status: 'success' | 'fail';
    public hasError: boolean;
    public errors: errorType;
    public request?: TRequest;
    public queryString?: any;
}

export interface IPaginatedResponse<P> {
    data: P;
    itemsPerPage: number;
    pageNumber: number;
    pageNo?: number;
    totalEntityCount: number;
    totalEntityCountWithoutFilter?: number;
    totalPageCount: number; // Total records of p in database without applying filters
}

export interface IIdNameModel {
    id: number;
    name: string;
}

export interface IPaginatedEmailResponse<P> {
    data: P;
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string;
    path: string;
    per_page: string;
    prev_page_url: null | string;
    to: number;
    total: number;
}

export enum ProxyBaseUrls {
    EmailProxy = 'EMAIL_BASE_URL',
    RcsProxy = 'RCS_BASE_URL',
    MsgProxy = 'MSG_PROXY_BASE_URL',
    HelloProxy = 'HELLO_BASE_URL',
    WhatsAppProxy = 'WHATS_APP_BASE_URL',
    CampaignProxy = 'CAMPAIGN_BASE_URL',
    SubscriptionProxy = 'SUBSCRIPTION_BASE_URL',
    ShortURLProxy = 'SHORT_URL_BASE_URL',
    SubscriptionURLProxy = 'SUBSCRIPTION_URL_BASE_URL',
    BaseURL = 'BASE_URL',
    BaseServer = 'BASE_SERVER',
    ProxyURL = 'PROXY_URL',
    FirebaseConfig = 'FIREBASE_CONFIG',
    AdminServer = 'ADMIN_SERVER',
    AdminProxy = 'ADMIN_PROXY',
    VoiceBaseURL = 'VOICE_BASE_URL',
    EmailServerURL = 'EMAIL_SERVER_URL',
    SegmentoBaseURL = 'SEGMENTO_BASE_URL',
    SegmentoV1BaseURL = 'SEGMENTO_V1_BASE_URL',
    HelloBaseURL = 'HELLO_API_URL',
    Env = 'ENV',
    IToken = 'IToken',
    ReportsUrl = 'REPORTS_URL',
    FileUploadProxy = 'FILE_UPLOAD_PROXY',
    NumbersProxy = 'NUMBERS_PROXY',
    InvisibleOTPProxy = 'INVISIBLE_OTP_PROXY',
    PushNotificationProxy = 'PUSH_NOTIFICATION_URL',
    EnableMsg91Proxy = 'ENABLE_MSG91_PROXY',
    SegmentoMsg91BasePath = 'SEGMENTO_MSG91_BASE_PATH',
    ViasocketBaseUrl = 'VIASOCKET_BASE_URL',
    AddProxyAppHashInApiCall = 'ADD_PROXY_APP_HASH_IN_API_CALL',
}

export interface IToken {
    proxyJWTToken: string;
    token: string;
    companyId: string;
    billing_country_shortname: string | null;
}

export class BaseEmailFilterRequest {
    page? = 1;
    per_page? = 25;
    search_in?: string;
    keyword?: string;
    order_type?: 'asc' | 'desc' = 'desc';
    order_by?: string;
}

export interface ILineGraphData {
    name: string;
    series: ILineGraphSeries[];
}

export interface ILineGraphSeries {
    value: number;
    name: number | Date;
}

export interface IPaginationAnalyticsResponse {
    page: number;
    pageSize: number;
    total?: number;
}

export interface keyValuePair<T> {
    [key: string]: T;
}

export class MicroserviceBaseResponse<T, TRequest> extends BaseResponse<T, TRequest> {
    success: boolean;
    message: string[] | string | { [key: string]: [] };
}

export type MappedTypeWithOptional<Type> = {
    [Properties in keyof Type]?: Type[Properties];
};
export interface IGetClientResModule {
    user_pid: string;
    user_name: string;
    user_fname: string;
    user_lname: string;
    user_uname: string;
    user_mobno: string;
    user_email: string;
    user_type: string;
    user_rid: string;
    user_expiry: string;
    user_status: string;
    user_date: string;
    signup_date: string;
    userPanelId: string;
    user_currency: string;
    userWalletEnabled: number;
}

export interface IFirebaseUserModel {
    uid: string;
    displayName: string;
    email: string;
    phoneNumber: string;
    photoURL: string;
    emailVerified: boolean;
    jwtToken: string;
}

export function errorResolver(params: string[] | string | { [key: string]: [] }): string[] {
    if (typeof params === 'string') {
        return [params];
    } else if (params instanceof Array) {
        return params;
    } else if (params instanceof Object) {
        return [].concat(
            ...Object.keys(params).map((p) => {
                return params[p];
            })
        );
    } else {
        return ['Something went wrong.'];
    }
}

export function fetchFirstErrorRecursively(errObj: { [key: string]: any }): any {
    if (errObj && typeof errObj === 'object') {
        return fetchFirstErrorRecursively(errObj[Object.keys(errObj)[0]]);
    } else {
        return errObj;
    }
}

export interface ISharedWebhookList {
    key: string;
    name: string;
}

export interface ICommondsObjectState {
    command_name: string;
    command_description: string;
}
export interface INumberSettingsData {
    integrated_number: number | null;
    enable_welcome_message: boolean;
    commands: ICommondsObjectState[];
    prompts: string[];
}

export interface IWhatsAppNumberSettingsStates {
    isLoading: boolean;
    isDataUpdating: boolean;
    isDataUpdated: boolean;
    numberSettingsData: INumberSettingsData;
}
