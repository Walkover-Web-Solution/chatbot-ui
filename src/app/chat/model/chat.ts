import { Validators } from '@angular/forms';
import { IAttachment, IMessage } from './message';

export interface IPublisherInfo {
    name: string;
    status: string;
    avatar: string;
}

export type ActiveView = 'Chat' | 'FAQ';

export interface IParam {
    id: string;
    name: string;
    type: string;
    country?: string;
    isDefault: boolean;
    validators?: Validators[];
}

export interface IInitWidgetReq {
    widgetToken: string;
    unique_id?: string;
    number?: string;
    mail?: string;
    name?: string;
    additionalData?: IAdditionalData;
    client_uuid?: string;
}

export interface IClientParam {
    default_params: IParam[];
    custom_params: IParam[];
    standard_params: IParam[];
}

/*export class IMessage {
  Id: string;
  from: IPublisherInfo;
  text: string;
  type: 'received' | 'sent';
  date: number;
}*/

export interface IPubNubKeys {
    authkey: string;
    pubkey: string;
    subkey: string;
}

export interface IAdditionalData {
    [key: string]: any;
}

export interface IWidgetInfo {
    auto_focus: boolean;
    // chatbot: boolean;
    classify: boolean;
    enable_call: boolean;
    enable_faq: boolean;
    hide_launcher: boolean;
    name: string;
    show_close_button: boolean;
    show_send_button: boolean;
    tagline: string;
    teams: IWidgetTeam[];
    show_faq: boolean;
    primary_color?: string;
    company_id?: number;
    event_channels: Array<string>;
    show_widget_form?: boolean;
    chat_status?: CHAT_STATUS;
}

export enum CHAT_STATUS {
    allowed = 1,
    partiallyAllowed = 0,
    disabled = 2,
}

export interface IClientChannel extends IChannel {
    uuid: string;
    country: string;
    country_iso2: string;
    mail?: string;
    name?: string;
    number?: string;
    customer_mail?: string;
    customer_name?: string;
    customer_number?: string;
    presence_channel: string;
    unique_id: string;
    channels?: IChannel[];
    pseudo_name?: boolean;
    // messages
    // last_seen
    // last_read
}

export interface IClientListResp {
    name: string;
    number: string;
    mail: string;
    unique_id?: any;
    uuid: string;
    channels: IChannel[];
    call_enabled: boolean;
    country: string;
    presence_channel: string;
    pseudo_name?: boolean;
    is_blocked?: boolean;
}

export interface IClient {
    name?: string;
    number?: string;
    uuid: string;
    pseudo_name?: boolean;
    call_enabled: boolean;
    country: string;
    country_iso2: string;
    mail?: string;
    presence_channel: string;
    unique_id: string;
    team_id?: number;
    new?: boolean;
    is_blocked?: boolean;
    customer_mail?: string;
    customer_name?: string;
    customer_number?: string;
}

export interface IWidgetAgent {
    id: number;
    name: string;
    username: string;
}

export interface IWidgetTeam {
    id: number;
    name: string;
}

export interface IFAQ {
    id: string;
    article_count: number;
    description: string;
    icon_url: string;
    name: string;
}

export interface IArticle {
    author_id: number;
    folder_id: string;
    html: string;
    id: string;
    is_published: boolean;
    keywords: string[];
    slug: string;
    title: string;
    formattedTitle?: string;
}

export interface IChannel {
    channel: string;
    id: number;
    assigned_id: number;
    assigned_to: IWidgetAgent;
    assigned_type: 'agent' | 'team' | 'bot';
    call_enabled: boolean;
    is_closed: boolean;
    team_id: number;
    widget_unread_count: number;
    cc_unread_count: number;
    total_message_count?: number;
    // last_Message?: IMessage;
    last_message?: IMessage;
    new?: boolean;
    uuid?: string;
}

export type CHAT_SECTION_VALUE = 'CHANNEL_LIST' | 'TEAM_LIST' | 'SELECTED_CHANNEL';

export enum CHAT_SECTION {
    channelList = 'CHANNEL_LIST',
    teamList = 'TEAM_LIST',
    selectedChannel = 'SELECTED_CHANNEL',
}

export enum FAQ_SECTION {
    searchResult = 'searchResult',
    folderList = 'folderList',
    articleList = 'articleList',
    miniViewArticle = 'miniViewArticle',
    fullViewArticle = 'fullViewArticle',
}

export class BaseHttpOP<T1, T2> {
    request: T1;
    response: T2;
    routParam: any;
    queryParam: any;
}

export enum AfterMessagePublishOperation {
    AddUnreadCount = 'AddUnreadCount',
    AddUnreadNotification = 'AddUnreadNotification',
    AddFormMessage = 'AddFormMessage',
    botConversation = 'botConversation',
    classifyChannel = 'classifyChannel',
}

export interface AgentTeamResponse {
    agents: AgentResponse[];
    teams: TeamResponse[];
}

export class AgentResponse {
    id: number;
    name: string;
    image_url: string;
    teams: number[];
}

export class TeamResponse {
    id: number;
    name: string;
    agents: number[];
}

export interface SendUnreadNotificationReq {
    message: string;
    attachment: string;
    date_time: number;
    channel: string;
}

export interface IPhoneValidation {
    success: boolean;
    message: string;
    data: {
        is_valid: boolean;
        country: string;
        country_code: number;
        country_short_name: string;
    };
}

export interface IClassificationChannel {
    status: string;
    message: 'Classified' | 'UnClassified';
    data: {
        assignee_type: 'team' | 'agent';
        assignee_id: number;
    };
}

export interface IFileResponse {
    body: {
        attachment_url: string;
    };
    data: IAttachment[];
    message: string;
    status: 'Success' | 'Failed';
    success: boolean;
}

export interface IChannelAssignees {
    assigneeName: string;
    assignees?: string[];
    assigneeBot?: boolean;
}
