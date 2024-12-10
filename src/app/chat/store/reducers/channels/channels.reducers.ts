import { Action, createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState, Update } from '@ngrx/entity';
import { IChannel, IOutboundMessageModel, MessageTypes } from '../../../model';
import * as actions from '../../actions';
import { logout } from '../../actions';
import { getCookie, removeCookie, setCookie, sortByTimeTokenChannel } from '../../../utils';
import { cloneDeep } from 'lodash-es';
import { environment } from 'src/environments/environment';

export interface IChannelsState extends EntityState<IChannel> {
    selectedChannel: string;
    getChannelsInProcess: boolean;
    createChannelInProcess: boolean;
    reopenChannelInProcess: boolean;
    getLastMessagesOfChannels: boolean;
    getTotalMessageCountOfChannels: boolean;
    videoCallURL: string;
    error: any;
    greetingData: {
        text: string;
        options: [];
        timetoken: number;
    };
}

const channelAdapter: EntityAdapter<IChannel> = createEntityAdapter({
    selectId: (channel) => channel.channel,
    sortComparer: sortByTimeTokenChannel,
});
export const initialState: IChannelsState = channelAdapter.getInitialState({
    entities: {},
    ids: [],
    selectedChannel: null,
    getChannelsInProcess: false,
    createChannelInProcess: false,
    reopenChannelInProcess: false,
    getLastMessagesOfChannels: false,
    getTotalMessageCountOfChannels: false,
    videoCallURL: null,
    error: null,
    greetingData: {
        text: '',
        options: [],
        timetoken: 0,
    },
});
export const index = createReducer(
    initialState,
    on(actions.getChannelList, (state) => ({ ...state, getChannelsInProcess: true })),
    on(actions.resetChannelList, () => initialState),
    on(actions.getChannelListSuccess, (state) => ({ ...state, getChannelsInProcess: false })),
    on(actions.setChannels, (state, { channels, uuid }) => {
        if (channels?.length) {
            let channelsClone = [];
            for (let channel of cloneDeep(channels)) {
                channelsClone.push({ ...channel, uuid });
            }
            return channelAdapter.upsertMany(channelsClone, state);
        }
        return { ...state };
    }),
    on(actions.CreateChannel, (state, action) => ({
        ...state,
        createChannelInProcess: true,
    })),
    on(actions.CreateChannelComplete, (state, action) => {
        return {
            ...channelAdapter.addOne(action.response.channel, state),
            createChannelInProcess: false,
        };
    }),
    on(actions.CreateChannelComplete, (state, action) => {
        const newChannel = action.response.channel;
        let removedEntities = [];
        for (let entity in state.entities) {
            if (state.entities[entity].uuid !== newChannel.uuid) {
                removedEntities.push(entity);
            }
        }
        if (getCookie('hello-widget-anonymous-uuid')) {
            // User converted from anonymous to known, remove the anonymous cookie and set the widget cookie
            removeCookie('hello-widget-anonymous-uuid');
            setCookie('hello-widget-uuid', newChannel.uuid, environment.uuidExpiryInDays);
        }
        if (removedEntities?.length) {
            setCookie('hello-widget-uuid', newChannel.uuid, environment.uuidExpiryInDays);
            return {
                ...channelAdapter.removeMany(removedEntities, state),
                createChannelInProcess: false,
            };
        } else {
            return {
                ...state,
                createChannelInProcess: false,
            };
        }
    }),
    on(actions.CreateChannelError, (state, { error }) => ({
        ...state,
        error: error,
        createChannelInProcess: false,
    })),
    on(actions.ReopenChannel, (state, action) => ({
        ...state,
        reopenChannelInProcess: true,
    })),
    on(actions.ReopenChannelComplete, (state, action) => {
        return {
            ...channelAdapter.upsertOne(action.response.channel, state),
            reopenChannelInProcess: false,
        };
    }),
    on(actions.ReopenChannelError, (state, { error }) => ({
        ...state,
        error: error,
        reopenChannelInProcess: false,
    })),
    on(actions.selectChannel, (state, { channel }) => ({ ...state, selectedChannel: channel })),
    on(actions.GetLastMessageOfChannels, (state) => ({ ...state, getLastMessagesOfChannels: true })),
    on(actions.GetLastMessageOfChannelsError, (state) => ({ ...state, getLastMessagesOfChannels: false })),
    on(actions.GetLastMessageOfChannelsComplete, (state, { response }) => {
        if (response) {
            const allChannels = channelAdapter.getSelectors().selectAll(state);
            const updatedChannels: Update<IChannel>[] = [];
            for (const channel in response) {
                const temp = allChannels.find((c) => c.channel === channel);
                if (temp) {
                    updatedChannels.push({
                        id: channel,
                        changes: {
                            last_message: response[channel],
                        },
                    });
                }
            }
            return { ...channelAdapter.updateMany(updatedChannels, state), getLastMessagesOfChannels: false };
        }
        return {
            ...state,
            getLastMessagesOfChannels: false,
        };
    }),
    on(actions.GetTotalMessageCountOfChannels, (state) => ({ ...state, getTotalMessageCountOfChannels: true })),
    on(actions.GetTotalMessageCountOfChannelsError, (state) => ({ ...state, getTotalMessageCountOfChannels: false })),
    on(actions.GetTotalMessageCountOfChannelsComplete, (state, { response }) => {
        if (response.channels) {
            const allChannels = channelAdapter.getSelectors().selectAll(state);
            const updatedChannels: Update<IChannel>[] = [];
            for (const channel in response?.channels) {
                const temp = allChannels.find((c) => c.channel === channel);
                if (temp) {
                    updatedChannels.push({
                        id: channel,
                        changes: {
                            total_message_count: response.channels[channel],
                        },
                    });
                }
            }
            return { ...channelAdapter.updateMany(updatedChannels, state), getTotalMessageCountOfChannels: false };
        }
        return {
            ...state,
            getTotalMessageCountOfChannels: false,
        };
    }),
    on(actions.deleteUnreadCountComplete, (state, { channel }) => {
        const selectedChannel = channelAdapter.getSelectors().selectEntities(state)[state?.selectedChannel];
        if (selectedChannel?.widget_unread_count) {
            return channelAdapter.updateOne(
                {
                    id: channel,
                    changes: {
                        widget_unread_count: 0,
                    },
                },
                state
            );
        }
        return { ...state };
    }),
    on(actions.UpdateLastMessage, (state, { response: { channel, message } }) => {
        return channelAdapter.updateOne(
            {
                id: channel,
                changes: {
                    last_message: message,
                },
            },
            state
        );
    }),
    on(actions.UpdateChannel, (state, { response: { channel, channelData } }) => {
        let channelDetails = (channelData as any)?.message?.channel_details;
        return channelAdapter.updateOne(
            {
                id: channelDetails?.channel,
                changes: {
                    ...channelDetails,
                    assigned_id: channelDetails?.assignee_id,
                    assigned_to: null,
                    assigned_type: channelDetails?.assignee_type,
                    assigneeChange: true,
                },
            },
            state
        );
    }),
    on(actions.AddNewMessage, (state, { response: { channel, message } }) => {
        if (message.message.type === MessageTypes.CHAT || message.message.type === MessageTypes.WIDGET) {
            const msg = message.message as IOutboundMessageModel;
            if (msg.sender_id || msg.is_auto_response) {
                return channelAdapter.updateOne(
                    {
                        id: channel,
                        changes: {
                            // widget_unread_count: channel !== state?.selectedChannel || (state.entities[channel]?.widget_unread_count > 0) ? state.entities[channel].widget_unread_count + 1 : state.entities[channel].widget_unread_count,
                            widget_unread_count:
                                msg.sender_id === 'bot' ? 0 : (state.entities[channel]?.widget_unread_count || 0) + 1,
                            assigned_type: msg.sender_id === 'bot' ? null : 'agent',
                            assigned_id: msg.sender_id === 'bot' ? null : +msg.sender_id,
                            cc_unread_count:
                                state.selectedChannel === channel ? 0 : state.entities[channel]?.cc_unread_count,
                            last_message: message,
                        },
                    },
                    state
                );
            } else {
                return channelAdapter.updateOne(
                    {
                        id: channel,
                        changes: {
                            cc_unread_count: (state.entities[channel]?.cc_unread_count || 0) + 1,
                            last_message: message,
                            widget_unread_count:
                                state.selectedChannel === channel ? 0 : state.entities[channel]?.widget_unread_count,
                        },
                    },
                    state
                );
            }
        }
        return {
            ...state,
        };
    }),
    on(actions.channelStateChange, (state, { channel, channelClosed }) => {
        return channelAdapter.updateOne(
            {
                changes: { is_closed: channelClosed },
                id: channel,
            },
            state
        );
    }),
    on(actions.agentReadTheMessages, (state, { channel, read }) => {
        if (read) {
            return channelAdapter.updateOne(
                {
                    changes: { cc_unread_count: 0 },
                    id: channel,
                },
                state
            );
        }
        return {
            ...state,
        };
    }),
    on(actions.setCallStatus, (state, { callStatusChanged, channel }) => {
        return channelAdapter.updateOne(
            {
                id: channel,
                changes: {
                    call_enabled: callStatusChanged,
                },
            },
            state
        );
    }),
    on(actions.AfterPublishOperationsComplete, (state, { response: { channel, classification } }) => {
        if (classification?.message === 'Classified') {
            return channelAdapter.updateOne(
                {
                    id: channel,
                    changes: {
                        assigned_id: classification.data.assignee_id,
                        assigned_type: classification.data.assignee_type,
                    },
                },
                state
            );
        }
        return {
            ...state,
        };
    }),
    on(actions.setVideoCallURL, (state, { channel, url }) => {
        return {
            ...state,
            videoCallURL: url,
        };
    }),
    on(logout, (state) => ({ ...state, ...initialState })),
    on(actions.getGreetingSuccess, (state, { data }) => {
        return {
            ...state,
            greetingData: {
                text: data?.greeting?.text,
                options: data?.greeting?.options,
                timetoken: data?.greeting?.timetoken,
            },
        };
    })
);

export function reducer(state: IChannelsState = initialState, action: Action) {
    return index(state, action);
}

export const { selectIds, selectEntities, selectAll, selectTotal } = channelAdapter.getSelectors();
