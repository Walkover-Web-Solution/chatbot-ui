import { Injectable } from '@angular/core';
import { ChatService } from '../../../service/chat.service';
import { WidgetDataService } from '../../../service/widgetData.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as actions from './../../actions';
import { GetChannelHistoryComplete, GetChannelHistoryError, SetChannelMessages } from '../../actions';
import { catchError, concatMap, map, mergeMap, switchMap, take } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';
import { Action, select, Store } from '@ngrx/store';
import {
    allChannelsNames,
    getAfterMessageOperations,
    getAuthToken,
    getMessageLengthOfChannel,
    selectWidgetCompanyId,
} from '../../selectors';
import { getCookie, removeCookie, setCookie } from '../../../utils';
import { AfterMessagePublishOperation, MessageTypes } from '../../../model';
import { IAppState, SET_PRESENCE_OF_AGENT } from '../../index';
import dayjs from 'dayjs';
import { SocketService } from '../../../service/socket.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class PubnubEffects {
    initPubNub$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.InitPubNubObject),
            switchMap((action) => {
                let alreadyInitialized: boolean;
                this.store
                    .pipe(
                        select((p) => p.pubnub.isPubNubInitialized),
                        take(1)
                    )
                    .subscribe((initialized) => {
                        alreadyInitialized = initialized;
                    });
                if (alreadyInitialized) {
                    this.socketService.unRegister();
                }
                return this.socketService.initSocket(action.request.uuid, action.request.widgetToken).pipe(
                    switchMap(() => {
                        if (!action.reconnection) {
                            this.dataService.initSubscriber();
                        } else {
                            let companyId;
                            this.store
                                .pipe(select(selectWidgetCompanyId), take(1))
                                .subscribe((companyIdRes) => (companyId = companyIdRes));
                            if (companyId && action.request.uuid) {
                                this.store.dispatch(
                                    actions.SubscribeChannels({
                                        channel: [`ch-comp-${companyId}.${action.request.uuid}`],
                                    })
                                );
                            }
                        }
                        if (!getCookie('hello-widget-anonymous-uuid')) {
                            setCookie('hello-widget-uuid', action.request.uuid, environment.uuidExpiryInDays);
                        } else {
                            setCookie('hello-widget-anonymous-uuid', action.request.uuid, environment.uuidExpiryInDays);
                        }
                        if (getCookie('hello-widget-anonymous-uuid')) {
                            // saved `hello-widget-anonymous-uuid` in `hello-widget-anonymous-uuid-bak` for sending in pubnub list API
                            setCookie(
                                'hello-widget-anonymous-uuid-bak',
                                getCookie('hello-widget-anonymous-uuid'),
                                environment.uuidExpiryInDays
                            );
                        }
                        let channels;
                        this.store.pipe(select(allChannelsNames), take(1)).subscribe((chs) => {
                            channels = chs;
                        });
                        if (channels) {
                            const actionsArray: Array<any> = [
                                actions.InitPubNubObjectComplete({
                                    message: action?.request.message,
                                    channel: action.request.channel,
                                }),
                                actions.SubscribeChannels({ channel: channels }),
                            ];
                            if (action.request.presence_channel) {
                                actionsArray.push(
                                    actions.SubscribePresenceChannel({ channel: action.request.presence_channel })
                                );
                            }
                            return of('').pipe(
                                switchMap(() => actionsArray),
                                catchError((err) => {
                                    return EMPTY;
                                })
                            );
                        }
                        return of('').pipe(
                            switchMap(() => [
                                actions.SubscribePresenceChannel({ channel: action.request.presence_channel }),
                                actions.InitPubNubObjectComplete({ message: action?.request.message }),
                            ]),
                            catchError((err) => {
                                return EMPTY;
                            })
                        );
                    }),
                    catchError((err) => {
                        return of(actions.getPubNubKeysError({ error: err }));
                    })
                );
            }),
            catchError((error) => {
                return EMPTY;
            })
        )
    );

    initPubNubObjectComplete$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.InitPubNubObjectComplete),
            switchMap((action) => {
                let allChannels: string[];
                this.store.pipe(select(allChannelsNames), take(1)).subscribe((res) => {
                    allChannels = res;
                });
                // if (action.message) {
                //     return of('').pipe(
                //         switchMap(() => [
                //             actions.publishMessage({
                //                 request: {
                //                     channel: action.channel,
                //                     storeInHistory: true,
                //                     message: action.message,
                //                 },
                //             }),
                //         ]),
                //         catchError((err) => {
                //             return EMPTY;
                //         })
                //     );
                // }
                return of({ type: 'EMPTY ACTION' });
            }),
            catchError((error) => {
                return EMPTY;
            })
        )
    );

    publishMessage$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.publishMessage),
            mergeMap((action) => {
                let authtoken;
                this.store.pipe(select(getAuthToken), take(1)).subscribe((token) => (authtoken = token));
                return this.chatService
                    .sendMessage(action.request.message, authtoken, null, action.request.otherParams)
                    .pipe(
                        map((res) => {
                            if (res.success) {
                                return actions.publishMessageComplete({ response: action.request });
                            }
                            return actions.publishMessageError({ error: res.message });
                        }),
                        catchError((err) => {
                            return of(actions.publishMessageError({ error: err }));
                        })
                    );
            }),
            catchError((error) => {
                return EMPTY;
            })
        )
    );

    publishMessageComplete$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.publishMessageComplete),
            switchMap((action) => {
                let afterPublishOperations: AfterMessagePublishOperation[];
                let authToken: string;
                this.store
                    .pipe(select(getAfterMessageOperations, action.response.channel), take(1))
                    .subscribe((res) => {
                        afterPublishOperations = res;
                    });
                this.store.pipe(select(getAuthToken, action.response.channel), take(1)).subscribe((res) => {
                    authToken = res;
                });
                if (
                    action?.response?.message.type === MessageTypes.CHAT ||
                    action?.response?.message.type === MessageTypes.WIDGET
                ) {
                    return [
                        actions.AfterPublishOperations({
                            request: {
                                channel: action.response.channel,
                                authorization: authToken,
                                Message: action.response.message,
                                operations: afterPublishOperations,
                            },
                        }),
                    ];
                }
                return of({ type: 'EMPTY ACTION' });
            }),
            catchError((error) => {
                return EMPTY;
            })
        )
    );

    subscribePresenceChannel$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.SubscribePresenceChannel),
            switchMap((action) => {
                try {
                    if (action.channel) {
                        return this.socketService.subscribeChannelWithPresence(action.channel).pipe(
                            map((response) => {
                                if (response.status === 'success') {
                                    return response.request;
                                }
                                return null;
                            }),
                            catchError((error) => {
                                return EMPTY;
                            })
                        );
                    } else {
                        return EMPTY;
                    }
                } catch (e) {
                    return EMPTY;
                }
            }),
            switchMap((channel: string) => {
                if (channel) {
                    return this.socketService.hereNow(channel).pipe(
                        switchMap((responseHereNow) => {
                            if (responseHereNow?.status === 'success') {
                                const TotalActions: Action[] = [
                                    actions.SubscribePresenceChannelComplete({ channel: responseHereNow?.request }),
                                ];
                                if (responseHereNow.data?.agentIds?.length) {
                                    responseHereNow.data.agentIds.forEach((s) => {
                                        if (s) {
                                            TotalActions.push(
                                                SET_PRESENCE_OF_AGENT({
                                                    status: 'join',
                                                    uuid: s?.toString(),
                                                })
                                            );
                                        }
                                    });
                                }
                                return TotalActions;
                            } else {
                                return [actions.SubscribePresenceChannelError({ error: responseHereNow })];
                            }
                        }),
                        catchError((error) => {
                            return EMPTY;
                        })
                    );
                } else {
                    return of(actions.SubscribePresenceChannelError({ error: { message: 'Unknown Error !' } }));
                }
            }),
            catchError((error) => {
                return EMPTY;
            })
        )
    );

    subscribeChannels$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.SubscribeChannels),
            switchMap((action) => {
                if (action.channel && action.channel.length) {
                    return this.socketService.subscribeChannelWOPresence(action.channel).pipe(
                        switchMap((response) => {
                            if (response.status === 'success') {
                                return [actions.SubscribeChannelsComplete({ channel: response.request })];
                            }
                        }),
                        catchError((error) => {
                            return EMPTY;
                        })
                    );
                } else {
                    return EMPTY;
                }
            }),
            catchError((error) => {
                return of(actions.SubscribeChannelsError({ error }));
            })
        )
    );

    unsubscribeChannels$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.UnsubscribeChannels),
            switchMap((action) => {
                return this.socketService.unsubscribeChannelWOPresence(action.channel).pipe(
                    switchMap((response) => {
                        if (response.status === 'success') {
                            return [actions.UnsubscribeChannelsComplete({ channel: response.request })];
                        }
                    }),
                    catchError((error) => {
                        return EMPTY;
                    })
                );
            }),
            catchError((error) => {
                return of(actions.UnsubscribeChannelsError({ error }));
            })
        )
    );

    logout$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.logout),
            switchMap((action) => {
                try {
                    this.socketService.unRegister();
                    removeCookie('hello-widget-uuid');
                    removeCookie('hello-widget-anonymous-uuid');
                    let widgetToken;
                    this.store
                        .pipe(
                            select((s) => s.widgetInfo.widgetToken),
                            take(1)
                        )
                        .subscribe((res) => (widgetToken = res));
                    return [actions.initWidget({ config: { widgetToken: widgetToken } })];
                } catch (e) {
                    console.log('SHUTDOWN', e);
                }
            }),
            catchError((error) => {
                return EMPTY;
            })
        )
    );

    getChannelHistory$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.GetChannelHistory),
            mergeMap((action) => {
                return this.socketService.getHistoryOfChannel({ ...action.request, origin: 'chat' }).pipe(
                    concatMap((response) => {
                        let messageList = Array.isArray(response?.data)
                            ? response?.data
                            : Array.isArray(response?.data?.data)
                            ? response?.data?.data
                            : [];
                        this.store
                            .pipe(select(getMessageLengthOfChannel(action?.request?.channel)), take(1))
                            .subscribe((length) => {
                                // messageList.length === 1 breaks in case of chat bot assign, we got 2 in messageList.length
                                if (!length || messageList.length) {
                                    this.store.dispatch(
                                        actions.UpdateLastMessage({
                                            response: {
                                                channel: action?.request?.channel,
                                                message: messageList?.[0],
                                            },
                                        })
                                    );
                                }
                            });
                        return [
                            GetChannelHistoryComplete({ response: response, reconnection: action.reconnection }),
                            SetChannelMessages({
                                response: {
                                    channel: action?.request?.channel,
                                    messages: messageList?.filter((x) => {
                                        return dayjs(x.timetoken);
                                    }),
                                },
                            }),
                        ];
                    }),
                    catchError((err) => {
                        return of(GetChannelHistoryError({ error: err, reconnection: action.reconnection }));
                    })
                );
            }),
            catchError((error) => {
                return EMPTY;
            })
        )
    );

    constructor(
        private actions$: Actions,
        private dataService: WidgetDataService,
        private socketService: SocketService,
        private store: Store<IAppState>,
        private chatService: ChatService
    ) {}
}
