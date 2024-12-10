import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IClientState } from '../../reducers/client';

export const selectClient = createFeatureSelector<IClientState>('client');

export const selectClientName = createSelector(selectClient, (state) => (!state.pseudo_name ? state.name : null));
export const selectClientUUID = createSelector(selectClient, (state) => state.uuid);
export const selectPresenceChannel = createSelector(selectClient, (state) => state.presence_channel);
export const selectChatInputSubmitted = createSelector(selectClient, (state) => state.chatInputSubmitted);
export const selectIsClientBlocked = createSelector(selectClient, (state) => state.is_blocked);
