import { Injectable } from '@angular/core';
import { Observable, of, Subject, throwError } from 'rxjs';
import {
    IClientPresenceState,
    IHistoryRequest,
    IHistoryResponse,
    IPresenceStateListener,
    IPresenceStatusListener,
    ISocketAuthToken,
    ISocketListener,
    socketCommunicationListener,
    socketEvents,
    socketPresenceListener,
} from '../model/socket';
import { io, Socket } from 'socket.io-client';
import { catchError, switchMap, take } from 'rxjs/operators';
import { BaseResponse } from '@msg91/models/root-models';
import { URLS } from '../chat-widget/URLs';
import { environment } from '../../../environments/environment';
import { IAppState } from '../store';
import { select, Store } from '@ngrx/store';
import { getAuthToken } from '../store/selectors';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { IdentityVerificationService } from './identity-verification.service';
import { getCookie } from '../utils';

@Injectable()
export class SocketService {
    public options = {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: '',
        },
        withCredentials: false,
        noNeedToAddProxy: true,
    };
    public message: Subject<ISocketListener> = new Subject<ISocketListener>();
    public signal: Subject<ISocketListener> = new Subject<ISocketListener>();
    public presenceStatus$: Subject<IPresenceStatusListener> = new Subject<IPresenceStatusListener>();
    public presenceState$: Subject<IPresenceStateListener> = new Subject<IPresenceStateListener>();
    public networkStatus: Subject<'CONNECTED' | 'LOW-NETWORK' | 'DISCONNECTED' | 'RECONNECTED'> = new Subject<
        'CONNECTED' | 'LOW-NETWORK' | 'DISCONNECTED' | 'RECONNECTED'
    >();
    public socket: Socket;
    public apiUrl: string = environment.apiUrl;

    public pushNotificationSocket: Socket;
    public pushNotificationmessage: Subject<ISocketListener> = new Subject<ISocketListener>();
    public pushNotificationNetworkStatus = new Subject<'CONNECTED' | 'LOW-NETWORK' | 'DISCONNECTED' | 'RECONNECTED'>();

    constructor(
        private http: HttpWrapperService,
        private store: Store<IAppState>,
        private identityVerificationService: IdentityVerificationService
    ) {}

    generateAuthToken(uuid: string, widgetToken: string): Observable<BaseResponse<ISocketAuthToken, undefined>> {
        this.options.headers.Authorization = `${widgetToken}:${uuid}`;
        return this.http.get(
            URLS.CHAT.SOCKET_TOKEN.replace(':URL', this.apiUrl),
            {
                is_anon: Boolean(getCookie('hello-widget-anonymous-uuid')),
            },
            this.options
        );
    }

    initSocket(uuid: string, widgetToken: string): Observable<ISocketAuthToken> {
        return this.generateAuthToken(uuid, widgetToken).pipe(
            switchMap((response) => {
                if (!(response as any)?.success) {
                    return of(null);
                } else {
                    return new Observable<ISocketAuthToken>((subscriber) => {
                        this.socket = io(environment.socketUrl, {
                            auth: { token: response.data.jwt_token },
                            transports: ['websocket', 'polling'], // use WebSocket first, if available
                            reconnection: true,
                            timeout: 20000,
                            autoConnect: true,
                        });

                        this.socket.once('connect', () => {
                            this.networkStatus.next('CONNECTED');
                            console.log('Socket Connected!');
                            this.registerListener(this.socket, this.message, this.networkStatus, '[Chat]');

                            // Connect Push Notification Socket after Chat Socket is connected
                            this.pushNotificationSocket = io(environment.pushNotificationSocketUrl, {
                                auth: { token: response.data.jwt_token },
                                transports: ['websocket', 'polling'], // use WebSocket first, if available
                                reconnection: true,
                                timeout: 20000,
                                autoConnect: true,
                            });

                            this.pushNotificationSocket.once('connect_error', (data) => {
                                console.log('[Push Notification] Error =>', data);

                                // If Push Notification connection fails, alleast we will subscribe channels in chat socket
                                subscriber.next(response.data);
                                subscriber.complete();
                            });

                            this.pushNotificationSocket.once('connect', () => {
                                this.pushNotificationNetworkStatus.next('CONNECTED');
                                console.log('Push Notification Socket Connected!');

                                subscriber.next(response.data);
                                subscriber.complete();

                                this.registerListener(
                                    this.pushNotificationSocket,
                                    this.pushNotificationmessage,
                                    this.pushNotificationNetworkStatus,
                                    '[Push Notification]'
                                );
                            });
                        });
                        this.socket.once('connect_error', (data) => {
                            console.log('[Chat] Error =>', data);
                            subscriber.error(data);
                        });
                    });
                }
            }),
            catchError((err) => {
                return throwError(err);
            })
        );
    }

    registerListener(
        socket: Socket,
        message: typeof this.message,
        networkStatus: typeof this.networkStatus,
        socketType: string
    ) {
        socket.io.on('error', (error) => {
            console.log(socketType + ' IO=>Error(Fired upon a connection error) =>', error);
        });
        socket.io.on('reconnect', (attempt) => {
            console.log(socketType + ' IO=>reconnect(Fired upon a successful reconnection)=>attempt number ', attempt);
        });
        socket.io.on('reconnect_attempt', (attempt) => {
            // reconnection in process
            console.log(
                socketType + ' IO=>reconnect_attempt (Fired upon an attempt to reconnect)=> attempt number ',
                attempt
            );
        });
        socket.io.on('reconnect_error', (error) => {
            console.log(
                socketType + ' IO=>reconnect_error (Fired upon a reconnection attempt error)=> reconnect error ',
                error
            );
        });
        socket.io.on('reconnect_failed', () => {
            console.log(socketType + ' IO=>reconnect_failed (Fired upon a reconnection attempt error)');
        });
        socket.io.on('ping', () => {
            console.log(socketType + ' IO=>ping (Fired when a ping packet is received from the server)');
        });
        socket.on('connect', () => {
            console.log(socketType + ' Socket Connected!');
            networkStatus.next('RECONNECTED');
        });
        socket.on('connect_error', (data) => {
            console.log(socketType + ' ' + data);
            //            subscriber.error(data);
        });
        socket.on('disconnect', (data: Socket.DisconnectReason) => {
            networkStatus.next('DISCONNECTED');
            if (data === 'io server disconnect') {
                // the disconnection was initiated by the server, you need to reconnect manually
                socket.connect();
            } else {
                // this will attempt for reconnection
            }

            console.log(socketType + ' ' + data);
        });
        socket.on('reconnect', (attempt) => {
            console.log(socketType + ' reconnect', attempt);
        });
        socket.on('reconnect_attempt', (attempt) => {
            console.log(socketType + ' reconnect_attempt', attempt);
        });
        /** Presence Listener **/
        socket.on(socketPresenceListener.JoinChannel, (data: IPresenceStatusListener) => {
            this.presenceStatus$.next({
                ...data,
                action: 'join',
            });
        });

        socket.on(socketPresenceListener.LeaveChannel, (data: IPresenceStatusListener) => {
            this.presenceStatus$.next({
                ...data,
                action: 'leave',
            });
        });

        socket.on(socketPresenceListener.Typing, (data: IPresenceStateListener) => {
            this.presenceState$.next(data);
        });

        socket.on(socketPresenceListener.NotTyping, (data: IPresenceStateListener) => {
            this.presenceState$.next(data);
        });

        /** Communication Listener **/
        socket.on(socketCommunicationListener.MessageListener, ({ response }, callback) => {
            message.next(response);
            if (callback) {
                callback(response);
            }
        });

        socket.on(socketCommunicationListener.SignalListener, (response) => {
            this.signal.next(response);
        });
    }

    subscribeChannelWithPresence(channel: string): Observable<BaseResponse<boolean, string>> {
        return new Observable((subscriber) => {
            if (this.socket?.connected) {
                this.socket?.emit(socketEvents.JoinChannel, { channel }, (response: BaseResponse<boolean, string>) => {
                    response.request = channel;
                    subscriber.next(response); // comment this line when below code is uncommented

                    // Commented becuase presence is currently working on chat socket only
                    // if (this.pushNotificationSocket?.connected) {
                    //     this.pushNotificationSocket?.emit(socketEvents.JoinChannel, { channel }, () => {
                    //         subscriber.next(response);
                    //     });
                    // } else {
                    //     subscriber.next(response);
                    // }
                });
            } else {
                subscriber.error({ message: 'No Socket Initilalized' });
            }
        });
    }

    unsubscribeChannelWithPresence(channel: string): Observable<BaseResponse<boolean, string>> {
        return new Observable((subscriber) => {
            if (this.socket?.connected) {
                this.socket?.emit(socketEvents.LeaveChannel, { channel }, (response: BaseResponse<boolean, string>) => {
                    response.request = channel;
                    subscriber.next(response); // comment this line when below code is uncommented

                    // Commented becuase presence is currently working on chat socket only
                    // if (this.pushNotificationSocket?.connected) {
                    //     this.pushNotificationSocket?.emit(socketEvents.LeaveChannel, { channel }, () => {
                    //         subscriber.next(response);
                    //     });
                    // } else {
                    //     subscriber.next(response);
                    // }
                });
            } else {
                subscriber.error({ message: 'No Socket Initilalized' });
            }
        });
    }

    subscribeChannelWOPresence(channel: string | string[]): Observable<BaseResponse<boolean, string | string[]>> {
        return new Observable((subscriber) => {
            if (this.pushNotificationSocket?.connected) {
                this.pushNotificationSocket?.emit(socketEvents.subscribe, { channel });
            }
            if (this.socket?.connected) {
                this.socket?.emit(socketEvents.subscribe, { channel }, (response) => {
                    response.request = channel;
                    // subscriber.next(response);

                    if (this.pushNotificationSocket?.connected) {
                        this.pushNotificationSocket?.emit(socketEvents.subscribe, { channel }, () => {
                            subscriber.next(response);
                        });
                    } else {
                        subscriber.next(response);
                    }
                });
            } else {
                subscriber.error({ message: 'No Socket Initilalized' });
            }
        });
    }

    unsubscribeChannelWOPresence(channel: string | string[]): Observable<BaseResponse<boolean, string>> {
        return new Observable((subscriber) => {
            if (this.pushNotificationSocket?.connected) {
                this.pushNotificationSocket?.emit(socketEvents.unsubscribe, { channel });
            }
            if (this.socket?.connected) {
                this.socket?.emit(socketEvents.unsubscribe, { channel }, (response) => {
                    response.request = channel;
                    // subscriber.next(response);

                    if (this.pushNotificationSocket?.connected) {
                        this.pushNotificationSocket?.emit(socketEvents.unsubscribe, { channel }, () => {
                            subscriber.next(response);
                        });
                    } else {
                        subscriber.next(response);
                    }
                });
            } else {
                subscriber.error({ message: 'No Socket Initilalized' });
            }
        });
    }

    public closeChat(channel, channelClosed = true) {
        this.socket.emit(
            socketEvents.PublishSignal,
            {
                message: { channelClosed },
                channel,
            },
            (status) => {
                console.log(status);
            }
        );
    }

    /** unregister on logout **/
    public unRegister() {
        try {
            if (this.pushNotificationSocket) {
                this.pushNotificationSocket.off();
                this.pushNotificationSocket.close();
                this.pushNotificationSocket.disconnect();
                this.pushNotificationSocket = null;
                // this.removeSleepListener();
            }
        } catch (e) {
            return true;
        }
        try {
            if (this.socket) {
                this.socket.off();
                this.socket.close();
                this.socket.disconnect();
                this.socket = null;
                // this.removeSleepListener();
            }
        } catch (e) {
            return true;
        }
    }

    /** mark as read signal for sync unread count between online agents **/
    public markMessagesAsRead(channel: string) {
        this.socket.emit(
            socketEvents.PublishSignal,
            {
                message: { read: true },
                channel,
            },
            (status) => {
                //
            }
        );
    }

    hereNow(
        channel: string
    ): Observable<BaseResponse<{ agentIds: (number | string)[]; data: { channel: string } }, string>> {
        return new Observable<BaseResponse<{ agentIds: (number | string)[]; data: { channel: string } }, string>>(
            (subscriber) => {
                if (this.socket.connected) {
                    this.socket.emit(
                        socketEvents.HereNow,
                        { channel },
                        (response: BaseResponse<{ agentIds: number[]; data: { channel: string } }, string>) => {
                            response.request = channel;
                            subscriber.next(response);
                        }
                    );
                } else {
                    subscriber.error({ message: 'No socket initialized yet.' });
                }
            }
        );
    }

    setTypingClient(state: IClientPresenceState, typingChannel: string): Observable<BaseResponse<any, string>> {
        return new Observable<BaseResponse<{ agentIds: (number | string)[]; data: { channel: string } }, string>>(
            (subscriber) => {
                if (this.socket.connected) {
                    this.socket.emit(socketEvents.Typing, { channel: typingChannel, data: state }, (response) => {
                        response.request = typingChannel;
                        subscriber.next(response);
                    });
                } else {
                    subscriber.error({ message: 'No socket initialized yet.' });
                }
            }
        );
    }

    setNotTypingClient(state: IClientPresenceState, typingChannel: string): Observable<BaseResponse<any, string>> {
        return new Observable<BaseResponse<{ agentIds: (number | string)[]; data: { channel: string } }, string>>(
            (subscriber) => {
                if (this.socket.connected) {
                    this.socket.emit(socketEvents.NotTyping, { channel: typingChannel, data: state }, (response) => {
                        response.request = typingChannel;
                        subscriber.next(response);
                    });
                } else {
                    subscriber.error({ message: 'No socket initialized yet.' });
                }
            }
        );
    }

    getHistoryOfChannel(request: IHistoryRequest): Observable<IHistoryResponse> {
        this.store.pipe(select(getAuthToken), take(1)).subscribe((res) => (this.options.headers.Authorization = res));
        return this.http.post(
            URLS.CHAT.HISTORY.replace(':URL', this.apiUrl),
            {
                ...request,
                ...this.identityVerificationService.getUserData(),
                is_anon: Boolean(getCookie('hello-widget-anonymous-uuid')),
            },
            this.options
        );
    }

    sendSignal(signal: any) {
        if (this.socket.connected) {
            this.socket.emit(socketEvents.PublishSignal, signal, (status) => {
                console.log(status);
            });
        }
    }
}
