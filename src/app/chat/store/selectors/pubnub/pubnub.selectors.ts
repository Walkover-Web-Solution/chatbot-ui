import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IPubnubState } from '../../reducers/pubnub';

export const selectPubnub = createFeatureSelector<IPubnubState>('pubnub');

export const publishMessageInProcess = createSelector(selectPubnub, (state) => state.publishMessageInProcess);
export const reAuthenticationProcess = createSelector(selectPubnub, (state) => state.reAuthenticateInProcess);
export const pubnubInitializingInProgress = createSelector(selectPubnub, (state) => state.pubnubInitializingInProgress);
export const getChannelHistoryInProcess = createSelector(selectPubnub, (state) => state.getChannelMessagesInProcess);
export const getPubNubKeysInProcess = createSelector(selectPubnub, (state) => state.getPubNubKeysInProgress);
export const getPubNubNetworkStatus = createSelector(selectPubnub, (state) => state.pubnubStatus);
export const getPubNubDisconnectedTime = createSelector(selectPubnub, (state) => state.unsubscribeTime);
export const getSubscribedChannel = createSelector(selectPubnub, (state) => state.subscribedChannels);
