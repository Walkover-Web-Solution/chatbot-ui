import { createAction, props } from '@ngrx/store';
import { IMessage, IPubNubKeys, Message } from '../../../model';
import * as Pubnub from 'pubnub';
import { IHistoryRequest, IHistoryResponse } from '../../../model/socket';

export const InitPubNubObject = createAction(
    '[Pubnub] Initialize PubNub',
    props<{
        request: { uuid: string; widgetToken: string; presence_channel?: string; message?: Message; channel?: string };
        reconnection: boolean;
    }>()
);
export const getPubNubKeys = createAction(
    '[Pubnub] Get Pubnub Keys',
    props<{
        request: { uuid: string; widgetToken: string; presence_channel: string; message?: Message; channel?: string };
    }>()
);
export const getPubNubKeysComplete = createAction(
    '[Pubnub] Get Pubnub Keys Complete',
    props<{ response: IPubNubKeys; uuid: string; presence_channel: string; message?: Message; channel?: string }>()
);
export const getPubNubKeysError = createAction('[Pubnub] Get Pubnub Keys Error', props<{ error?: any }>());
export const InitPubNubObjectComplete = createAction(
    '[Pubnub] Initialize PubNub Complete',
    props<{
        message?: Message;
        channel?: string;
    }>()
);

export const publishMessage = createAction(
    '[Pubnub] Publish Message',
    props<{
        request: {
            message: Message;
            channel: string;
            storeInHistory: boolean;
        };
    }>()
);
export const publishMessageComplete = createAction(
    '[Pubnub] Publish Message Complete',
    props<{
        response: {
            message: Message;
            channel: string;
            storeInHistory: boolean;
        };
    }>()
);
export const publishMessageError = createAction('[Pubnub] Publish Message Error', props<{ error?: any }>());

export const SubscribePresenceChannel = createAction(
    '[Pubnub] Subscribe Presence Channel',
    props<{ channel: string }>()
);
export const SubscribePresenceChannelComplete = createAction(
    '[Pubnub] Subscribe Presence Channel Complete',
    props<{ channel: string }>()
);
export const SubscribePresenceChannelError = createAction(
    '[Pubnub] Subscribe Presence Channel Error',
    props<{ error?: any }>()
);

export const SubscribeChannels = createAction('[Pubnub] Subscribe Channels', props<{ channel: string | string[] }>());
export const SubscribeChannelsComplete = createAction(
    '[Pubnub] Subscribe Channels Complete',
    props<{ channel: string | string[] }>()
);
export const SubscribeChannelsError = createAction('[Pubnub] Subscribe Channels Error', props<{ error?: any }>());

export const UnsubscribeChannels = createAction(
    '[Pubnub] Unsubscribe Channels',
    props<{ channel: string | string[] }>()
);
export const UnsubscribeChannelsComplete = createAction(
    '[Pubnub] Unsubscribe Channels Complete',
    props<{ channel: string | string[] }>()
);
export const UnsubscribeChannelsError = createAction('[Pubnub] Unsubscribe Channels Error', props<{ error?: any }>());

export const ReAuthPubNubInstance = createAction(
    '[Pubnub] Re-Auth Pubnub Instance',
    props<{ request: { uuid: string; widgetToken: string } }>()
);
export const ReAuthPubNubInstanceComplete = createAction(
    '[Pubnub] Re-Auth Pubnub Instance Complete',
    props<{ response: IPubNubKeys }>()
);
export const ReAuthPubNubInstanceError = createAction(
    '[Pubnub] Re-Auth Pubnub Instance Error',
    props<{ error?: any }>()
);

export const GetChannelHistory = createAction(
    '[Pubnub] Get Channel History',
    props<{ request: IHistoryRequest; reconnection?: boolean }>()
);
export const GetChannelHistoryComplete = createAction(
    '[Pubnub] Get Channel History Complete',
    props<{ response: IHistoryResponse; reconnection?: boolean }>()
);
export const GetChannelHistoryError = createAction(
    '[Pubnub] Get Channel History Error',
    props<{ error?: IHistoryResponse; reconnection?: boolean }>()
);

export const GetLastMessageOfChannels = createAction(
    '[Pubnub] Get LastMessage Of Channels',
    props<{ channels: string[]; token?: string }>()
);
export const GetLastMessageOfChannelsComplete = createAction(
    '[Pubnub] Get LastMessage Of Channels Complete',
    props<{ response: { [key: string]: IMessage } }>()
);
export const GetLastMessageOfChannelsError = createAction(
    '[Pubnub] Get LastMessage Of Channels Error',
    props<{ error?: Pubnub.PubnubStatus }>()
);

export const GetTotalMessageCountOfChannels = createAction(
    '[Pubnub] Get Total Message Count Of Channels',
    props<{ channels: string[] }>()
);
export const GetTotalMessageCountOfChannelsComplete = createAction(
    '[Pubnub] Get Total Message Count Of Channels Complete',
    props<{ response: Pubnub.MessageCountsResponse }>()
);
export const GetTotalMessageCountOfChannelsError = createAction(
    '[Pubnub] Get Total Message Count Of Channels Error',
    props<{ error?: Pubnub.PubnubStatus }>()
);

export const SetPubNubNetWorkStatus = createAction(
    '[Pubnub] Set PubNub NetWork Status',
    props<{ status: 'CONNECTED' | 'LOW-NETWORK' | 'DISCONNECTED' | 'RECONNECTED' }>()
);
