import {
    ChangeDetectorRef,
    Component,
    NgZone,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
    Input,
    Output,
    EventEmitter,
} from '@angular/core';
import { BaseComponent } from '@msg91/ui/base-component';
import { Observable } from 'rxjs';
import {
    CHAT_SECTION,
    CHAT_SECTION_VALUE,
    CHAT_STATUS,
    IChannel,
    IChannelAssignees,
    IClient,
    IWidgetTeam,
} from '../../../model';
import { IAppState } from '../../../store';
import { select, Store } from '@ngrx/store';
import * as actions from '../../../store/actions';
import {
    allChannels,
    getAllAssignees,
    getAssigneesOfChannel,
    getWidgetTheme,
    selectAllTeams,
    selectChannelListInProcess,
    selectClientName,
    selectClientUUID,
    selectedChannelId,
    selectedChatScreen,
    selectFaqFlag,
    selectIsClientBlocked,
    selectPushMessage,
    selectTotalTeamsCount,
    selectVideoCallURL,
    selectWidgetChatStatus,
    selectWidgetTagline,
    selectWidgetToken,
} from '../../../store/selectors';
import { distinctUntilChanged, filter, map, skip, take, takeUntil, tap } from 'rxjs/operators';
import { isEqual } from 'lodash-es';
import { ArticlePopupService } from '../artible-pop/article-popup.service';
import { environment } from '../../../../../environments/environment';
import { fadeIn, fadeInOut } from '../../../animations';
import { DomSanitizer } from '@angular/platform-browser';
import { getCookie } from '../../../utils';

@Component({
    selector: 'msg91-chat-view',
    templateUrl: './chat-view.component.html',
    styleUrls: ['./chat-view.component.scss', '../../../icon.css', '../../../css2.css'],
    animations: [fadeInOut, fadeIn],
    encapsulation: ViewEncapsulation.ShadowDom,
    standalone: false
})
export class ChatViewComponent extends BaseComponent implements OnInit, OnDestroy {
    @Output() emitDownloadedContent = new EventEmitter<any>();
    @Input() sdkConfig: any;
    @Input() public botConfig: { [key: string]: string | number };
    @Input() isMobileSDK: boolean;
    @Input() hideUpload: boolean;

    public chatSelectedSection$: Observable<CHAT_SECTION_VALUE>;
    public clientInfo$: Observable<IClient>;
    public oldChannels$: Observable<IChannel[]>;
    public clientName$: Observable<string>;
    public clientName: string;
    public selectVideoCallURL$: Observable<string>;
    public widgetTagline$: Observable<any>;
    public selectTotalTeamsCount$: Observable<number>;
    public channelAssignees$: { [channel: string]: Observable<IChannelAssignees> } = {};
    public allAssignees$: Observable<string[]>;
    public teams$: Observable<IWidgetTeam[]>;
    public appurl: string = environment.appUrl;
    public backgroundImage: any;
    public textColor: string;
    public primaryColor: string;
    public widgetShowFaq$: Observable<boolean>;
    public isClientBlocked$: Observable<boolean>;
    public channelListInProcess$: Observable<boolean>;
    public selectWidgetChatStatus$: Observable<CHAT_STATUS>;
    public chatStatusEnums = CHAT_STATUS;

    constructor(
        private store: Store<IAppState>,
        public popup: ArticlePopupService,
        private sanitizer: DomSanitizer,
        private cdrf: ChangeDetectorRef,
        private ngZone: NgZone
    ) {
        super();
    }

    ngOnInit() {
        this.teams$ = this.store.pipe(select(selectAllTeams), distinctUntilChanged(isEqual), takeUntil(this.destroy$));
        this.selectTotalTeamsCount$ = this.store.pipe(
            select(selectTotalTeamsCount),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.widgetTagline$ = this.store.pipe(
            select(selectWidgetTagline),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.clientName$ = this.store.pipe(
            select(selectClientName),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.widgetShowFaq$ = this.store.pipe(
            select(selectFaqFlag),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.isClientBlocked$ = this.store.pipe(
            select(selectIsClientBlocked),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.selectWidgetChatStatus$ = this.store.pipe(
            select(selectWidgetChatStatus),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.oldChannels$ = this.store.pipe(
            select(allChannels),
            filter(() => !getCookie('hello-widget-anonymous-uuid')),
            tap((x) => {
                if (x.length > 0) {
                    x.forEach((m) => {
                        this.channelAssignees$[m.channel] = this.store.pipe(
                            select(getAssigneesOfChannel(m.channel)),
                            distinctUntilChanged(isEqual),
                            takeUntil(this.destroy$)
                        );
                    });
                }
            }),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.chatSelectedSection$ = this.store.pipe(
            select(selectedChatScreen),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.allAssignees$ = this.store.pipe(
            select(getAllAssignees),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.selectVideoCallURL$ = this.store.pipe(
            select(selectVideoCallURL),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.channelListInProcess$ = this.store.pipe(
            select(selectChannelListInProcess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );

        this.store
            .pipe(select(getWidgetTheme), distinctUntilChanged(isEqual), takeUntil(this.destroy$))
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

        this.oldChannels$
            .pipe(
                filter((x) => x.length > 0),
                take(1)
            )
            .subscribe((res) => {
                this.selectChannel(res?.[0]);
            });
        this.chatSelectedSection$.pipe(skip(1), takeUntil(this.destroy$)).subscribe((res) => {
            if (!res) {
                this.getChannelList();
            } else if (res === CHAT_SECTION.selectedChannel) {
                this.selectPushNotificationChannel();
            }
        });

        this.store
            .pipe(select(selectPushMessage), takeUntil(this.destroy$), distinctUntilChanged(isEqual))
            .subscribe((res) => {
                if (res) {
                    if (!this.getValueFromObservable(this.store.pipe(select(selectedChannelId)))) {
                        this.getChannelList();
                        this.selectPushNotificationChannel();
                        this.store
                            .pipe(
                                select(allChannels),
                                filter((channels) => Boolean(channels?.length)),
                                take(1)
                            )
                            .subscribe(() => {
                                this.createChannel();
                            });
                    }
                }
        });
        this.clientName$
            .pipe(map((name) => name?.split(' ')[0].slice(0, 12) || ''),takeUntil(this.destroy$))
            .subscribe((clientName) => {
            this.clientName = clientName;
        });
    }

    private getChannelList(): void {
        const uuid = this.getValueFromObservable(this.store.pipe(select(selectClientUUID)));
        const widgetToken = this.getValueFromObservable(this.store.pipe(select(selectWidgetToken)));
        if (uuid && widgetToken) {
            this.store.dispatch(
                actions.getChannelList({
                    widgetToken,
                    data: { uuid },
                    uuid,
                    reconnection: true,
                })
            );
        }
    }

    private selectPushNotificationChannel(): void {
        setTimeout(() => {
            this.store
                .pipe(
                    select(allChannels),
                    filter((res) => Boolean(res?.length)),
                    take(1)
                )
                .subscribe((channels) => {
                    if (channels.length === 1 && !channels?.[0]?.id) {
                        this.selectChannel(channels?.[0] ?? null);
                    }
                });
        }, 100);
    }

    transform(style) {
        return this.sanitizer.bypassSecurityTrustStyle(style);
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    public setChatSection(section: CHAT_SECTION_VALUE) {
        this.ngZone.run(() => {
            this.store.dispatch(actions.setChatScreen({ chatScreen: section }));
        });
        // this.chatStore.setChatSection(section);
    }

    public createChannel() {
        this.selectTotalTeamsCount$.pipe(take(1)).subscribe((res) => {
            if (res > 1) {
                this.store.dispatch(actions.setChatScreen({ chatScreen: CHAT_SECTION.teamList }));
            } else if (res === 1) {
                this.teams$.pipe(take(1)).subscribe((p) => {
                    if (p.length === 1) {
                        this.store.dispatch(actions.selectTeam({ teamId: p[0].id.toString() }));
                    }
                });
                this.store.dispatch(actions.setChatScreen({ chatScreen: CHAT_SECTION.selectedChannel }));
            } else {
                this.store.dispatch(actions.setChatScreen({ chatScreen: CHAT_SECTION.selectedChannel }));
            }
            this.cdrf.detectChanges();
        });
    }

    public selectChannel(channel: IChannel) {
        this.ngZone.run(() => {
            this.store.dispatch(actions.selectChannel({ channel: channel.channel }));
            this.store.dispatch(actions.setChatScreen({ chatScreen: CHAT_SECTION.selectedChannel }));
        });
    }

    public enableChatView(e) {
        this.ngZone.run(() => {
            this.store.dispatch(actions.setActiveView({ activeView: e ? 'Chat' : 'FAQ' }));
        });
    }

    public startVideoCall(): void {
        this.selectVideoCallURL$.pipe(take(1)).subscribe((res) => {
            window.open(res, '_blank');
        });
    }
}
