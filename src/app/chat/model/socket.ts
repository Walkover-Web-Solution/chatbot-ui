import { IMessage } from './message';

export interface ISocketListener {
    channel: string;
    message: any;
    timetoken: number;
}

export interface ISocketPresenceListener {
    channel: string;
    socketId: string;
    uuid: number | string;
}

export interface IPresenceStatusListener extends ISocketPresenceListener {
    action: 'join' | 'leave' | 'state-change' | 'timeout';
}

export interface IPresenceStateListener extends ISocketPresenceListener {
    action: 'typing' | 'not-typing';
}

export enum socketPresenceListener {
    JoinChannel = 'JoinChannel',
    LeaveChannel = 'LeaveChannel',
    Typing = 'Typing',
    NotTyping = 'NotTyping',
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
}

// export interface IHistoryRequest {
//     channel: string;
//     timetoken: number;
//     before?: number;
//     after?: number;
//     origin?: string;
// }

export interface IHistoryRequest {
    channel: string;
    origin: string;
    page_size: number;
    start_from: number;
}

export interface IHistoryResponse {
    success: boolean;
    message: string;
    data:
        | {
              data: IMessage[];
              last_unread_message_timetoken: number;
          }
        | IMessage[];
}

export interface ISocketAuthToken {
    jwt_token: string;
}

export interface SocketPresenceEvent {
    action: 'join' | 'leave' | 'state-change' | 'timeout';
    channel: string;
    state?: PresenceState;
    uuid: string;
}

export interface IPresenceState {
    action: 'typing' | 'not-typing';
}

export interface IClientPresenceState extends IPresenceState {
    channel: string;
}

export interface IAgentPresenceState extends IPresenceState {
    agentId: number;
    channel: string;
}

export type PresenceState = IClientPresenceState | IAgentPresenceState;
