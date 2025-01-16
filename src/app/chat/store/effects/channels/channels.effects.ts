import { getGreeting } from './../../actions/channels/index';
import { Injectable } from '@angular/core';
import { ChatService } from '../../../service/chat.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as actions from './../../actions';
import { AddFormMessage, GetChannelHistory, selectChannel } from '../../actions';
import { catchError, exhaustMap, map, switchMap, take, tap } from 'rxjs/operators';
import {
    AfterMessagePublishOperation,
    IChannel,
    IClassificationChannel,
    IClient,
    IClientListResp,
    IMessage,
    IOutboundMessageModel,
    ITextAttactmentContent,
    MessageTypes,
} from '../../../model';
import { Observable, of, zip } from 'rxjs';
import { select, Store } from '@ngrx/store';
import {
    getAuthToken,
    getChannelMessages,
    selectClient,
    selectDefaultClientParams,
    selectedChannelID,
    selectedChannelMessages,
    selectPresenceChannel,
    selectWidgetConfig,
    selectWidgetToken,
} from '../../selectors';
import { IAppState } from '../../index';
import { ValidatorFn, Validators } from '@angular/forms';
import { cloneDeep } from 'lodash-es';
import { PhoneNumber } from '@msg91/ui/phone-number-material';
import { HttpErrorResponse } from '@angular/common/http';
import { getCookie, removeCookie } from '../../../utils';
import { SocketService } from '../../../service/socket.service';
import { IHistoryRequest } from '../../../model/socket';
import { EMAIL_REGEX } from '@msg91/regex';

@Injectable()
export class ChannelsEffect {
    getChannelsList$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.getChannelList),
            switchMap(({ uuid, widgetToken, data, reconnection }) => {
                return this.chatService.getChannelList(data, widgetToken, uuid).pipe(
                    map((data: IClientListResp) => {
                        return actions.getChannelListSuccess({ data, reconnection });
                    }),
                    catchError((err) => {
                        if (reconnection) {
                            return of(actions.SetPubNubNetWorkStatus({ status: 'DISCONNECTED' }));
                        }
                        if (err instanceof HttpErrorResponse) {
                            if (err.status === 401) {
                                removeCookie('hello-widget-uuid');
                                removeCookie('hello-widget-anonymous-uuid');
                                let config;
                                this.store.pipe(select(selectWidgetConfig), take(1)).subscribe((res) => (config = res));
                                return of('').pipe(
                                    switchMap((e) => [
                                        actions.initWidgetFailed(),
                                        actions.initWidget({ config }),
                                        actions.resetClient(),
                                    ])
                                );
                            }
                        }
                        return of(actions.initWidgetFailed());
                    })
                );
            })
        )
    );

    submitChannelFeedback$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.SubmitChannelFeedback),
            exhaustMap(({ request, channel }) => {
                let authtoken;
                this.store.pipe(select(getAuthToken), take(1)).subscribe((token) => (authtoken = token));
                return this.chatService.receiveFeedback(request, authtoken).pipe(
                    switchMap((data) => {
                        if (data.success) {
                            return [
                                actions.SubmitChannelFeedbackComplete({ response: request }),
                                // actions.publishMessage({
                                //   request: {
                                //     channel,
                                //     message: request,
                                //     storeInHistory: true
                                //   }
                                // })
                            ];
                        }
                        return [actions.SubmitChannelFeedbackError({ error: data })];
                    })
                );
            }),
            catchError((err) => {
                return of(actions.SubmitChannelFeedbackError({ error: err }));
            })
        )
    );

    createChannel$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.CreateChannel),
            switchMap(({ request: { authorization, client, firstMessage, otherParams } }) => {
                return this.chatService.createChannel(firstMessage, client, authorization, null, otherParams).pipe(
                    switchMap((data) => {
                        const client: IClient = {
                            ...data.request,
                            ...data.response,
                            uuid: data.response?.uuid,
                            call_enabled: data.response?.call_enabled,
                            country: data.response?.country,
                            country_iso2: data.response?.country_iso2,
                            customer_mail: data.response?.customer_mail ?? data.response?.mail,
                            customer_name: data.response?.customer_name ?? data.response?.name,
                            customer_number: data.response?.customer_number ?? data.response.number,
                            presence_channel: data.response?.presence_channel,
                            unique_id: data.response?.unique_id,
                        };
                        const channel: IChannel = {
                            ...data.response,
                        };
                        let isPubNubInitialized;
                        let widgetToken;
                        this.store
                            .pipe(
                                select((p) => p.pubnub.isPubNubInitialized),
                                take(1)
                            )
                            .subscribe((res) => {
                                isPubNubInitialized = res;
                            });
                        this.store.pipe(select(selectWidgetToken), take(1)).subscribe((res) => {
                            widgetToken = res;
                        });

                        if (isPubNubInitialized) {
                            const isAnonymous = Boolean(getCookie('hello-widget-anonymous-uuid'));
                            const channelArray = isAnonymous
                                ? [client.presence_channel, data.response.channel] // Subscribe to presence only when anonymous is converted to partial anonymous (on first inbound from widget)
                                : [data.response.channel]; // Client is still anonymous, no need to subscribe to presence channel
                            return [
                                actions.SubscribeChannels({ channel: channelArray }),
                                actions.CreateChannelComplete({
                                    response: {
                                        channel: {
                                            ...channel,
                                            total_message_count: 1,
                                        },
                                    },
                                }),
                                actions.setClient({ client: client }),
                                actions.selectChannel({ channel: data.response.channel }),
                                actions.setWidgetClientUuid({ client_uuid: channel.uuid }),
                                actions.publishMessageComplete({
                                    response: {
                                        message: firstMessage,
                                        channel: data.response.channel,
                                        storeInHistory: true,
                                    },
                                }),
                            ];
                        }
                        return [
                            actions.CreateChannelComplete({
                                response: {
                                    channel: {
                                        ...channel,
                                        total_message_count: 1,
                                    },
                                },
                            }),
                            actions.InitPubNubObject({
                                request: {
                                    widgetToken: widgetToken,
                                    uuid: client.uuid,
                                    presence_channel: client.presence_channel,
                                    message: { ...firstMessage, chat_id: data.response.id },
                                    channel: channel.channel,
                                },
                                reconnection: false,
                            }),
                            actions.setClient({ client: client }),
                            actions.selectChannel({ channel: channel.channel }),
                            actions.setWidgetClientUuid({ client_uuid: channel.uuid }),
                            actions.publishMessageComplete({
                                response: {
                                    message: firstMessage,
                                    channel: data.response.channel,
                                    storeInHistory: true,
                                },
                            }),
                        ];
                    })
                );
            }),
            catchError((err) => {
                return of(actions.CreateChannelError({ error: null }));
            })
        )
    );

    // createChannel$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(actions.CreateChannel),
    //         switchMap(({ request: { authorization, client, firstMessage } }) => {
    //             return this.chatService.createChannel(client, authorization).pipe(
    //                 switchMap((data) => {
    //                     const client: IClient = {
    //                         ...data.request,
    //                         uuid: data.response?.uuid,
    //                         call_enabled: data.response?.call_enabled,
    //                         country: data.response?.country,
    //                         country_iso2: data.response?.country_iso2,
    //                         mail: data.response?.mail,
    //                         name: data.response?.name,
    //                         number: data.response.number,
    //                         presence_channel: data.response?.presence_channel,
    //                         unique_id: data.response?.unique_id,
    //                     };
    //                     const channel: IChannel = {
    //                         ...data.response,
    //                     };
    //                     let isPubNubInitialized;
    //                     let widgetToken;
    //                     this.store
    //                         .pipe(
    //                             select((p) => p.pubnub.isPubNubInitialized),
    //                             take(1)
    //                         )
    //                         .subscribe((res) => {
    //                             isPubNubInitialized = res;
    //                         });
    //                     this.store.pipe(select(selectWidgetToken), take(1)).subscribe((res) => {
    //                         widgetToken = res;
    //                     });

    //                     if (isPubNubInitialized) {
    //                         return [
    //                             actions.SubscribeChannels({ channel: [data.response.channel] }),
    //                             actions.CreateChannelComplete({
    //                                 response: {
    //                                     channel: {
    //                                         ...channel,
    //                                         total_message_count: 1,
    //                                     },
    //                                 },
    //                             }),
    //                             actions.setClient({ client: client }),
    //                             actions.selectChannel({ channel: data.response.channel }),
    //                             actions.publishMessage({
    //                                 request: {
    //                                     message: { ...firstMessage, chat_id: data.response.id },
    //                                     channel: data.response.channel,
    //                                     storeInHistory: true,
    //                                 },
    //                             }),
    //                             actions.setWidgetClientUuid({ client_uuid: channel.uuid }),
    //                             // GetTotalMessageCountOfChannels({ channels: [data.response.channel] }),
    //                             // GetLastMessageOfChannels({ channels: [data.response.channel] })
    //                         ];
    //                     }
    //                     return [
    //                         actions.CreateChannelComplete({
    //                             response: {
    //                                 channel: {
    //                                     ...channel,
    //                                     total_message_count: 1,
    //                                 },
    //                             },
    //                         }),
    //                         actions.InitPubNubObject({
    //                             request: {
    //                                 widgetToken: widgetToken,
    //                                 uuid: client.uuid,
    //                                 presence_channel: client.presence_channel,
    //                                 message: { ...firstMessage, chat_id: data.response.id },
    //                                 channel: channel.channel,
    //                             },
    //                         }),
    //                         actions.setClient({ client: client }),
    //                         actions.selectChannel({ channel: channel.channel }),
    //                         actions.setWidgetClientUuid({ client_uuid: channel.uuid }),
    //                     ];
    //                 })
    //             );
    //         }),
    //         catchError((err) => {
    //             return of(actions.CreateChannelError({ error: null }));
    //         })
    //     )
    // );

    reopenChannel$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.ReopenChannel),
            exhaustMap(({ request: { authorization, channel, firstMessage } }) => {
                return this.chatService.updateChannel({ ...channel, is_closed: false }, authorization).pipe(
                    switchMap((data) => {
                        const channel: IChannel = {
                            ...data.response,
                        };
                        return [
                            actions.ReopenChannelComplete({ response: { channel: channel } }),
                            actions.channelStateChange({ channel: channel.channel, channelClosed: false }),
                            actions.publishMessage({
                                request: {
                                    message: firstMessage,
                                    channel: data.response.channel,
                                    storeInHistory: true,
                                },
                            }),
                        ];
                    })
                );
            }),
            catchError((err) => {
                return of(actions.ReopenChannelError({ error: null }));
            })
        )
    );

    deleteUnreadCount$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.deleteUnreadCount),
            exhaustMap(({ channel, authToken }) => {
                return this.chatService.deleteUnReadCount(channel, authToken).pipe(
                    switchMap((data: { message: string; success: boolean }) => {
                        if (data.success) {
                            return [actions.deleteUnreadCountComplete({ channel })];
                        }
                        return [actions.deleteUnreadCountError({})];
                    })
                );
            }),
            catchError((err) => {
                return of(actions.deleteUnreadCountError({ error: null }));
            })
        )
    );

    deleteUnreadCountComplete$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(actions.deleteUnreadCountComplete),
                tap(({ channel }) => {
                    this.socketService.sendSignal({ channel, message: { readByClient: true } });
                })
            ),
        { dispatch: false }
    );

    getChannelsListSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(actions.getChannelListSuccess),
                exhaustMap(({ data, reconnection }) => {
                    // eslint-disable-next-line prefer-const
                    let { channels, ...client } = cloneDeep(data);
                    let widgettoken;
                    let presenceChannelStr;
                    this.store.pipe(select(selectWidgetToken), take(1)).subscribe((token) => {
                        widgettoken = token;
                    });
                    this.store
                        .pipe(select(selectPresenceChannel), take(1))
                        .subscribe((presenceChannel) => (presenceChannelStr = presenceChannel));
                    if (channels?.length && !reconnection) {
                        return [
                            actions.setClient({ client: client as IClient }),
                            actions.setChannels({ channels: channels, uuid: client.uuid }),
                            actions.setWidgetClientUuid({ client_uuid: client.uuid }),
                            actions.InitPubNubObject({
                                request: {
                                    presence_channel: getCookie('hello-widget-anonymous-uuid')
                                        ? null
                                        : client.presence_channel,
                                    uuid: client.uuid,
                                    widgetToken: widgettoken || '',
                                },
                                reconnection,
                            }),
                        ];
                    }
                    return [
                        actions.SubscribeChannels({ channel: channels?.map((s) => s.channel) }),
                        actions.SubscribePresenceChannel({ channel: presenceChannelStr }),
                        actions.setClient({ client: client as IClient }),
                        actions.setChannels({ channels: channels, uuid: client.uuid }),
                        actions.setWidgetClientUuid({ client_uuid: client.uuid }),
                        actions.SetPubNubNetWorkStatus({ status: 'CONNECTED' }),
                        actions.InitPubNubObject({
                            request: {
                                presence_channel: getCookie('hello-widget-anonymous-uuid')
                                    ? null
                                    : client.presence_channel,
                                uuid: client.uuid,
                                widgetToken: widgettoken || '',
                            },
                            reconnection,
                        }),
                    ];
                }),
                catchError((err) => {
                    return of(actions.initWidgetFailed());
                })
            ),
        {
            dispatch: true,
            useEffectsErrorHandler: true,
        }
    );

    afterPublishOperations$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.AfterPublishOperations),
            switchMap((action) => {
                const observables: Observable<any>[] = [];
                const formPreviousValue: {
                    [key: string]: {
                        value: any;
                        validators: ValidatorFn[];
                    };
                } = {};
                let country: string;
                let country_iso2: string;
                action.request.operations.forEach((op) => {
                    switch (op) {
                        // case AfterMessagePublishOperation.AddUnreadCount: {
                        //   observables.push(this.chatService.addUnReadCount(action.request.channel, action.request.authorization));
                        //   break;
                        // }
                        case AfterMessagePublishOperation.AddUnreadNotification: {
                            const attachment = (
                                (action.request.Message as IOutboundMessageModel).content as ITextAttactmentContent
                            ).attachment;
                            const attachmentPath = attachment?.length > 0 ? attachment[0].path : null;
                            try {
                                observables.push(
                                    this.chatService.sendUnreadNotification(
                                        {
                                            message: (
                                                (action.request.Message as IOutboundMessageModel)
                                                    .content as ITextAttactmentContent
                                            ).text as string,
                                            channel: action.request.channel,
                                            attachment: attachmentPath,
                                            date_time: new Date().getTime(),
                                        },
                                        action.request.authorization
                                    )
                                );
                            } catch (e) {
                                console.log(e, 'error');
                            }
                            break;
                        }
                        case AfterMessagePublishOperation.botConversation: {
                            try {
                                observables.push(
                                    this.chatService.botConversation(
                                        {
                                            content: (
                                                (action.request.Message as IOutboundMessageModel)
                                                    .content as ITextAttactmentContent
                                            ).text as string,
                                            channel: action.request.channel,
                                        },
                                        action.request.authorization
                                    )
                                );
                            } catch (e) {
                                console.log(e, 'error');
                            }
                            break;
                        }
                        case AfterMessagePublishOperation.classifyChannel: {
                            let channelID;
                            this.store.pipe(select(selectedChannelID), take(1)).subscribe((id) => (channelID = id));
                            try {
                                observables.push(
                                    this.chatService.classifyChannel(
                                        {
                                            content: (
                                                (action.request.Message as IOutboundMessageModel)
                                                    .content as ITextAttactmentContent
                                            ).text as string,
                                            pb_channel_id: channelID,
                                        },
                                        action.request.authorization
                                    )
                                );
                            } catch (e) {
                                console.log(e, 'error');
                            }
                            break;
                        }
                        case AfterMessagePublishOperation.AddFormMessage: {
                            zip(
                                this.store.pipe(select(selectDefaultClientParams), take(1)),
                                this.store.pipe(select(selectClient), take(1))
                            ).subscribe((res) => {
                                const params = res[0];
                                const client = res[1];
                                country = client.country;
                                country_iso2 = client.country_iso2;
                                params.forEach((x) => {
                                    formPreviousValue[x.id] = { value: null, validators: [] };
                                    if (x.name?.toUpperCase() === 'NAME') {
                                        formPreviousValue[x.id].value = !client.pseudo_name
                                            ? client.name ?? client.customer_name
                                            : '';
                                        formPreviousValue[x.id].validators = [Validators.required];
                                    } else if (x.name?.toUpperCase() === 'NUMBER') {
                                        formPreviousValue[x.id].value = new PhoneNumber(
                                            country_iso2 || '',
                                            (client.number ?? client.customer_number) || ''
                                        );
                                        formPreviousValue[x.id].validators = [];
                                    } else if (x.name?.toUpperCase() === 'MAIL') {
                                        formPreviousValue[x.id]['value'] = client.mail ?? client.customer_mail;
                                        formPreviousValue[x.id].validators = [Validators.pattern(EMAIL_REGEX)];
                                    }
                                });
                            });
                        }
                    }
                });
                if (!observables.length) {
                    observables.push(of('empty'));
                }
                return zip(...observables).pipe(
                    switchMap((res) => {
                        if (
                            action.request.operations.findIndex(
                                (x) => x === AfterMessagePublishOperation.AddFormMessage
                            ) > -1
                        ) {
                            let hasFormAlready;
                            this.store
                                .pipe(
                                    select(getChannelMessages(action.request.channel)),
                                    take(1),
                                    map((test) => test?.findIndex((x) => x.message.type === 'form') > -1)
                                )
                                .subscribe((data) => (hasFormAlready = data));
                            if (!hasFormAlready) {
                                const message: IMessage = {
                                    timetoken: new Date().getTime() * 1e3,
                                    channel: action.request.channel,
                                    message: {
                                        type: MessageTypes.FORM,
                                        id: new Date().getTime(),
                                        country: country,
                                        country_iso2: country_iso2,
                                        channel: action.request.channel,
                                        form: formPreviousValue,
                                        formSubmitted: false,
                                    },
                                };

                                return [
                                    actions.AfterPublishOperationsComplete({ response: {} }),
                                    AddFormMessage({
                                        response: {
                                            channel: action.request.channel,
                                            message,
                                        },
                                    }),
                                ];
                            } else {
                                return [actions.AfterPublishOperationsComplete({ response: {} })];
                            }
                        }
                        let index = action.request.operations.findIndex(
                            (x) => x === AfterMessagePublishOperation.classifyChannel
                        );
                        if (index > -1) {
                            const channelClassification: IClassificationChannel = res[index];
                            return [
                                actions.AfterPublishOperationsComplete({
                                    response: {
                                        channel: action.request.channel,
                                        classification: channelClassification,
                                    },
                                }),
                            ];
                        }
                        return [actions.AfterPublishOperationsComplete({ response: {} })];
                    }),
                    catchError((err) => {
                        return of(actions.AfterPublishOperationsError(err));
                    })
                );
            }),
            catchError((err) => {
                return of(actions.AfterPublishOperationsError({ error: err }));
            })
        )
    );

    selectChannel$ = createEffect(() =>
        this.actions$.pipe(
            ofType(selectChannel),
            switchMap((action) => {
                if (action?.channel) {
                    let hasNoMessage;
                    this.store
                        .pipe(
                            select(selectedChannelMessages, action.channel),
                            take(1),
                            map((x) => x?.length)
                        )
                        .subscribe((number) => {
                            hasNoMessage = !number || number === 0;
                        });
                    if (hasNoMessage) {
                        // const request: IHistoryRequest = {
                        //     channel: action.channel,
                        //     // timetoken: Math.floor(new Date().getTime() / 1000),
                        //     timetoken: new Date().getTime() + 5000,
                        //     before: 25,
                        // };
                        const request: IHistoryRequest = {
                            channel: action.channel,
                            origin: 'chat',
                            page_size: 30,
                            start_from: 1,
                        };
                        return of(GetChannelHistory({ request }));
                    }
                }
                return of({ type: 'No Action Needed' });
            })
        )
    );

    getGreeting$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(getGreeting),
            switchMap(({ company_id, bot_id, UUID, token, botType }) => {
                return this.chatService.getGreetingData(company_id, bot_id, UUID, token, botType).pipe(
                    map((data: any) => {
                        return actions.getGreetingSuccess({ data: data.data });
                    }),
                    catchError((err) => {
                        return of();
                    })
                );
            })
        );
    });
    constructor(
        public chatService: ChatService,
        private socketService: SocketService,
        private actions$: Actions,
        private store: Store<IAppState>
    ) {}
}
