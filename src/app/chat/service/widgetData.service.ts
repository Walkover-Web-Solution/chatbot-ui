import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { IBlockedMessage, IMessage, IParam, MessageTypes } from '../model';
import {
    AddFeedBackMessage,
    AddNewMessage,
    agentReadTheMessages,
    ChannelMessageDelete,
    channelStateChange,
    GetChannelHistory,
    setCallStatus,
    setClientStatus,
    SetPubNubNetWorkStatus,
    SetPushMessage,
    SetPushNotifications,
    setVideoCallURL,
    setWidgetClientUuid,
    UpdateChannel,
    updateClientComplete,
    UpdateFeedBackMessage,
} from '../store/actions';
import { IAppState, SET_PRESENCE_OF_AGENT, SET_STATE_OF_AGENT } from '../store';
import { getMessageLengthOfChannel, selectDefaultClientParams, selectedChannelStr } from '../store/selectors';
import { distinctUntilChanged, take } from 'rxjs/operators';
import { SocketService } from './socket.service';
import { environment } from 'src/environments/environment';
import { isEqual } from 'lodash-es';

@Injectable()
export class WidgetDataService {
    constructor(private socketService: SocketService, private store: Store<IAppState>) {}

    public initSubscriber() {
        this.socketService.message.asObservable().subscribe((res) => {
            const { message, timetoken } = res;
            const channel = environment.enableHelloNewSocketSubscription ? res.message.channel : res.channel;
            const msg: IMessage = {
                timetoken,
                channel: message.channel,
                id: (res as any)?.id,
                message,
                actions: null,
                meta: null,
            };
            // if (res.message.type === MessageTypes.NOTIFICATIONS) {
            //     if ((msg.message as any)?.message_type === 'Message') {
            //         this.store.dispatch(SetPushMessage({ response: { message: msg.message as any } }));
            //     } else {
            //         this.store.dispatch(SetPushNotifications({ response: { message: msg.message as any } }));
            //     }
            //     return;
            // }
            if (
                (!res?.message?.new_event && environment.enableHelloNewSocketSubscription) ||
                (res?.message?.new_event && !environment.enableHelloNewSocketSubscription)
            ) {
                return;
            }
            switch (msg.message.type) {
                case MessageTypes.CHAT:
                case MessageTypes.WIDGET: {
                    let selectedChannel;
                    this.store.pipe(select(selectedChannelStr), take(1)).subscribe((ch) => (selectedChannel = ch));
                    if (selectedChannel === channel) {
                        msg.state = 'new';
                    }
                    this.store.pipe(select(getMessageLengthOfChannel(channel)), take(1)).subscribe((length) => {
                        if (!length) {
                            // this.store.dispatch(
                            //     GetChannelHistory({
                            //         request: {
                            //             channel,
                            //             before: 25,
                            //             // timetoken: Math.floor(new Date().getTime() / 1000)
                            //             timetoken: new Date().getTime(),
                            //         },
                            //     })
                            // );
                            this.store.dispatch(
                                GetChannelHistory({
                                    request: {
                                        channel,
                                        origin: 'chat',
                                        page_size: 30,
                                        start_from: 1,
                                    },
                                })
                            );
                        }
                    });
                    if ((msg.message as any)?.pn_gcm?.notification?.data?.notify?.length) {
                        break;
                    }
                    if ((msg.message as any).message_type !== 'activity') {
                        this.store.dispatch(AddNewMessage({ response: { channel, message: msg } }));
                    }
                    break;
                }
                case MessageTypes.DELETE_MESSAGE: {
                    this.store.dispatch(ChannelMessageDelete({ response: { channel, message: msg } }));
                    break;
                }
                case MessageTypes.FEEDBACK: {
                    this.store.dispatch(AddFeedBackMessage({ response: { channel, message: msg } }));
                    break;
                }
                case MessageTypes.BLOCKED: {
                    this.store.dispatch(setClientStatus({ status: (msg?.message as IBlockedMessage)?.value }));
                    break;
                }
                case MessageTypes.POST_FEEDBACK: {
                    this.store.dispatch(UpdateFeedBackMessage({ response: { channel, message: msg } }));
                    break;
                }
                case MessageTypes.ASSIGN: {
                    this.store.dispatch(UpdateChannel({ response: { channel, channelData: msg as any } }));
                    break;
                }
                case MessageTypes.NOTIFICATIONS: {
                    // if ((msg.message as any)?.message_type === 'Message') {
                    //     this.store.dispatch(SetPushMessage({ response: { message: msg.message as any } }));
                    // } else {
                    //     this.store.dispatch(SetPushNotifications({ response: { message: msg.message as any } }));
                    // }
                    break;
                }
                case MessageTypes.UPDATE: {
                    let client_params: IParam[];
                    this.store
                        .pipe(select(selectDefaultClientParams), take(1))
                        .subscribe((params) => (client_params = params));
                    if (client_params?.length) {
                        client_params.forEach((x) => {
                            if (Object.keys(msg.message).findIndex((y) => y === x.name)) {
                                switch (x.name) {
                                    case 'name':
                                    case 'mail':
                                    case 'number': {
                                        msg.message[x.name] = msg.message[x.id];
                                        break;
                                    }
                                    default: {
                                        break;
                                    }
                                }
                            }
                        });
                    }
                    if ((msg.message as any)?.new_client_id) {
                        this.store.dispatch(
                            updateClientComplete({
                                client: {
                                    ...msg.message,
                                    uuid: (msg.message as any).new_client_id,
                                    pseudo_name: false,
                                },
                                channel: null,
                            })
                        );
                        this.store.dispatch(setWidgetClientUuid({ client_uuid: (msg.message as any).new_client_id }));
                    }
                    break;
                }

                default: {
                    break;
                }
            }
        });
        this.socketService.pushNotificationmessage.asObservable().subscribe((res) => {
            if (res?.message.type === MessageTypes.NOTIFICATIONS) {
                if (res?.message?.message_type === 'Message') {
                    this.store.dispatch(SetPushMessage({ response: { message: res?.message } }));
                } else {
                    this.store.dispatch(SetPushNotifications({ response: { message: res?.message } }));
                }
                return;
            }
        });
        this.socketService.signal.asObservable().subscribe(({ message, channel, timetoken }) => {
            // eslint-disable-next-line no-prototype-builtins
            if (message.hasOwnProperty('channelClosed')) {
                this.store.dispatch(channelStateChange({ channel: channel, channelClosed: message.channelClosed }));
                // eslint-disable-next-line no-prototype-builtins
            } else if (message.hasOwnProperty('callStatusChanged')) {
                this.store.dispatch(setCallStatus({ channel: channel, callStatusChanged: message.callStatusChanged }));

                // eslint-disable-next-line no-prototype-builtins
            } else if (message.hasOwnProperty('read')) {
                this.store.dispatch(agentReadTheMessages({ channel: channel, read: message.read }));
            } else if (message.hasOwnProperty('videoCallURL')) {
                this.store.dispatch(setVideoCallURL({ channel: channel, url: message.videoCallURL }));
            } else if (message.hasOwnProperty('videoCallEnded')) {
                this.store.dispatch(setVideoCallURL({ channel: channel, url: null }));
            }
        });
        this.socketService.networkStatus
            .asObservable()
            .pipe(distinctUntilChanged(isEqual))
            .subscribe((status) => {
                this.store.dispatch(SetPubNubNetWorkStatus({ status }));
            });
        this.socketService.presenceStatus$.asObservable().subscribe((response) => {
            this.store.dispatch(SET_PRESENCE_OF_AGENT({ status: response.action, uuid: response.uuid?.toString() }));
        });
        this.socketService.presenceState$.asObservable().subscribe((response) => {
            this.store.dispatch(
                SET_STATE_OF_AGENT({
                    presenceState: {
                        channel: response.channel,
                        action: response.action,
                        agentId: +response.uuid,
                    },
                    uuid: response.uuid?.toString(),
                })
            );
        });
        // this.socketService.presenceOfAgents.asObservable().subscribe(res => {
        //     this.store.dispatch(SET_PRESENCE_OF_AGENT({ presence: res }));
        // });
        // this.pubnubService.AuthFail$.pipe(debounceTime(500)).subscribe(res => {
        //     let uuid;
        //     let widgetToken;
        //     this.store.pipe(select(selectClientUUID), take(1)).subscribe(res => uuid = res);
        //     this.store.pipe(select(selectWidgetToken), take(1)).subscribe(res => widgetToken = res);
        //     this.store.dispatch(ReAuthPubNubInstance({ request: { uuid, widgetToken } }));
        // });
    }
}
