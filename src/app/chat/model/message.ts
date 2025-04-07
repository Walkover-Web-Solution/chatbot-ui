import { ValidatorFn } from '@angular/forms';

export type Message =
    // | IMessageModel
    // IWidgetMediaOutbound
    // | IWidgetTextOutbound
    // | IWidgetTextInbound
    // | IWidgetMediaInbound
    IFormMessage | IFeedbackMessage | IPostFeedback | DisplayMessage | IBlockedMessage;

export interface IFormMessage {
    id: number;
    type: MessageTypes;
    channel: string;
    country?: string;
    country_iso2: string;
    form?: {
        [key: string]: {
            value: any;
            validators: ValidatorFn[];
        };
    };
    formSubmitted: boolean;
}

export interface IPostFeedback {
    type: MessageTypes;
    token: string;
    feedback_msg: string;
    rating: Ratings;
    id?: number;
}

export interface IPushNotification {
    type: MessageTypes;
    content: string;
    message_type: string;
}

export interface IBlockedMessage {
    type: MessageTypes;
    value: boolean;
}

export enum Ratings {
    terrible = 'terrible',
    bad = 'bad',
    ok = 'ok',
    good = 'good',
    amazing = 'amazing',
}

export interface IFeedbackMessage {
    token: string;
    type: MessageTypes;
    feedback_msg?: string;
    rating?: Ratings;
    feedbackGiven: boolean;
    id: number;
}

export interface IMessage {
    channel: string;
    message: Message;
    id?: string;
    timetoken: number;
    meta?: {
        [key: string]: any;
    };
    actions?: {
        [type: string]: {
            [value: string]: Array<{
                uuid: string;
                actionTimetoken: string | number; // timetoken
            }>;
        };
    };
    state?: 'new';
}

export interface IInboundContent {
    message_id: string;
    message_type: string;
    mime_type: string;
    text: string;
    file_type: string;
    user_response?: string;
    payload?: IPayload;
    location?: ILocation;
}

export interface IOutboundContent {
    channel?: string;
    message_id: string;
    mime_type?: string;
    thumbnail_url?: string;
    description?: string;
    descriptions?: string[];
    dial_number?: string;
    end_time?: Date;
    function_name?: string;
    location_query?: string;
    media_url?: string;
    replies_list?: string[];
    replies_list_of_list?: string[];
    start_time?: Date;
    text?: string;
    text_to_show?: string;
    title?: string;
    url?: string;
}

export interface INotification {
    body: string;
    icon: string;
    title: string;
    data?: {
        notify: string;
        type: string;
        url: string;
    };
}

// export interface IInboundMessage {
//   attachment_url?: string;
//   chat_id: number;
//   content: IInboundContent;
//   fb_client_id?: string;
//   id?: number;
//   mime_type?: string;
//   thumbnail?: IThumbnail;
//   user_response?: string;
//   pn_gcm: {
//     notification: INotification;
//     type?: string;
//     uuid?: string;
//   };
//   type: MessageTypes;
// }

export interface IPayload {
    file_name: string;
    file_uri: string;
    mime_type: string;
}

export interface IThumbnail {
    file_uri: string;
    mime_type: string;
}

export interface ILocation {
    latitude: number;
    longitude: number;
}

// export interface IOutboundMessage {
//   attachment_url?: string;
//   content: string | IOutboundContent;
//   id: number;
//   uuid: string;
//   mime_type?: string;
//   notify?: string;
//   sender?: string;
//   type: MessageTypes;
//   pn_gcm?: {
//     notification: INotification;
//     sender?: string;
//     type?: string;
//   };
// }

// export type IWidgetTextInbound = IInboundMessage

// export type IWidgetMediaInbound = IInboundMessage

// export type IWidgetTextOutbound = IOutboundMessage

// export type IWidgetMediaOutbound = IOutboundMessage

export enum MessageTypes {
    CHAT = 'chat',
    FEEDBACK = 'feedback',
    POST_FEEDBACK = 'post-feedback',
    CALL = 'CALL',
    FORM = 'form',
    FORM_SUBMIT = 'form-submit',
    DELETE_MESSAGE = 'delete_message',
    WIDGET = 'widget',
    BLOCKED = 'widget-blocked',
    NOTIFICATIONS = 'notification',
    UPDATE = 'update',
    ASSIGN = 'assign',
}

export interface IMessageModel {
    type: MessageTypes;
    message_type: TMessageType;
    content: TContent;
    chat_id: number;
    sender_id?: number | 'bot';
    firstAgentMsg?: boolean;
    lastClientMsg?: boolean;
    lastAgentMsg?: boolean;
}

export interface IInboundMessageModel extends IMessageModel {
    pn_gcm?: {
        notification: INotification;
        sender?: string;
        type?: string;
    };
    uuid?: string;
    session_id?: string;
}

export interface IOutboundMessageModel extends IMessageModel {
    sender_id: number | 'bot';
    session_id?: string;
    is_auto_response?: boolean;
}

export type TMessageType = 'text' | 'attachment' | 'text-attachment' | 'video_call';

export type TDisplayMessageType = 'note' | 'chat' | 'email' | 'mail' | 'whatsapp' | 'rcs' | 'fb';

export type TContent = ITextAttactmentContent;

export interface ITextContent {
    text: string;
    expiration_time?: number;
    options?: any[];
}

export interface IAttachmentContent {
    attachment: IAttachment[];
}

export interface IAttachment {
    extension: string;
    name: string;
    path: string;
    mime_type: string;
    caption: string;
    thumbnail_url: string;
}

export interface ITextAttactmentContent extends ITextContent, IAttachmentContent {}

export interface IChatOutbound extends IOutboundMessageModel {}

export interface IChatInbound extends IInboundMessageModel {}

export type DisplayMessage = IChatOutbound | IChatInbound;
