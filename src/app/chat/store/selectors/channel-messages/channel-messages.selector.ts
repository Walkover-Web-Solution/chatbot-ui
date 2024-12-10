import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IChannelMessageState } from '../../reducers/channel-messages';
import { IMessage } from '../../../model';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { IChannelsState } from '../../reducers/channels';
import { sortByTimeToken } from '../../../utils';
import { cloneDeep } from 'lodash-es';

export const selectChennelMessagesState = createFeatureSelector<IChannelMessageState>('channelMessages');

export const selectChennelsState = createFeatureSelector<IChannelsState>('channels');

export const channelMessageStore = (channel: string) =>
    createSelector(selectChennelMessagesState, (state) => state[channel]);
export const selectedChannelMessages = createSelector(
    selectChennelMessagesState,
    selectChennelsState,
    (state, channel): IMessage[] => {
        if (state[channel?.selectedChannel]) {
            const adapter: EntityAdapter<IMessage> = createEntityAdapter({
                selectId: (model) => (typeof model.timetoken === 'string' ? +model.timetoken : model.timetoken),
                sortComparer: sortByTimeToken,
            });
            const cloneMessageArray = cloneDeep(adapter.getSelectors().selectAll(state[channel?.selectedChannel]));
            for (let i = 0; i < cloneMessageArray.length; i++) {
                if (
                    ((cloneMessageArray[i]?.message as any).sender_id &&
                        (!cloneMessageArray[i - 1] || !(cloneMessageArray[i - 1]?.message as any)?.sender_id)) ||
                    ((cloneMessageArray[i]?.message as any).is_auto_response &&
                        (!cloneMessageArray[i - 1] || !(cloneMessageArray[i - 1]?.message as any)?.is_auto_response)) ||
                    (cloneMessageArray[i - 1]?.message as any)?.from_name !==
                        (cloneMessageArray[i]?.message as any).from_name
                ) {
                    (cloneMessageArray[i].message as any).firstAgentMsg = true;
                }
                if (
                    (cloneMessageArray[i].message as any).chat_id &&
                    (!cloneMessageArray[i + 1] ||
                        !(cloneMessageArray[i + 1].message as any).chat_id ||
                        (cloneMessageArray[i + 1].message as any).sender_id === 'bot')
                ) {
                    (cloneMessageArray[i].message as any).lastClientMsg = true;
                }
                if (
                    (cloneMessageArray[i].message as any).sender_id &&
                    (!cloneMessageArray[i + 1] || (cloneMessageArray[i + 1].message as any).chat_id)
                ) {
                    (cloneMessageArray[i].message as any).lastAgentMsg = true;
                }
                if (cloneMessageArray[i]?.message?.['message_type'] === 'interactive') {
                    cloneMessageArray[i].message['interactive'] = cloneMessageArray[i].message['content'];
                }
            }
            return cloneMessageArray;
        }
        return [];
    }
);
export const selectedChannelLoadedPageNo = createSelector(
    selectChennelMessagesState,
    selectChennelsState,
    (state, channel): number => {
        if (state[channel?.selectedChannel]) {
            const adapter: EntityAdapter<IMessage> = createEntityAdapter({
                selectId: (model) => (typeof model.timetoken === 'string' ? +model.timetoken : model.timetoken),
                sortComparer: sortByTimeToken,
            });
            return Math.ceil(adapter.getSelectors().selectAll(state[channel?.selectedChannel])?.length / 15);
        }
        return 0;
    }
);
export const getMessageLengthOfChannel = (channel: string) =>
    createSelector(selectChennelMessagesState, (state) => {
        const adapter: EntityAdapter<IMessage> = createEntityAdapter({
            selectId: (model) => (typeof model.timetoken === 'string' ? +model.timetoken : model.timetoken),
            sortComparer: sortByTimeToken,
        });
        return adapter.getSelectors().selectAll(state[channel])?.length || 0;
    });
export const getChannelMessages = (channel: string) =>
    createSelector(selectChennelMessagesState, (state): IMessage[] => {
        if (state[channel]) {
            const adapter: EntityAdapter<IMessage> = createEntityAdapter({
                selectId: (model) => (typeof model.timetoken === 'string' ? +model.timetoken : model.timetoken),
                sortComparer: sortByTimeToken,
            });
            return adapter.getSelectors().selectAll(state[channel]);
        }
        return [];
    });
export const selectedChannelBotSessionID = (channel: string) =>
    createSelector(selectChennelMessagesState, (state) => {
        let sessionId = null;
        for (let key in state[channel]?.entities) {
            if ((state[channel]?.entities[key]?.message as any)?.session_id) {
                sessionId = (state[channel]?.entities[key]?.message as any)?.session_id;
                return sessionId;
            }
        }
        return sessionId;
    });

export const greetingMessage = () =>
    createSelector(selectChennelsState, (state) => {
        return state?.greetingData;
    });
