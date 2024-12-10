import { Action, createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { IFeedbackMessage, IFormMessage, IMessage, IPostFeedback, MessageTypes } from '../../../model';
import {
    AddFeedBackMessage,
    AddFormMessage,
    AddNewMessage,
    AddPushNotificationMessage,
    ChannelMessageDelete,
    CreateChannelComplete,
    logout,
    ResetMessageState,
    SetChannelMessages,
    setChannels,
    UpdateFeedBackMessage,
    UpdateFormMessage,
} from '../../actions';
import { cloneDeep } from 'lodash-es';
import { sortByTimeToken } from '../../../utils';
import { arrangeMessagesOfChannel } from '../../../utils/messages';

export interface IMessageState extends EntityState<IMessage> {
    sessionId?: string;
}

export interface IChannelMessageState {
    [channel: string]: IMessageState;
}

export const adapter: EntityAdapter<IMessage> = createEntityAdapter<IMessage>({
    selectId: (model) => model.timetoken,
    sortComparer: sortByTimeToken,
});

export const initialState: IChannelMessageState = {};
export const channelMessageReducer = createReducer(
    initialState,
    on(setChannels, (state, { channels }) => {
        const newState = cloneDeep(state);
        channels?.forEach((channel) => {
            newState[channel.channel] = !newState[channel.channel]
                ? {
                      ids: [],
                      entities: {},
                  }
                : newState[channel.channel];
        });
        return newState;
    }),
    on(SetChannelMessages, (state, { response }) => {
        if (response.messages?.length) {
            const updatedMessages = cloneDeep(adapter.getSelectors().selectAll(state[response.channel]));
            updatedMessages.push(...cloneDeep(response.messages));
            arrangeMessagesOfChannel(updatedMessages);
            return {
                ...state,
                [response.channel]: adapter.upsertMany(updatedMessages, state[response.channel]),
            };
        }
        return {
            ...state,
        };
    }),
    on(CreateChannelComplete, (state, { response }) => ({
        ...state,
        [response.channel.channel]: { ids: [], entities: {} },
    })),
    on(AddPushNotificationMessage, (state, { response }) => {
        const newState = cloneDeep(state);
        for (let channel in state) {
            const msg = {
                timetoken: new Date().getTime(),
                channel,
                message: {
                    channel,
                    chat_id: null,
                    content: { text: response?.message?.content, attachment: [] },
                    from_name: 'Custom Message',
                    message_type: 'text',
                    new_event: true,
                    origin: null,
                    sender_id: null,
                    type: 'chat',
                    isPushNotificationMessage: true,
                },
                actions: null,
                meta: null,
            };
            newState[channel] = adapter.addOne({ ...(msg as any), state: 'new' }, { ...state[channel] });
        }
        return newState;
    }),
    on(AddNewMessage, (state, { response }) => {
        return {
            ...state,
            [response.channel]: adapter.addOne(
                { ...response.message, state: 'new' },
                { ...state[response.channel], sessionId: response.message.message['session_id'] }
            ),
        };
    }),
    on(ChannelMessageDelete, (state, { response }) => {
        for (let key in state[response?.channel]?.entities) {
            if ((state[response?.channel]?.entities[key] as any)?.id === response?.message?.message.message_id) {
                let updatedMessage = {
                    ...state[response?.channel].entities[key].message,
                    is_deleted: true,
                    content: null,
                };
                return {
                    ...state,
                    [response?.channel]: adapter.updateOne(
                        {
                            id: state[response?.channel]?.entities[key]?.timetoken,
                            changes: {
                                message: updatedMessage,
                            },
                        },
                        state[response?.channel]
                    ),
                };
            }
        }
        return state;
    }),
    on(AddFormMessage, (state, { response }) => {
        return {
            ...state,
            [response.channel]: adapter.addOne(
                {
                    ...response.message,
                    state: 'new',
                },
                state[response.channel]
            ),
        };
    }),
    on(AddFeedBackMessage, (state, { response }) => {
        return {
            ...state,
            [response.channel]: adapter.addOne(
                {
                    ...response.message,
                    state: 'new',
                },
                state[response.channel]
            ),
        };
    }),
    on(UpdateFeedBackMessage, (state, { response }) => {
        const allMessagesOfChannel = adapter.getSelectors().selectAll(state[response.channel]);
        const feedbackMessage = allMessagesOfChannel?.find(
            (s) =>
                s.message &&
                (s.message as IFeedbackMessage)?.token === (response.message.message as IPostFeedback).token
        );
        if (feedbackMessage?.timetoken) {
            return {
                ...state,
                [response.channel]: adapter.updateOne(
                    {
                        id:
                            typeof feedbackMessage.timetoken === 'string'
                                ? +feedbackMessage.timetoken
                                : feedbackMessage.timetoken,
                        changes: {
                            ...feedbackMessage,
                            message: {
                                ...response.message.message,
                                type: MessageTypes.FEEDBACK,
                                feedbackGiven: true,
                            },
                        },
                    },
                    state[response.channel]
                ),
            };
        }
        return {
            ...state,
        };
    }),
    on(UpdateFormMessage, (state, { response }) => {
        const allMessagesOfChannel = adapter.getSelectors().selectAll(state[response.channel]);
        const formMessage = allMessagesOfChannel?.find(
            (s) => s.message && (s.message as IFormMessage)?.type === MessageTypes.FORM
        );
        if (formMessage?.timetoken) {
            return {
                ...state,
                [response.channel]: adapter.updateOne(
                    {
                        id: typeof formMessage.timetoken === 'string' ? +formMessage.timetoken : formMessage.timetoken,
                        changes: {
                            ...formMessage,
                            message: {
                                ...formMessage.message,
                                formSubmitted: true,
                            },
                        },
                    },
                    state[response.channel]
                ),
            };
        }
        return {
            ...state,
        };
    }),
    on(ResetMessageState, (state, { channel }) => {
        return {
            ...state,
            [channel]: adapter.upsertMany(
                cloneDeep(adapter.getSelectors().selectAll(state[channel]))
                    ?.filter((x) => x.state === 'new')
                    ?.map((m) => {
                        m.state = null;
                        return m;
                    }),
                state[channel]
            ),
        };
    }),
    on(logout, (state) => ({}))
);

export function reducer(state: IChannelMessageState = initialState, action: Action) {
    return channelMessageReducer(state, action);
}
