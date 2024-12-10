import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IChannelsState, selectAll, selectEntities } from '../../reducers/channels';

export const selectChannels = createFeatureSelector<IChannelsState>('channels');
export const allChannels = createSelector(selectChannels, selectAll);
export const ChannelEntities = createSelector(selectChannels, selectEntities);
export const selectChannel = createSelector(
    ChannelEntities,
    selectChannels,
    (entities, state) => entities[state?.selectedChannel]
);
export const allChannelsNames = createSelector(allChannels, (channels) =>
    channels?.length ? channels.map((x) => x.channel) : null
);
export const selectedChannelStr = createSelector(selectChannels, (s) => s.selectedChannel);
export const selectedChannelID = createSelector(selectChannels, (s) => s?.entities[s?.selectedChannel]?.id);

export const selectCreateChannelInProcess = createSelector(selectChannels, (state) => state.createChannelInProcess);
export const selectChannelListInProcess = createSelector(selectChannels, (state) => state.getChannelsInProcess);
export const selectLastMessageOfChannelsInProcess = createSelector(
    selectChannels,
    (state) => state.getLastMessagesOfChannels
);
export const selectTotalMessageCountInProcess = createSelector(
    selectChannels,
    (state) => state.getTotalMessageCountOfChannels
);
export const selectReopenInProcess = createSelector(selectChannels, (state) => state.reopenChannelInProcess);
export const selectVideoCallURL = createSelector(selectChannels, (state) => state.videoCallURL);
