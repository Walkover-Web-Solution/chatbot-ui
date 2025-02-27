import { Action, createReducer, on } from '@ngrx/store';
import { IPubNubKeys } from '../../../model';
import * as actions from '../../actions';
import { cloneDeep, uniq } from 'lodash-es';
import * as Pubnub from 'pubnub';

export interface IPubnubState {
    isPubNubInitialized: boolean;
    pubnubKeys: IPubNubKeys;
    presenceChannel: string;
    error: any;
    subscribedChannels: string[];
    historyRequest: Pubnub.HistoryParameters;
    pubnubStatus: string;
    reAuthenticateInProcess: boolean;
    publishMessageInProcess: boolean;
    getChannelMessagesInProcess: boolean;
    pubnubInitializingInProgress: boolean;
    getPubNubKeysInProgress: boolean;
    unsubscribeTime: number;
}

export const initialState: IPubnubState = {
    isPubNubInitialized: false,
    pubnubKeys: null,
    presenceChannel: null,
    error: null,
    subscribedChannels: [],
    historyRequest: {
        stringifiedTimeToken: true,
        start: null,
        end: null,
        reverse: false,
        includeTimetoken: true,
        count: 15,
        channel: null,
        includeMeta: true,
    },
    pubnubStatus: null,
    publishMessageInProcess: false,
    reAuthenticateInProcess: false,
    pubnubInitializingInProgress: false,
    getPubNubKeysInProgress: false,
    getChannelMessagesInProcess: false,
    unsubscribeTime: null,
};
export const index = createReducer(
    initialState,
    on(actions.InitPubNubObject, (state, action) => ({
        ...state,
        pubnubInitializingInProgress: true,
    })),
    on(actions.getPubNubKeys, (state, action) => ({
        ...state,
        getPubNubKeysInProgress: true,
        pubnubKeys: null,
        error: null,
        isPubNubInitialized: false,
    })),
    on(actions.getPubNubKeysComplete, (state, action) => ({
        ...state,
        getPubNubKeysInProgress: false,
        pubnubKeys: action.response,
        error: null,
    })),
    on(actions.getPubNubKeysError, (state, action) => ({
        ...state,
        getPubNubKeysInProgress: false,
        pubnubKeys: null,
        error: action.error,
    })),
    on(actions.InitPubNubObjectComplete, (state, action) => ({
        ...state,
        pubnubInitializingInProgress: false,
        isPubNubInitialized: true,
    })),
    on(actions.ReAuthPubNubInstance, (state, action) => ({
        ...state,
        reAuthenticateInProcess: true,
        error: null,
    })),
    on(actions.ReAuthPubNubInstanceComplete, (state, action) => ({
        ...state,
        reAuthenticateInProcess: false,
        pubnubKeys: action.response,
        error: null,
    })),
    on(actions.ReAuthPubNubInstanceError, (state, action) => ({
        ...state,
        reAuthenticateInProcess: false,
        pubnubKeys: null,
        error: action.error,
    })),
    on(actions.SubscribePresenceChannel, (state, action) => ({
        ...state,
        presenceChannel: null,
        error: null,
    })),
    on(actions.SubscribePresenceChannelComplete, (state, action) => ({
        ...state,
        presenceChannel: action.channel,
        error: null,
    })),
    on(actions.SubscribePresenceChannelError, (state, action) => ({
        ...state,
        presenceChannel: null,
        error: action.error,
    })),
    on(actions.SubscribeChannels, (state, action) => ({
        ...state,
        error: null,
    })),
    on(actions.SubscribeChannelsComplete, (state, action) => ({
        ...state,
        subscribedChannels: uniq([...cloneDeep(state.subscribedChannels), ...action.channel]),
        error: null,
    })),
    on(actions.SubscribeChannelsError, (state, action) => ({
        ...state,
        error: action.error,
    })),
    on(actions.UnsubscribeChannels, (state, action) => ({
        ...state,
        error: null,
    })),
    on(actions.UnsubscribeChannelsComplete, (state, action) => ({
        ...state,
        subscribedChannels: cloneDeep(state.subscribedChannels)?.filter((x) => {
            if (typeof action.channel !== 'string') {
                return action.channel?.findIndex((m) => m === x) === -1;
            } else {
                return x !== action.channel;
            }
        }),
        error: null,
    })),
    on(actions.UnsubscribeChannelsError, (state, action) => ({
        ...state,
        error: action.error,
    })),
    on(actions.publishMessage, (state, action) => ({
        ...state,
        publishMessageInProcess: true,
        error: null,
    })),
    on(actions.publishMessageComplete, (state, action) => ({
        ...state,
        publishMessageInProcess: false,
        error: null,
    })),
    on(actions.publishMessageError, (state, action) => ({
        ...state,
        publishMessageInProcess: false,
        error: action.error,
    })),
    on(actions.SetPubNubNetWorkStatus, (state, action) => ({
        ...state,
        pubnubStatus: action.status,
        unsubscribeTime: action.status === 'DISCONNECTED' ? new Date().getTime() : state.unsubscribeTime,
    })),
    on(actions.SetChannelMessages, (state) => ({ ...state, unsubscribeTime: null, pubnubStatus: 'CONNECTED' })),
    on(actions.GetChannelHistory, (state) => ({ ...state, getChannelMessagesInProcess: true })),
    on(actions.GetChannelHistoryComplete, (state) => ({ ...state, getChannelMessagesInProcess: false })),
    on(actions.GetChannelHistoryError, (state, { reconnection }) => ({
        ...state,
        getChannelMessagesInProcess: false,
        pubnubStatus: reconnection ? 'DISCONNECTED' : state.pubnubStatus,
    })),
    on(actions.logout, (state) => ({ ...state, ...initialState }))
);

export function reducer(state: IPubnubState = initialState, action: Action) {
    return index(state, action);
}
