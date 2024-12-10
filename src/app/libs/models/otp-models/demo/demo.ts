export interface SendDemoOtpReqModel {
    countryCode: string;
    mobileNumber: string;
}

export interface VerifyDemoOtpReqModel extends SendDemoOtpReqModel {
    otp: string;
}

export interface IOtpWidgetResponse extends IOtpWidgetPaginationResponse {
    data: IOTPWidget[];
}

export interface IOtpWidgetPaginationResponse {
    itemsPerPage: number;
    pageNo: number;
    totalEntityCount: number;
    totalPageCount: number;
}
export interface IOTPWidget {
    widget_id: string;
    name: string;
    widgetType: {
        value: string;
        name: string;
    };
    processType: {
        value: string;
        name: string;
    };
    otpLength: string;
    status: {
        value: string;
        name: string;
    };
    verificationType?: '1' | '2';
    redirectionUrl?: string;
    widgetMeta?: {
        redirectionUrl?: string;
    };
    companyId: string;
    lastUpdatedAt: string;
    createdAt: string;
    retryTime?: string;
    retryCount?: number;
    expiryTime?: string;
    captchaValidations?: number;
    countriesDefaultChannel?: { [key: string]: Array<string> };
    processes: IWidgetProcess[];
    invisible: number;
    globalDefaultChannel: string;
    iFrame: number;
    mobileIntegration: number;
    defaultCountry: any;
}

export interface IWidgetProcess {
    channel: {
        value: string;
        name: string;
    };
    processId: string;
    processVia: {
        value: string;
        name: string;
    };
    templateId: string;
    templateVariables: { [key: string]: any };
    otpVariable?: string;
    // Email
    fromEmail?: string;
    fromName?: string;
    domain?: string;
    domain_id?: string;
    // Voice
    callerId?: string;
    callerIdType?: number;
    // WhatsApp
    integrated_number?: string;
    language?: string;
    use_default?: boolean;
    sendType?: number;
    integrationId?: number;
}

export interface ICreateEditWidgetReq {
    widget_id?: string;
    name: string;
    widgetType:
        | number
        | {
              value: string;
              name: string;
          };
    processType:
        | number
        | {
              value: string;
              name: string;
          };
    otpLength: number;
    processes: ICreateEditWidgetProcess[];
}

export interface ICreateEditWidgetProcess {
    processVia:
        | number
        | {
              value: string;
              name: string;
          };
    channel: {
        value: string;
        name: string;
    };
    retryVia: string;
    templateId: string;
    templateVariables:
        | {
              type: string;
              length: string;
          }
        | {
              id: string;
              brand_name: string;
          }
        | {
              process_type: string;
              length: string;
              status: string;
          }
        | {};
}

export interface ICreateEditWidgetRes extends IOTPWidget {
    processes: IWidgetProcess[];
}

export interface ICreateEditWidgetResProcess extends ICreateEditWidgetProcess {
    widgetType: number;
    processId: string;
}

export interface ISendOTPChannels {
    primaryChannels: { [key: string]: string };
    retryChannels: { [key: string]: string };
    mobileChannels: { [key: string]: string };
}

export enum WidgetTypeEnums {
    Default = '1',
    Custom = '2',
}

export enum ProcessTypeEnums {
    Both = '1',
    Mobile = '2',
    Email = '3',
    Retry = '5',
}

export enum WidgetVerificationTypeEnums {
    OTP = '1',
    MagicLink = '2',
}

export enum ChannelTypeEnums {
    Email = '3',
    Voice = '4',
    SMS = '11',
    Whatsapp = '12',
    InvisibleOTP = '0',
}

export enum CallerIdTypeEnums {
    Local = 1,
    Global = 2,
}

export enum EmailSendTypeEnums {
    Domain = 1,
    Connection = 2,
}

export const OTP_PROCESS_TYPES = [
    {
        label: 'Mobile Number',
        value: ProcessTypeEnums.Mobile,
    },
    {
        label: 'Email',
        value: ProcessTypeEnums.Email,
    },
    {
        label: 'Both',
        value: ProcessTypeEnums.Both,
    },
];

export const OTP_WIDGET_CHANNEL_TYPE_ICONS = {
    [ChannelTypeEnums.Email]: { labelName: 'Email', iconName: 'email' },
    [ChannelTypeEnums.Voice]: { labelName: 'Voice', iconName: 'voice' },
    [ChannelTypeEnums.SMS]: { labelName: 'SMS', iconName: 'sms' },
    [ChannelTypeEnums.Whatsapp]: { labelName: 'WhatsApp', iconName: 'whatsapp' },
    [ChannelTypeEnums.InvisibleOTP]: { labelName: 'Invisible OTP', iconName: 'invisibleotp' },
};

export const OTP_VARIABLE_KEY_MAPPING = {
    [ChannelTypeEnums.SMS]: 'otpVariableSms',
    [ChannelTypeEnums.Whatsapp]: 'otpVariableWhatsApp',
    [ChannelTypeEnums.Voice]: 'otpVariableVoice',
    [ChannelTypeEnums.Email]: 'otpVariable',
};

export interface IOtpWidgetCountriesRes {
    id: number;
    name: string;
    countryCode: number;
    shortName: string;
}

export interface IDemoIdentifiers {
    id: number;
    name: string;
    identifier: string;
    otp_widget_id: number;
    otp: string;
    created_at: string;
    updated_at: string;
}

export interface IDemoIdentifiersResponse extends IOtpWidgetPaginationResponse {
    data: IDemoIdentifiers[];
}

export interface IOTPWebhook {
    created_at: string;
    headers: { [key: string]: string };
    id: number;
    otp_widget_id: number;
    updated_at: string;
    url: string;
}
