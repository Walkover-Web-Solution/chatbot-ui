export interface IWhatsAppClientTemplatesRespModel {
    category: string;
    name: string;
    namespace: string;
    languages: ILanguagesModel[];
    integrated_number?: string;
}

export interface ILanguagesModel {
    id: string;
    language: string;
    status: string;
    rejection_reason: string;
    code: IWhatsAppClientTemplatesJsonCodeRespModel[];
    variables?: string[];
    variable_type?: { [key: string]: any };
}

export interface IWhatsAppClientTemplatesJsonCodeRespModel {
    format?: string;
    text?: string;
    type?: string;
    buttons?: any[];
    example?: any;
    cards?: IWhatsAppClientTemplatesCarouselCard[];
}

export interface IWhatsAppClientTemplatesCarouselCard {
    components: IWhatsAppClientTemplatesJsonCodeRespModel[];
}

export interface IWhatsAppTemplateRequestBody {
    name: string;
    language: string;
    namespace: string;
    template_code: IWhatsAppClientTemplatesJsonCodeRespModel[];
    integrated_number: string;
    one_inbox_id?: string;
}

export interface IWhatsAppTemplateJsonCodeResp {
    // integrated_number: string;
    // content_type: string;
    // payload: IPayloadObj;
    // authkey: string;
    endpoint: string;
    authkey: string;
    header: any;
    raw_data: any;
}

export interface ICreateEditWhatsAppTemplateRequestBody {
    integrated_number: string;
    template_name: string;
    language: string;
    category: string;
    components: IWhatsAppClientTemplatesJsonCodeRespModel[];
    button_url?: boolean;
}

export interface IPayloadObj {
    to: string;
    type: string;
    template: ITemplateObj;
}

export interface ITemplateObj {
    name: string;
    language: ILanguageObj;
    namespace: string;
    components: IComponentObj[];
}

export interface ILanguageObj {
    code: string;
    policy: string;
}

export interface IComponentObj {
    type: string;
    parameters: IParameterObj[];
}

export interface IParameterObj {
    type: string;
    text: string;
}

export enum WhatsAppHeaderType {
    Text = 'TEXT',
    Media = 'MEDIA',
    Location = 'LOCATION',
}
export enum WhatsAppInteractiveHeaderType {
    Text = 'text',
    Image = 'image',
    Sticker = 'sticker',
    Video = 'video',
    Audio = 'audio',
    Document = 'document',
}
export enum WhatsAppHeaderMediaType {
    Document = 'DOCUMENT',
    Image = 'IMAGE',
    Video = 'VIDEO',
}

export enum WhatsAppButtonsType {
    QuickReply = 'QUICK_REPLY',
    CallToAction = 'CALL_TO_ACTION',
    // MarketingOptOut = 'MARKET_OPT_OUT',
}
export enum WhatsAppButtonsCallToActionType {
    PhoneNumber = 'PHONE_NUMBER',
    Url = 'URL',
}
export enum WhatsAppCatalogueType {
    Catalogue = 'CATALOG',
    Mpm = 'MPM',
}

export enum WhatsAppTemplateCategory {
    Utility = 'UTILITY',
    Marketing = 'MARKETING',
    Authentication = 'AUTHENTICATION',
}

export enum WhatsAppInteractiveMessageType {
    Button = 'button',
    List = 'list',
    Product = 'product',
    ProductList = 'product_list',
    Media = 'attachment',
    Cta = 'cta_url',
    UnassignBot = 'unassigned_bot',
    Text = 'text',
}
export enum WhatsappEditorFormatChar {
    Bold = '*',
    Italic = '_',
    Strikethrough = '~',
    Code = '```',
}

export const FORMAT_WHATSAPP_BODY = {
    bold: {
        regex: /(\s|\>|_|~|^)\*([^*]|(?:(?!\s)(?:(?!\*[\W_]).)+(?:[^\s])))\*(?=([\W_]|$))/gm,
        replace: `$1<strong> $2 </strong>`,
    },
    italic: {
        regex: /(\s|\>|\*|~|^)_([^_]|(?:(?!\s)(?:(?!_[\W_]).)+(?:[^\s])))_(?=([\W_]|$))/gm,
        replace: `$1<i> $2 </i>`,
    },
    strikeThrough: {
        regex: /(\s|\>|\*|_|^)~([^~]|(?:(?!\s)(?:(?!~[\W_]).)+(?:[^\s])))~(?=([\W_]|$))/gm,
        replace: `$1<s> $2 </s>`,
    },
    code: {
        regex: /```((?:(?!```).)+)```/gm,
        replace: `<code>$1</code>`,
    },
};

export interface ButtonUrlResponse {
    [key: string]: {
        [key: string]: string;
    };
}

export interface ILanguageWiseSampleData {
    [key: string]: ISampleData;
}

export interface ISampleData {
    header?: string;
    body?: string[];
    button?: string[];
    carousel?: {
        header?: string;
        cards?: {
            body?: string[];
            button?: string[];
        }[];
    };
}

export interface ILanguageVariablesForSample {
    header: any;
    body: string[];
    button?: { [key: string]: any }[];
    carousel?: {
        header?: any;
        cards?: { body: string[]; button?: { [key: string]: any }[] }[];
    };
}

export enum WhatsappMarketingTypeEnum {
    Custom = 'custom',
    Product = 'product',
    Carousel = 'carousel',
}

export const WHATSAPP_MARKETING_TYPES = [
    {
        label: 'Custom',
        value: WhatsappMarketingTypeEnum.Custom,
        description: 'Send promotional offers, announcements and more to increase awareness and engagement.',
    },
    {
        label: 'Product',
        value: WhatsappMarketingTypeEnum.Product,
        description: 'Send messages about your entire catalogue or multiple products from it.',
    },
    {
        label: 'Carousel',
        value: WhatsappMarketingTypeEnum.Carousel,
        description: '',
    },
];

export const WHATSAPP_PRODUCT_TYPES = [
    {
        label: 'Catalogue',
        value: WhatsAppCatalogueType.Catalogue,
        description: 'Include the entire catalogue to give your users a comprehensive view of all of your products.',
    },
    {
        label: 'Multi-product',
        value: WhatsAppCatalogueType.Mpm,
        description:
            'Include up to 30 products from the catalogue. Useful for showcasing new collection or a specific product category.',
    },
];
