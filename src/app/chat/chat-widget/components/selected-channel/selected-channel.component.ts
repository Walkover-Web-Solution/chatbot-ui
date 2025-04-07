import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { BaseComponent } from '@msg91/ui/base-component';
import {
    AgentResponse,
    CHAT_STATUS,
    IChannel,
    IChannelAssignees,
    IClient,
    IInboundMessageModel,
    IMessage,
    IPostFeedback,
    IWidgetTeam,
    MessageTypes,
} from '../../../model';
import { select, Store } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { debounceTime, delay, distinctUntilChanged, filter, map, take, takeUntil, tap } from 'rxjs/operators';
import { combineLatest, lastValueFrom, Observable } from 'rxjs';
import * as actions from '../../../store/actions';
import {
    CreateChannel,
    deleteUnreadCount,
    GetChannelHistory,
    getGreeting,
    publishMessage,
    ReopenChannel,
    ResetFileFlags,
    setMessageBoxState,
    SubmitChannelFeedback,
    updateClient,
    uploadFile,
} from '../../../store/actions';
import { environment } from '../../../../../environments/environment';
import {
    fileUploadData,
    fileUploadingError,
    fileUploadingProgress,
    fileUploadingSuccess,
    getAllAssignees,
    getAssigneesOfChannel,
    getAuthToken,
    getChannelHistoryInProcess,
    getLastMessageTimeToken,
    getMessageBoxState,
    getOpponentLastReadMessageTimeToken,
    getSelectedTeamAssignees,
    getUnSendContent,
    getWidgetTheme,
    messagePublishInProcess,
    selectAllClientParams,
    selectClient,
    selectClientUUID,
    selectedChannel,
    selectedChannelAssigneePresence,
    selectedChannelID,
    selectedChannelId,
    selectedChannelLoadedPageNo,
    selectedChannelMessages,
    selectedTeam,
    selectTotalTeamsCount,
    selectWidgetConfig,
    selectReopenInProcess,
    selectCreateChannelInProcess,
    fileUploadingInProgress,
    selectFaqFlag,
    getAllAgents,
    selectedChannelBotSessionID,
    selectWidgetShowSendButton,
    selectWidgetTagline,
    selectWidgetInfo,
    greetingMessage,
    selectWidgetChatStatus,
    selectPushMessage,
    getChannelMessages,
} from '../../../store/selectors';
import { IAppState } from '../../../store';
import { fadeInLeft, fadeInOut, fadeInRight } from '../../../animations';
import { DOCUMENT } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { SocketPresenceEvent } from '../../../model/socket';
import { DEBOUNCE_TIME } from '@msg91/constant';
import { MessageInputComponent } from './components/message-input/message-input.component';

@Component({
    selector: 'msg91-selected-channel',
    templateUrl: './selected-channel.component.html',
    styleUrls: ['./selected-channel.component.scss'],
    animations: [fadeInRight, fadeInLeft, fadeInOut],
    standalone: false
})
export class SelectedChannelComponent extends BaseComponent implements OnInit, OnDestroy {
    @ViewChild('container') messageContainer: ElementRef<HTMLDivElement>;
    @ViewChild(MessageInputComponent) messageInput: MessageInputComponent;
    @Input() isMobileSDK: boolean;
    @Input() public botConfig: { [key: string]: string | number };
    @Input() public hideUpload: boolean;
    @Input() isBorderRadiusDisabled: boolean;
    @Output() emitDowloadedContent = new EventEmitter<any>();
    public token: string;
    public widgetUUID: string;
    public textColor: string;
    public selectedChannel$: Observable<IChannel>;
    public selectedChannelId$: Observable<string>;
    public selectedTeam$: Observable<IWidgetTeam>;
    public fileUploadingPercentage$: Observable<number>;
    public fileUploadingSuccessful$: Observable<boolean>;
    public fileUploadingError$: Observable<any>;
    public messagePublishInProcess$: Observable<boolean> = new Observable<boolean>();
    public messageGetInProcess$: Observable<boolean> = new Observable<boolean>();
    public channelMessages$: Observable<IMessage[]> = new Observable<IMessage[]>();
    public lastMessageToken$: Observable<number>;
    public opponentLastReadMessageToken$: Observable<number>;
    public currentPage$: Observable<string>;
    public selectedChannelAssignee$: Observable<IChannelAssignees>;
    public selectedTeamAssignee$: Observable<IChannelAssignees>;
    public allAssignees$: Observable<string[]>;
    public selectedChannelAssigneePresence$: Observable<SocketPresenceEvent>;
    public messageBoxState$: Observable<'Focused' | 'Blurred' | 'Typing' | 'Not-Empty' | 'Empty'>;
    public unSendContent$: Observable<string>;
    public startTimeToken: number;
    private selectTotalTeamsCount$: Observable<number>;
    private channelId: number;
    public channel: IChannel;
    // private messageObserver: MutationObserver;
    private selectedClient$: Observable<IClient>;
    public getAllAgents$: Observable<AgentResponse[]>;
    public appurl: string = environment.appUrl;
    public backgroundImage: any;
    public primaryColor: string;
    public createChannelInProcess$: Observable<boolean> = new Observable<boolean>();
    public reopenInProcess$: Observable<boolean> = new Observable<boolean>();
    public fileUploadingInProgress$: Observable<boolean> = new Observable<boolean>();
    public widgetShowFaq$: Observable<boolean>;
    public widgetTagline$: Observable<any>;
    public messageGetInProcess: boolean = false;
    public clientFormSubmitted: boolean = false;
    public showSendButton$: Observable<boolean>;
    public firstMessage: any = {
        type: 'chat',
        message_type: 'text',
        content: { text: '', attachment: [], options: [] },
        sender_id: 'bot',
        origin: 'chat',
        state: 'open',
        firstAgentMsg: true,
        lastClientMsg: true,
        lastAgentMsg: true,
        timetoken: 0,
    };
    public firstMessage$: Observable<any>;
    public widgetInfo: any;
    public botReplyInProcess: boolean = false;
    public selectWidgetChatStatus$: Observable<CHAT_STATUS>;
    public chatStatusEnums = CHAT_STATUS;

    public pushNotificationChannel: IChannel;

    constructor(
        private store: Store<IAppState>,
        @Inject(DOCUMENT) private document: Document,
        private sanitizer: DomSanitizer,
        private cdr: ChangeDetectorRef,
        private ngZone: NgZone
    ) {
        super();
    }

    ngOnInit() {
        this.widgetTagline$ = this.store.pipe(
            select(selectWidgetTagline),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.selectTotalTeamsCount$ = this.store.pipe(
            select(selectTotalTeamsCount),
            takeUntil(this.destroy$),
            distinctUntilChanged(isEqual)
        );
        this.selectedChannel$ = this.store.pipe(
            select(selectedChannel),
            takeUntil(this.destroy$),
            distinctUntilChanged(isEqual)
        );
        this.selectedClient$ = this.store.pipe(
            select(selectClient),
            takeUntil(this.destroy$),
            distinctUntilChanged(isEqual)
        );
        this.selectedChannelAssigneePresence$ = this.store.pipe(
            select(selectedChannelAssigneePresence),
            takeUntil(this.destroy$),
            distinctUntilChanged(isEqual),
            debounceTime(DEBOUNCE_TIME)
        );
        this.selectedChannelId$ = this.store.pipe(
            select(selectedChannelId),
            takeUntil(this.destroy$),
            distinctUntilChanged(isEqual)
        );
        this.selectedTeam$ = this.store.pipe(
            select(selectedTeam),
            takeUntil(this.destroy$),
            distinctUntilChanged(isEqual)
        );
        this.messagePublishInProcess$ = this.store.pipe(
            select(messagePublishInProcess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$),
            debounceTime(DEBOUNCE_TIME)
        );
        this.messageGetInProcess$ = this.store.pipe(
            select(getChannelHistoryInProcess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.createChannelInProcess$ = this.store.pipe(
            select(selectCreateChannelInProcess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.reopenInProcess$ = this.store.pipe(
            select(selectReopenInProcess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.channelMessages$ = this.store.pipe(
            select(selectedChannelMessages),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.messageBoxState$ = this.store.pipe(
            select(getMessageBoxState),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.unSendContent$ = this.store.pipe(
            select(getUnSendContent),
            distinctUntilChanged(isEqual),
            debounceTime(DEBOUNCE_TIME),
            takeUntil(this.destroy$)
        );
        this.currentPage$ = this.store.pipe(
            select(selectedChannelLoadedPageNo),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.lastMessageToken$ = this.store.pipe(
            select(getLastMessageTimeToken),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.opponentLastReadMessageToken$ = this.store.pipe(
            select(getOpponentLastReadMessageTimeToken),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.allAssignees$ = this.store.pipe(
            select(getAllAssignees),
            takeUntil(this.destroy$),
            distinctUntilChanged(isEqual)
        );
        this.widgetShowFaq$ = this.store.pipe(
            select(selectFaqFlag),
            takeUntil(this.destroy$),
            distinctUntilChanged(isEqual)
        );
        this.getAllAgents$ = this.store.pipe(
            select(getAllAgents),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.selectWidgetChatStatus$ = this.store.pipe(
            select(selectWidgetChatStatus),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );

        this.fileUploadingSuccessful$ = this.store.pipe(
            select(fileUploadingSuccess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$),
            tap((x) => {
                if (x) {
                    setTimeout(() => {
                        this.store.dispatch(ResetFileFlags());
                    }, 100);
                }
            })
        );
        this.fileUploadingError$ = this.store.pipe(
            select(fileUploadingError),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.fileUploadingPercentage$ = this.store.pipe(
            select(fileUploadingProgress),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.fileUploadingInProgress$ = this.store.pipe(
            select(fileUploadingInProgress),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.store.pipe(select(selectWidgetInfo), distinctUntilChanged(isEqual), take(1)).subscribe((res) => {
            this.widgetInfo = res;
            if (res.chatbot_enable) {
                this.getFirstMessage();
            }
        });

        this.firstMessage$ = this.store.pipe(
            select(greetingMessage()),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.firstMessage$.subscribe((res) => {
            this.firstMessage.content.text = res.text;
            this.firstMessage.content.options = res.options?.map((option) => ({ name: option, value: option }));
            this.firstMessage.timetoken = res.timetoken;
        });
        this.selectedChannel$.subscribe((channel) => {
            if (channel?.id) {
                this.channel = channel;
                if (this.pushNotificationChannel) {
                    setTimeout(() => {
                        this.store
                            .pipe(select(getChannelMessages(this.pushNotificationChannel?.channel)), take(1))
                            .subscribe((data) => {
                                if (data?.length) {
                                    data?.forEach((message) => {
                                        const newMsg = {
                                            ...message,
                                            channel: this.channel?.channel,
                                            message: {
                                                ...message?.message,
                                                channel: this.channel?.channel,
                                            },
                                        };
                                        this.store.dispatch(
                                            actions.AddNewMessage({
                                                response: {
                                                    channel: this.channel?.channel,
                                                    message: newMsg,
                                                },
                                            })
                                        );
                                    });
                                }
                            });
                    }, 100);
                }
            } else {
                this.pushNotificationChannel = channel;
            }
            if (this.channel?.channel) {
                this.selectedChannelAssignee$ = this.store.pipe(
                    select(getAssigneesOfChannel(this.channel.channel)),
                    distinctUntilChanged(isEqual),
                    takeUntil(this.destroy$)
                );
            }
        });
        this.selectedTeamAssignee$ = this.store.pipe(
            select(getSelectedTeamAssignees),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.showSendButton$ = this.store.pipe(
            select(selectWidgetShowSendButton),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.store
            .pipe(select(selectClientUUID), distinctUntilChanged(isEqual), takeUntil(this.destroy$))
            .subscribe((id) => {
                this.widgetUUID = id;
            });
        this.lastMessageToken$.pipe(delay(50)).subscribe((res) => {
            if (res && this.messageContainer?.nativeElement && !this.startTimeToken) {
                // document.getElementById(res).scrollIntoView({
                //   behavior: 'smooth',
                //   block: 'center'
                // });
                this.messageContainer?.nativeElement.scrollTo({
                    top: this.messageContainer?.nativeElement.scrollHeight,
                    behavior: 'smooth',
                });
            }
        });
        this.currentPage$.pipe(delay(50)).subscribe((res) => {
            if (res && this.startTimeToken && document.getElementById(this.startTimeToken?.toString())) {
                document.getElementById(this.startTimeToken?.toString()).scrollIntoView({
                    behavior: 'auto',
                    inline: 'center',
                });
                this.startTimeToken = null;
            }
        });
        combineLatest([this.messageBoxState$, this.unSendContent$.pipe(debounceTime(DEBOUNCE_TIME))])
            .pipe(distinctUntilChanged(isEqual), takeUntil(this.destroy$))
            .subscribe((res) => {
                let state = res[0];
                let content = res[1];
                if (state === 'Typing' && content) {
                    setTimeout(() => {
                        let latestContent;
                        this.unSendContent$.pipe(take(1)).subscribe((res) => (latestContent = res));
                        if (content === latestContent) {
                            this.store.dispatch(
                                setMessageBoxState({
                                    activeState: 'Not-Empty',
                                    unSendContent: latestContent,
                                    channel: this.channel?.channel,
                                })
                            );
                        }
                    }, 2500);
                }
            });

        this.store
            .pipe(select(getWidgetTheme), takeUntil(this.destroy$), distinctUntilChanged(isEqual))
            .subscribe((res) => {
                if (res) {
                    this.textColor = res.textColor;
                    this.backgroundImage = res.gradientHeader
                        ? this.transform(
                              `url( \'${this.appurl}assets/img/bg-branding.png\'), linear-gradient(211deg, ${res?.primaryColorDark} 44%, ${res?.primaryColorDark} 40.2%, ${res?.primaryColorLight} 116.5%, ${res?.primaryColorLight} 102.1%)`
                          )
                        : '';
                    this.primaryColor = res.primaryColor;
                }
            });

        this.messageGetInProcess$.subscribe((res) => {
            this.messageGetInProcess = res;
            this.cdr.detectChanges();
        });
        this.channelMessages$.subscribe((res) => {
            this.clientFormSubmitted = true;
            for (let message of res) {
                if (message.message.type === 'form') {
                    this.clientFormSubmitted = (message.message as any).formSubmitted;
                }
            }
            if ((res[res?.length - 1]?.message as any)?.sender_id === 'bot') {
                this.botReplyInProcess = false;
            }
            this.cdr.detectChanges();
        });

        this.store
            .pipe(select(selectPushMessage), takeUntil(this.destroy$), distinctUntilChanged(isEqual))
            .subscribe((res) => {
                if (res) {
                    this.store.dispatch(actions.AddPushNotificationMessage({ response: { message: res } }));
                    setTimeout(() => {
                        this.store.dispatch(actions.SetPushMessage({ response: { message: null } }));
                    }, 100);
                }
            });
    }

    public getFirstMessage() {
        let authToken;
        this.store.pipe(select(getAuthToken), take(1)).subscribe((res) => (authToken = res));
        this.store.dispatch(
            getGreeting({
                company_id: this.widgetInfo.company_id,
                bot_id: this.widgetInfo.bot_id,
                UUID: this.widgetUUID,
                token: authToken,
                botType: this.widgetInfo.bot_type,
            })
        );
    }
    transform(style) {
        return this.sanitizer.bypassSecurityTrustStyle(style);
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        // this.store.dispatch(actions.selectChannel({ channel: null }));
        // if (this.messageObserver) {
        //     this.messageObserver.disconnect();
        // }
    }

    identifyList(index, item: IMessage[]) {
        return item[0]?.timetoken;
    }

    identifyMessage(index, item: IMessage) {
        return item?.timetoken;
    }

    public backToChat() {
        this.ngZone.run(() => {
            combineLatest([this.selectedChannelId$, this.selectedTeam$, this.selectTotalTeamsCount$])
                .pipe(take(1))
                .subscribe((res: [string, IWidgetTeam, number]) => {
                    if (this.channel?.channel) {
                        this.store.dispatch(actions.ResetMessageState({ channel: this.channel.channel }));
                    }
                    this.store.dispatch(actions.selectChannel({ channel: null }));
                    this.store.dispatch(actions.setChatScreen({ chatScreen: null }));
                });
        });

        this.store.dispatch(
            setMessageBoxState({
                channel: this.channel?.channel,
                activeState: 'Empty',
                unSendContent: null,
            })
        );
    }

    public send(event: { content: string; attachment: File }) {
        // Old condition
        // if (this.channel && !this.channel.is_closed) {
        //     this.publishMessage(event).then();
        // } else if (this.channel && this.channel.is_closed) {
        //     this.reopenChannel(event).then();
        // } else if (!this.channel) {
        //     this.createChannel(event).then();
        // }
        if (this.channel) {
            this.publishMessage(event).then();
        } else if (!this.channel) {
            this.createChannel(event).then();
        }
        setTimeout(() => {
            this.botReplyInProcess = true;
            setTimeout(() => {
                this.botReplyInProcess = false;
            }, 10000);
        }, 1000);
        this.userTyped(null);
    }

    public async publishMessage(event: { content: string; attachment: File }) {
        const message = await this.prepareMessage(event);
        this.store.dispatch(
            publishMessage({
                request: {
                    channel: this.channel.channel,
                    message,
                    storeInHistory: true,
                    otherParams: { ...this.botConfig },
                },
            })
        );
    }

    scroll(event: Event) {
        if (this.messageContainer.nativeElement.scrollTop === 0) {
            let messageLength;
            this.channelMessages$
                .pipe(
                    map((x) => x),
                    take(1)
                )
                .subscribe((res) => {
                    messageLength = res?.length;
                    this.startTimeToken = res[0]?.timetoken;
                });
            if (messageLength < this.channel?.total_message_count) {
                if (this.startTimeToken) {
                    // this.store.dispatch(
                    //     GetChannelHistory({
                    //         request: {
                    //             channel: this.channel.channel,
                    //             before: 25,
                    //             timetoken: this.startTimeToken,
                    //         },
                    //         reconnection: false,
                    //     })
                    // );
                    this.store.dispatch(
                        GetChannelHistory({
                            request: {
                                channel: this.channel.channel,
                                origin: 'chat',
                                page_size: 30,
                                start_from: messageLength,
                            },
                            reconnection: false,
                        })
                    );
                }
            } else {
                this.startTimeToken = null;
            }
        }
    }

    sendFeedBack(event: IPostFeedback) {
        if (event.token) {
            event.type = MessageTypes.POST_FEEDBACK;
            event.id = new Date().getTime();
            this.store.dispatch(
                SubmitChannelFeedback({
                    request: event,
                    channel: this.channel.channel,
                })
            );
        } else {
            console.log('TOKEN not provided !');
        }
    }

    inputFocused() {
        let authToken;
        this.store.pipe(select(getAuthToken), take(1)).subscribe((res) => (authToken = res));
        if (this.channel?.widget_unread_count > 0) {
            this.store.dispatch(
                deleteUnreadCount({
                    channel: this.channel?.channel,
                    authToken,
                })
            );
        }
        if (this.channel?.channel) {
            this.store.dispatch(
                setMessageBoxState({
                    channel: this.channel?.channel,
                    activeState: 'Focused',
                })
            );
        }
    }

    updateClient(event: { client: Partial<IClient>; channel: string }) {
        this.store.dispatch(
            updateClient({
                ...event,
            })
        );
    }

    userTyped(event: string) {
        if (event) {
            this.store.dispatch(
                setMessageBoxState({
                    channel: this.channel?.channel,
                    activeState: 'Typing',
                    unSendContent: event,
                })
            );
        } else {
            this.store.dispatch(
                setMessageBoxState({
                    channel: this.channel?.channel,
                    activeState: 'Empty',
                    unSendContent: null,
                })
            );
        }
    }

    inputBlurred(event: boolean) {
        if (event) {
            this.store.dispatch(
                setMessageBoxState({
                    activeState: 'Blurred',
                    channel: this.channel?.channel,
                })
            );
        }
    }

    private async prepareMessage(event: { content: string; attachment: File }): Promise<IInboundMessageModel> {
        let channelId;
        let session_id;
        this.store
            .pipe(select(selectedChannelID), distinctUntilChanged(isEqual), take(1))
            .subscribe((id) => (channelId = id));
        this.store.pipe(select(selectedChannelBotSessionID(this.channel?.channel)), take(1)).subscribe((response) => {
            session_id = response;
        });
        if (event.attachment) {
            this.store.dispatch(uploadFile({ file: event.attachment }));
            return lastValueFrom(
                this.store.pipe(
                    select(fileUploadData),
                    filter((x) => x?.success),
                    take(1)
                )
            )
                .then((response) => {
                    const message: IInboundMessageModel = {
                        type: MessageTypes.WIDGET,
                        message_type: event.content ? 'text-attachment' : 'attachment',
                        content: {
                            text: event.content ? event.content : '',
                            attachment: response.data,
                        },
                        chat_id: channelId,
                        // pn_gcm: {
                        //   notification: {
                        //     data: {
                        //       type: '',
                        //       notify: '',
                        //       url: environment.appUrlHello + 'layout/contact-center/o/all/0/chats/' + this.widgetUUID
                        //     },
                        //     title: 'New message',
                        //     body: event.content?.length > 25 ? event.content?.substring(0, 20) + '...' : event.content,
                        //     icon: environment.appUrlHello + 'assets/images/logo.png'
                        //   }
                        // }
                        session_id,
                    };
                    return message;
                })
                .catch((error) => {
                    console.error(error);
                    return null;
                });
        } else {
            return new Promise<IInboundMessageModel>((resolve) => {
                const message: IInboundMessageModel = {
                    type: MessageTypes.WIDGET,
                    message_type: 'text',
                    content: {
                        text: event.content ? event.content : '',
                        attachment: [],
                    },
                    chat_id: channelId,
                    // pn_gcm: {
                    //   notification: {
                    //     data: {
                    //       type: '',
                    //       notify: '',
                    //       url: environment.appUrlHello + 'layout/contact-center/o/all/0/chats/' + this.widgetUUID
                    //     },
                    //     title: 'New message',
                    //     body: event.content?.length > 25 ? event.content?.substring(0, 20) + '...' : event.content,
                    //     icon: environment.appUrlHello + 'assets/images/logo.png'
                    //   }
                    // }
                    session_id,
                };
                resolve(message);
            });
        }
    }

    private async createChannel(event: { content: string; attachment: File }) {
        const message = await this.prepareMessage(event);
        let authorization;
        let teamId;
        let client;
        this.store.pipe(select(getAuthToken), take(1)).subscribe((token) => {
            authorization = token;
        });
        this.selectedTeam$
            .pipe(
                take(1),
                map((x) => x?.id)
            )
            .subscribe((team) => {
                teamId = team;
            });
        this.selectedClient$.pipe(take(1)).subscribe((cl) => {
            client = cl;
        });
        let otherConfigDetails = {};
        this.store.pipe(select(selectAllClientParams), take(1)).subscribe((res) => {
            if (res && res.length) {
                this.store.pipe(select(selectWidgetConfig), take(1)).subscribe((config) => {
                    for (let param of res) {
                        if (param.name in config.additionalData) {
                            otherConfigDetails[param.name] = config.additionalData[param.name];
                        }
                    }
                });
            }
        });
        this.store.dispatch(
            CreateChannel({
                request: {
                    authorization,
                    client: {
                        ...client,
                        team_id: teamId,
                        new: true,
                        ...otherConfigDetails,
                    },
                    firstMessage: message,
                    otherParams: { ...this.botConfig },
                },
            })
        );
    }

    private async reopenChannel(event: { content: string; attachment: File }) {
        const message = await this.prepareMessage(event);
        let authorization;
        let teamId;
        this.store.pipe(select(getAuthToken), take(1)).subscribe((token) => {
            authorization = token;
        });
        this.selectedTeam$
            .pipe(
                take(1),
                map((x) => x?.id)
            )
            .subscribe((team) => {
                teamId = team;
            });
        this.store.dispatch(
            ReopenChannel({
                request: {
                    authorization,
                    channel: this.channel,
                    firstMessage: message,
                },
            })
        );
    }

    public enableChatView(e) {
        this.ngZone.run(() => {
            this.store.dispatch(actions.setActiveView({ activeView: e ? 'Chat' : 'FAQ' }));
        });
    }

    public botOptionSelected(event: any): void {
        if (event?.message) {
            let option = event?.message.interactive?.action?.buttons?.find((e) => e.reply?.id === event.value);
            let selection = option?.reply?.title;
            if (!option) {
                for (let section of event?.message.interactive?.action?.sections) {
                    option = section.rows?.find((e) => e.id === event.value);
                    if (option) {
                        selection = option?.title;
                    }
                }
            }
            if (selection) {
                this.messageInput.sendMessage(selection);
            } else {
                this.messageInput.sendMessage(event.value);
            }
        } else {
            this.messageInput.sendMessage(event.value);
        }
    }
}
