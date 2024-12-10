import { ajax } from 'rxjs/ajax';
import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';

import { cloneDeep, isEqual, isEqualWith } from 'lodash-es';
export * from './drop-down';
export * from './mat-icon';
export * from './jitsi-calling';
export * from './permission-mapping';
export * from './verification';
export * from './segmento';
export * from './moment';
export * from './subscription-features';
export * from './campaign-object-converter';
export * from './otp-integration';
export * from './sms-counter';
export * from './google-translate';
export * from './env';
export * from './campaign-conversion-journey-service-mapping';
export const IS_USER = 'i';
export const HELLO_REF_ID = 'h';
export const UNIQUE_ID = 'u';
export const CREATED_AT = 'c';
export const SIGNED_UP_AT = 's';
export const HELLO_CHANNEL_LIST_COUNT = 100;
export const PAGE_SIZE_OPTIONS = [25, 50, 100];
export const SEGMENTO_PAGE_SIZE_OPTIONS = [100, 250, 500, 1000];
export const SHOW_PAGINATOR_LENGTH = 25;
export const SEGMENTO_SHOW_PAGINATOR_LENGTH = 99;
export const DEBOUNCE_TIME = 700;
export const DELAY_1000_MS = 1000;
export const SCROLL_DELAY = 10;
export const MAIL_COMPOSE_LOCAL_STORAGE = 'newComposeMail';
export const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEK_DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const WEEK_DAYS_LESS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const YEAR_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const JS_START_DATE: Date = new Date('1970-01-01');
export const TODAY: Date = new Date();
export const TOMORROW_DAY = (new Date().getDay() + 1) % 7;
export const TODAY_DAY = TODAY.getDay();
export const NEXT_MONTH = (TODAY.getMonth() + 1) % 12;
export const TODAY_DATE: number = TODAY.getDate();
export const META_TAG_ID = 'meta-tag-id-msg91-otp-provider';
export const JITSI_SCRIPT_TAG_ID = 'jitsi-script-tag-msg91-video-call';
export const MSG91_WIDGET_HIDE_LAUNCHER_STATUS = 'MSG91_WIDGET_HIDE_LAUNCHER_STATUS';
export const OVER_USAGE_LIMIT_TOOLTIP =
    'Maximum amount deductable from wallet after free credits are exhausted in real-time';
export const separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
export const SPECIAL_CHARACTERS_TO_REMOVE: string[] = [
    '~',
    '!',
    '@',
    '#',
    '$',
    '%',
    '^',
    '&',
    '*',
    '(',
    ')',
    '_',
    '-',
    '+',
    '=',
    '£',
];
export const FREE_IP_API = `https://api.db-ip.com/v2/free/self`;
export const smsURLs: { sendSMS: string; report: string; phonebook: string; virtualNumber: string } = {
    // sendSMS: '/user/index.php#campaign/send_sms',
    sendSMS: '/user/index.php#developer/flow_dashboard',
    report: '/user/index.php#campaign/summary_report',
    phonebook: '/user/index.php#phone_book',
    virtualNumber: '/user/index.php#campaign/lci',
};

export enum socketPresenceListener {
    JoinChannel = 'JoinChannel',
    LeaveChannel = 'LeaveChannel',
    Typing = 'Typing',
    NotTyping = 'NotTyping',
}

export enum TelegramBotEvents {
    MakeABot = 'make-a-new-bot',
    HaveABot = 'already-have-a-bot',
    Update = 'update-integration-data',
    QR = 'qr-url-exists',
}

export enum socketCommunicationListener {
    MessageListener = 'NewPublish',
    SignalListener = 'PublishSignal',
    HereNow = 'HereNow',
}

export enum socketEvents {
    JoinChannel = 'join-channel',
    LeaveChannel = 'leave-channel',
    Typing = 'typing',
    NotTyping = 'not-typing',
    subscribe = 'subscribe',
    unsubscribe = 'unsubscribe',
    PublishSignal = 'publish-signal',
    HereNow = 'here-now',
    AddFCMToken = 'add-token-for-notification',
    RemoveFCMToken = 'remove-token-for-notification',
}

export const LINE_CHART_COLORS = [
    { 'name': 'Delivered', 'value': 'var(--color-whatsApp-primary)' },
    { 'name': 'Complaints', 'value': 'var(--color-email-primary)' },
    { 'name': 'Opened', 'value': 'var(--color-common-primary)' },
    { 'name': 'Bounced', 'value': 'var(--color-common-rock)' },
    { 'name': 'Unsubscribed', 'value': 'var(--color-common-rock)' },
    { 'name': 'Total', 'value': 'var(--color-common-primary)' },
    { 'name': 'In Progress', 'value': 'var(--color-short-url-primary)' },
    { 'name': 'Failed', 'value': 'var(--color-email-primary)' },
    { 'name': 'Other', 'value': 'var(--color-common-rock)' },
    { 'name': 'Suppressed', 'value': 'var(--color-short-url-primary)' },
];

export const INCLUDES_PUBLIC_ROUTES = (url: string): boolean => {
    return url.includes('/p/unsubscribe/') ||
        url.includes('/p/v2/unsubscribe/') ||
        url.includes('/p/feedback') ||
        url.includes('/p/thanks') ||
        url.includes('/p/email-template-reference') ||
        url.includes('/p/chat-widget-dummy') ||
        url.includes('/p/client-video-call') ||
        url.includes('/p/domain/verification') ||
        url.includes('/p/add-fund') ||
        url.includes('/p/print-mail') ||
        url.includes('/p/plan-details')
        ? true
        : false;
};

/** Stores all the lazy loaded routes with their status
 * if the route has been loaded at least once.
 */
const LAZY_LOAD_ROUTES = new Map(
    Object.entries({
        'settings': false,
        'email': false,
        'rcs': false,
        'segmento': false,
        'campaigns': false,
        'hello': false,
        'whatsapp': false,
        'subscription': false,
        'voice': false,
        'shorturl': false,
        'otp': false,
        'sms': false,
        'reports': false,
        'files': false,
        'knowledgebase': false,
        'telegram': false,
        'notifications': false,
        'numbers': false,
    })
);

export const LAZY_LOAD_MODULES = (path: string, setPath?: boolean): boolean => {
    if (LAZY_LOAD_ROUTES.has(path) && !LAZY_LOAD_ROUTES.get(path)) {
        // The path is present and has value false, it means this route is reached for the first time
        if (setPath) {
            // Set the path to be visited to avoid showing of loading screen multiple times
            LAZY_LOAD_ROUTES.set(path, true);
        }
        return true;
    }
    return false;
};

export const SUPPORTED_CURRENCIES = {
    USD: '$',
    INR: '₹',
    GBP: '£',
};

export enum SelectDateRange {
    CurrentMonth,
    PreviousMonth,
    CurrentQuarter,
    PreviousQuarter,
}

export enum ReportMicroServiceTypeEnums {
    SMS = 'sms',
    OTP = 'otp',
    Email = 'mail',
    Whatsapp = 'wa',
    DLT = 'dlt',
    ShortURL = 'SHORT_URL',
    Numbers = 'numbers',
    Voice = 'voice',
    PushNotification = 'notification',
    AltPushNotification = 'pushNotification',
    OTP_DLT = 'otpDlt',
    OtpWidget = 'widget',
    Telegram = 'telegram',
    Bot = 'bot',
}

export enum AdminBotTypeEnums {
    Lex = 'LEX',
    Gpt = 'GPT',
    Embedding = 'EMBEDDING',
}

export enum AdminBotModelEnums {
    'GPT-3.5-turbo' = 'GPT-3.5-TURBO',
    'GPT-4-1106-preview' = 'GPT-4-1106-PREVIEW',
    'GPT-4o' = 'GPT-4O',
    'GPT-4-turbo' = 'GPT-4-TURBO',
    'GPT-4o-mini' = 'GPT-4O-MINI',
}

export const INTL_INPUT_OPTION: { [key: string]: any } = {
    nationalMode: true,
    utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.17/js/utils.js',
    autoHideDialCode: false,
    separateDialCode: false,
    initialCountry: 'auto',
};

export const getIntlTelInputOption = (widgetData: any) => {
    let inputOption = INTL_INPUT_OPTION;
    inputOption['geoIpLookup'] = function (success: any, failure: any) {
        let countryCode = widgetData?.defaultCountry?.iso2 ?? 'in';
        const fetchIPApi = ajax({
            url: FREE_IP_API,
            method: 'GET',
        });

        fetchIPApi.subscribe({
            next: (res: any) => {
                if (res?.response?.ipAddress) {
                    const fetchCountryByIpApi = ajax({
                        url: `http://ip-api.com/json/${res.response.ipAddress}`,
                        method: 'GET',
                    });

                    fetchCountryByIpApi.subscribe({
                        next: (fetchCountryByIpApiRes: any) => {
                            if (fetchCountryByIpApiRes?.response?.countryCode) {
                                return success(fetchCountryByIpApiRes.response.countryCode ?? countryCode);
                            } else {
                                return success(countryCode);
                            }
                        },
                        error: (fetchCountryByIpApiErr) => {
                            const fetchCountryByIpInfoApi = ajax({
                                url: `https://ipinfo.io/${res.response.ipAddress}/json`,
                                method: 'GET',
                            });

                            fetchCountryByIpInfoApi.subscribe({
                                next: (fetchCountryByIpInfoApiRes: any) => {
                                    if (fetchCountryByIpInfoApiRes?.response?.country) {
                                        return success(fetchCountryByIpInfoApiRes.response.country ?? countryCode);
                                    } else {
                                        return success(countryCode);
                                    }
                                },
                                error: (fetchCountryByIpInfoApiErr) => {
                                    return success(countryCode);
                                },
                            });
                        },
                    });
                } else {
                    return success(countryCode);
                }
            },
            error: (err) => {
                return success(countryCode);
            },
        });
    };
    return inputOption;
};

export const CURRENT_DATE = new Date();
export const DEFAULT_CURRENT_DATE_RANGE = cloneDeep({
    start: CURRENT_DATE,
    end: CURRENT_DATE,
});
export const DEFAULT_START_DATE = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
export const DEFAULT_START_DATE_SEVEN_DAYS_AGO = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate() - 6
);
export const DEFAULT_END_DATE = new Date();
export const DEFAULT_SELECTED_DATE_RANGE = cloneDeep({
    start: DEFAULT_START_DATE,
    end: DEFAULT_END_DATE,
});
export const DEFAULT_SEVEN_DAYS_DATE_RANGE = cloneDeep({
    start: DEFAULT_START_DATE_SEVEN_DAYS_AGO,
    end: DEFAULT_END_DATE,
});
export const DEFAULT_ONE_DAY_DATE_RANGE = cloneDeep({
    start: DEFAULT_END_DATE,
    end: DEFAULT_END_DATE,
});
export const ADMIN_NO_USER_SELECTED_MSG =
    'Currently there is no user selected. Please select a user using top-right search bar.';
export const SUPPORTED_LOG_EVENTS = ['Queued', 'Accepted', 'Delivered', 'Failed', 'Rejected', 'Bounced'];

export enum EventIdsEnum {
    Queued = 1,
    Accepted = 2,
    Rejected = 3,
    Delivered = 4,
    Opened = 5,
    Unsubscribed = 6,
    Clicked = 7,
    Bounced = 8,
    Failed = 9,
    Complaints = 10,
}
export const HELLO_SOCKET_RECONNECTION_DELAY = 1500;

export const HELLO_UNREAD_COUNT_INTERVAL = 5 * 60 * 1000; // 5 minutes

export enum InboxPurchaseDialogOpenFrom {
    Subscription = 'Subscription',
    Hello = 'Hello',
    WhatsApp = 'WhatsApp',
}

export const INBOX_TYPES = {
    EMAIL: 'mail',
    CHAT: 'chat',
    WHATSAPP: 'whatsapp',
    FACEBOOK: 'fb',
    INSTAGRAM: 'instagram',
    GOOGLE_BUSINESS: 'google_business',
    TELEGRAM: 'telegram',
    TWITTER: 'twitter',
    NUMBERS: 'numbers',
};

export const SHOW_INBOX_IN_LIST = (inbox: string, internalUser: boolean): boolean => {
    let inboxForInternalUse: any[] = [];
    let disabledInboxList = ['All Inbox Live'];
    if (disabledInboxList.find((e) => e === inbox) || (inboxForInternalUse.find((e) => e === inbox) && !internalUser)) {
        return false;
    }
    return true;
};

export const COMPARE_QUERIES = (query1: any, query2: any): boolean => {
    const customizer = (value1: any, value2: any): boolean | undefined => {
        // If we're not at a rule level, continue with the default comparison
        if (typeof value1 !== 'object' || typeof value2 !== 'object' || value1 === null || value2 === null) {
            console.log('return undefined');
            return undefined;
        }

        // Check if isSubOperator exists and is true
        if (value1.isSubOperator === true || value2.isSubOperator === true) {
            // Compare field.concat.path with field
            const field1 = value1.field && value1.path ? `${value1.field}.${value1.path}` : value1.field;
            const field2 = value2.field;

            if (field1 !== field2) {
                return false;
            }

            // Compare isSubOperator, path, suboperator, and type directly
            return ['isSubOperator', 'path', 'suboperator', 'type'].every((prop) =>
                isEqual(value1[prop], value2[prop])
            );
        }

        // If isSubOperator doesn't exist or is false, use default comparison
        return undefined;
    };

    return isEqualWith(query1, query2, customizer);
};

export const FontsKB = [
    { name: 'None', value: 'not-selected, sans-serif' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Times New Roman', value: 'Times New Roman, serif' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Helvetica', value: 'Helvetica, sans-serif' },
    { name: 'Palatino', value: 'Palatino, serif' },
    { name: 'Garamond', value: 'Garamond, serif' },
    { name: 'Calibri', value: 'Calibri, sans-serif' },
    { name: 'Cambria', value: 'Cambria, serif' },
    { name: 'Tahoma', value: 'Tahoma, sans-serif' },
    { name: 'Open Sans', value: 'Open Sans, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Noto Serif', value: 'Noto Serif, serif' },
    { name: 'Source Sans Pro', value: 'Source Sans Pro, sans-serif' },
    { name: 'Playfair Display', value: 'Playfair Display, serif' },
    { name: 'Crimson Text', value: 'Crimson Text, serif' },
    { name: 'Merriweather', value: 'Merriweather, serif' },
    { name: 'Patua One', value: 'Patua One, cursive' },
    { name: 'Lato', value: 'Lato, sans-serif' },
    { name: 'Montserrat', value: 'Montserrat, sans-serif' },
    { name: 'Alegreya', value: 'Alegreya, serif' },
    { name: 'Poppins', value: 'Poppins, sans-serif' },
    { name: 'Libre Baskerville', value: 'Libre Baskerville, serif' },
    { name: 'Cabin', value: 'Cabin, sans-serif' },
    { name: 'PT Serif', value: 'PT Serif, serif' },
];

export enum MaxUserOverusageLimit {
    INR = 1000000,
    Other = 10000,
}

export enum TimeEnum {
    Seconds = 1,
    Minutes = 2,
    Hours = 3,
    Days = 4,
    Months = 5,
}
export enum TimeShortNameEnum {
    sec = 1,
    min = 2,
    hr = 3,
    days = 4,
    months = 5,
}
export const HELLO_API_URL = (env: any): string => {
    // uncomment when hello start proxy support
    // return env.proxyServer + env.helloProxy;
    return env.helloApiUrl + '/isHelloAPI';
};

export const HTTP_HEADER_CONTENT =
    'A header is a part of the HTTP request that contains metadata about the payload being sent. It typically includes information such as the content type, content length, authentication tokens, and other relevant details. Headers help the server and the receiving endpoint understand how to process and interpret the data in the payload.';

export const MAKE_ARRAY_OF_ALPHABET_LIKE_CSV_HEADER = (n: number): string => {
    let baseChar = 'A'.charCodeAt(0),
        letter = '';
    do {
        n -= 1;
        letter = String.fromCharCode(baseChar + (n % 26)) + letter;
        n = (n / 26) >> 0; // quick `floor`
    } while (n > 0);
    return letter;
};
export enum VendorIDEnums {
    FB_CLOUD = 3,
    Haptik = 4,
    AISensy = 5,
    Dialog360 = 6,
}
export enum SubscriptionBasedServices {
    Email = 1,
    Segmento = 2,
    Numbers = 4,
    WhatsApp = 5,
    Voice = 6,
    Hello = 7,
    InvisibleOtp = 8,
}

export const ALLOWED_IMAGES_IN_FILE =
    'image/png, image/jpeg, image/jpg, image/gif, image/bmp, image/tiff, image/webp, image/svg+xml, image/eps, image/raw, image/ico, image/x-icon, image/vnd.microsoft.icon, application/postscript';
export const ALLOWED_FILE_FORMAT_IN_FILE =
    ALLOWED_IMAGES_IN_FILE + ', application/json, video/mp4, video/quicktime, application/pdf';

export const SMS_EXPORT_LOGS_FIELDS = [
    'requestDate',
    'flowID',
    'status',
    'deliveryDate',
    'deliveryTime',
    'requestId',
    'telNum',
    'countryName',
    'credit',
    'senderId',
    'DLT_TE_ID',
    'campaignName',
    'scheduleDateTime',
    'msgData',
    'route',
    'failureReason',
    'smsLength',
    'userIp',
];
export const HELLO_MESSAGE_INDEX_DB_KEY = 'channels';

export const WHATSAPP_EXPORT_LOGS_FIELDS = [
    'requestedAt',
    'integratedNumber',
    'requestId',
    'templateName',
    'messageType',
    'customerNumber',
    'direction',
    'price',
    'status',
    'sentTime',
    'readTime',
    'deliveryTime',
    'totalClicked',
    'campaignName',
];

export enum MailEventEnums {
    Queued = 1,
    Accepted = 2,
    Rejected = 3,
    Delivered = 4,
    Opened = 5,
    Unsubscribed = 6,
    Clicked = 7,
    Bounced = 8,
    Failed = 9,
    Complaints = 10,
}
export const OTP_WIDGET_EXPORT_LOGS_FIELDS = [
    'requestId',
    'widgetId',
    'companyId',
    'identifier',
    'requestTime',
    'token',
    'verified',
    'tokenVerified',
    'verifyRetryCount',
    'retryCount',
    'userIp',
    'host',
    'whatsapp',
    'email',
    'voice',
    'sms',
];

export const HELLO_FEEDBACK_RATING = {
    amazing: '😍',
    good: '🙂',
    ok: '😐',
    bad: '🙁',
    terrible: '😠',
};
export const VOICE_LOGS_EXPORT_FIELDS = [
    'createdAt',
    'duration',
    'source',
    'charged',
    'startTime',
    'endTime',
    'status',
    'destination',
    'type',
    'ivrInputs',
    'callerId',
    'agentId',
    'agentName',
    'destinationB',
    'failureReason',
    'direction',
];

export const DEFAULT_RINGTONE_URL = 'assets/audio/marimba_soft.mp3';
export const OTP_LOGS_EXPORT_FIELDS = [
    'requestDate',
    'flowID',
    'requestId',
    'telNum',
    'countryName',
    'status',
    'senderId',
    'DLT_TE_ID',
    'deliveryDate',
    'deliveryTime',
    'credit',
    'msgLength',
    'pauseReason',
    'voiceRetryCount',
    'otpRetry',
    'verified',
    'requestUserid',
    'otpVerCount',
    'failureReason',
    'campaignName',
    'userIp',
];

export const INVALID_EMAIL_TOOLTIP_MESSAGE =
    "The local part can be up to 64 characters in length and consist of any combination of alphabetic characters, digits, or any of the following special characters: \n\n ! # $ % & ‘ * + – / = ? ^ _ ` . { | } ~ \n\nNOTE: The period character ('.') is valid for the local part subject to the following restrictions: \n\n • it is not the first or last character \n • two or more consecutive periods";

export * from './hello-widget-integration';
