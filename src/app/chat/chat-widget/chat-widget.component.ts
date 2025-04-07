import { IdentityVerificationService } from './../service/identity-verification.service';
import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Inject,
    Injector,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    ViewEncapsulation,
} from '@angular/core';
import { fadeIn, fadeInOut } from '../animations';
import { BaseComponent } from '@msg91/ui/base-component';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { IAppState } from '../store';
import {
    allChannelsNames,
    getAuthToken,
    getPubNubDisconnectedTime,
    getPubNubNetworkStatus,
    getWidgetTheme,
    initWidgetGlobalInProcess,
    selectActiveView,
    selectClientUUID,
    selectedChannelId,
    selectedChatScreen,
    selectInitWidgetFailed,
    selectInitWidgetSuccess,
    selectNetworkStatus,
    selectPushMessage,
    selectPushNotificationMessage,
    selectVisibility,
    selectWidgetFAQEnables,
    selectWidgetHideLauncher,
    selectWidgetInfo,
    selectWidgetShowCloseButton,
    selectWidgetToken,
} from '../store/selectors';
import { distinctUntilChanged, filter, take, takeUntil } from 'rxjs/operators';
import * as actions from '../store/actions';
import {
    addDomainTracking,
    GetChannelHistory,
    getChannelList,
    setNetworkStatus,
    setWidgetTheme,
    SubscribeChannels,
} from '../store/actions';
import { CHAT_SECTION, CHAT_SECTION_VALUE, IAdditionalData, IChannel } from '../model';
import { isEqual } from 'lodash-es';
import { createCustomElement } from '@angular/elements';
import { ArticlePopupComponent, ArticlePopupService } from './components';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../../environments/environment';
import { hexToRgbA, invertTextHex, shadeColor } from '@msg91/ui/ColorFunctions';
import { ChatService } from '../service';
import { MSG91_WIDGET_HIDE_LAUNCHER_STATUS } from '@msg91/constant';
import { removeCookie } from '../utils';

@Component({
    selector: 'msg91-chat-widget',
    templateUrl: './chat-widget.component.html',
    styleUrls: ['./chat-widget.component.scss', '../css2.css', '../icon.css'],
    animations: [fadeInOut, fadeIn],
    encapsulation: ViewEncapsulation.ShadowDom,
    standalone: false
})
export class ChatWidgetComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input() public additionalData: IAdditionalData;
    @Input() public sdkConfig: any;
    @Input() public widgetToken: string;
    @Input() public unique_id: string; // any unique id, could be username, email etc.
    @Input() public user_jwt_token: string;
    @Input() public icon_position: string = 'right'; // optional, if passed in the code, the icon position will change from left to right
    @Input() public icon_bottom_margin: any; // optional, if passed in the code, the icon position from the bottom will change.
    @Input() public name: string; // optional, if not passed in code, a form will be displayed
    @Input() public number: string; // optional, if not passed in code, a form will be displayed
    @Input() public mail: string; // optional, if not passed in code, a form will be displayed
    @Input() public delay: number; // optional, if not passed in code, a form will be displayed
    @Input() public isMobileSDK: boolean = false; // optional, if not passed in code, a form will be displayed
    @Output() public stateChange: EventEmitter<'OPEN' | 'CLOSE'> = new EventEmitter<'OPEN' | 'CLOSE'>();
    // optional, if not passed in code, a form will be displayed
    @Output() public initialize: EventEmitter<boolean> = new EventEmitter<boolean>();
    // optional, if not passed in code, a form will be displayed
    @Input() public widgetClose: (arg: any) => any;
    @Input() public widgetClientData: (arg: any) => any;
    @Input() public botConfig: { [key: string]: string | number };
    @Input() public hideUpload: boolean;
    public initWidgetSuccess$: Observable<boolean>;
    public initWidgetInProcess$: Observable<boolean>;
    public widgetFAQEnables$: Observable<boolean>;
    public hideLauncher$: Observable<boolean>;
    public visible$: Observable<boolean>;
    public client_uuid: string;
    public networkStatus$: Observable<'ONLINE' | 'OFFLINE'>;
    public PubNubStatus$: Observable<'CONNECTED' | 'LOW-NETWORK' | 'DISCONNECTED' | 'RECONNECTED'>;
    private PubNubDisconnectedTime$: Observable<number>;
    public appurl: string = environment.appUrl;
    public showCloseButton$: Observable<any>;
    public toggleInputClass = '';
    public selectInitWidgetFailed$: Observable<boolean>;
    private themeWrapper = this._document.querySelector('body');
    public textColor: string | boolean;
    public primaryColor: string;
    // public observer: MutationObserver;
    public cobrowserLoaded: boolean = false;
    public mutationInterval: any;

    @Input() set Init({ widgetToken, name, mail, number, unique_id, ...config }) {
        this.widgetToken = widgetToken;
        this.unique_id = unique_id;
        this.name = name;
        this.mail = mail;
        this.number = number;
        this.additionalData = config;
        this.initWidget();
    }

    @Input() set Open(any: void) {
        //
        this.visible = false;
    }

    @Input() set Close(any: void) {
        //
        this.visible = true;
    }

    @Input() set hide(hide: void) {
        //
        this.isHidden.next(true);
    }

    @Input() set logout(force: boolean) {
        //
        this.store.dispatch(actions.logout());
    }

    @Input() set ToggleWidget(data: boolean) {
        //
        this.visible$.pipe(take(1)).subscribe((visible) => (this.visible = !visible));
    }

    @Input() set addClassToWidget(data: string) {
        this.toggleInputClass = data;
    }

    @Input() set removeClassFromWidget(any: void) {
        this.toggleInputClass = '';
    }

    @Input()
    public set visible(visible) {
        this.store.dispatch(actions.changeVisibility({ visible }));
    }

    public activeChatView$: Observable<string>;
    public isHidden: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public chatSelectedSection$: Observable<CHAT_SECTION_VALUE>;
    public delayTimerEnd: boolean = false;
    public isValidIconBottomMargin: boolean = true;

    constructor(
        private store: Store<IAppState>,
        injector: Injector,
        @Inject(DOCUMENT) private _document: Document,
        private cdrf: ChangeDetectorRef,
        private _renderer2: Renderer2,
        private ngZone: NgZone,
        private service: ChatService,
        private popService: ArticlePopupService,
        private identityVerificationService: IdentityVerificationService
    ) {
        super();
        // Register the custom element with the browser.
        if (!customElements.get('popup-element')) {
            const PopupElement = createCustomElement(ArticlePopupComponent, { injector });
            customElements.define('popup-element', PopupElement);
        }

        this.chatSelectedSection$ = this.store.pipe(
            select(selectedChatScreen),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.visible$ = this.store.pipe(
            select(selectVisibility),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.hideLauncher$ = this.store.pipe(
            select(selectWidgetHideLauncher),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.showCloseButton$ = this.store.pipe(
            select(selectWidgetShowCloseButton),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.widgetFAQEnables$ = this.store.pipe(
            select(selectWidgetFAQEnables),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.activeChatView$ = this.store.pipe(
            select(selectActiveView),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.initWidgetSuccess$ = this.store.pipe(
            select(selectInitWidgetSuccess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.initWidgetInProcess$ = this.store.pipe(
            select(initWidgetGlobalInProcess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.networkStatus$ = this.store.pipe(
            select(selectNetworkStatus),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.PubNubStatus$ = this.store.pipe(
            select(getPubNubNetworkStatus),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.PubNubDisconnectedTime$ = this.store.pipe(
            select(getPubNubDisconnectedTime),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.selectInitWidgetFailed$ = this.store.pipe(
            select(selectInitWidgetFailed),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
    }

    ngOnInit() {
      //remove website cookie hello-widget-uuid
        removeCookie('hello-widget-uuid')
        let storedWidgetToken = this.getValueFromObservable(this.store.pipe(select(selectWidgetToken)));
        if (storedWidgetToken && storedWidgetToken !== this.widgetToken) {
            this.store.dispatch(actions.resetState());
        }
        // https://stackoverflow.com/a/24691197 reference for removing this code
        // let previousUrl = window.location.href;
        // const bodyElement = document.querySelector('body');
        // this.observer = new MutationObserver((mutations) => {
        // mutations.forEach((mutation) => {
        //     if (window.location.href !== previousUrl) {
        //         previousUrl = window.location.href;
        //         console.log(`Observer URL changed to ${window.location.href}`);
        //         this.addDomainData();
        //     }
        // });
        // });

        // const config = {
        //     childList: true,
        //     subtree: true,
        // };
        // this.observer.observe(parentDiv, config);
        this.identityVerificationService.mail = this.mail;
        this.identityVerificationService.uniqueId = this.unique_id;
        this.identityVerificationService.userJwtToken = this.user_jwt_token;
        this.identityVerificationService.number = this.number;

        let previousUrl = window.location.href;
        this.mutationInterval = setInterval(() => {
            if (window.location.href !== previousUrl) {
                previousUrl = window.location.href;
                console.log(`Observer URL changed to ${window.location.href}`);
                this.addDomainData();
            }
        }, 2000);
        this.store
            .pipe(select(selectClientUUID), distinctUntilChanged(isEqual), takeUntil(this.destroy$))
            .subscribe((res) => {
                if (res && this.isMobileSDK && this.widgetClientData) {
                    this.widgetClientData({ uuid: res });
                }
                if (res) {
                    this.addDomainData();
                }
            });

        this.getMatIconFontCSS();
        this.getOpenFontCSS();
        this.loadFroalaEmbedJs();
        this.initWidget();
        this.visible$.subscribe((res) => {
            this.stateChange.next(res ? 'OPEN' : 'CLOSE');
        });
        this.initWidgetSuccess$.subscribe((res) => {
            this.initialize.next(res);
        });
        if (!window['chatWidget']) {
            window['chatWidget'] = {
                // Personal Use Methods
                // window.chatWidget.init(); // init widget
                // window.chatWidget.logout(); // logout widget & can start with fresh data
                // window.chatWidget.shutdown(); // complete shut down

                // Shareable Methods
                // window.chatWidget.toggleWidget(); // toggle open/close
                // window.chatWidget.open(); // open widget dialog
                // window.chatWidget.close(); // close widget dialog
                // window.chatWidget.hide(); // hide widget
                // window.chatWidget.show(); // show widget
                // window.chatWidget.addCustomData(); // add custom data with short name at segmento by widget, json have to pass

                init: (config) => {
                    if (config.widgetToken) {
                        this.Init = config;
                    } else {
                        throw Error('widgetToken is missing');
                    }
                },
                logout: () => {
                    this.logout = true;
                },
                toggleWidget: () => {
                    this.toggleChat();
                },
                open: () => {
                    this.openChat();
                },
                close: () => {
                    this.closeChat();
                },
                hide: (hide: boolean = true) => {
                    this.isHidden.next(hide);
                    this.cdrf.detectChanges();
                },
                show: () => {
                    this.isHidden.next(false);
                    this.cdrf.detectChanges();
                },
                shutdown: () => {
                    this.logout = true;
                    this.unique_id = '';
                    this.client_uuid = '';
                    this.name = '';
                    this.mail = '';
                    this.number = '';
                    this.additionalData = null;
                    this.initWidget();
                },
                addCustomData: (data: any) => {
                    this.addCustomData(data);
                },
                ToggleWidget: () => {
                    this.toggleChat();
                },
                Show: () => {
                    this.isHidden.next(false);
                    this.cdrf.detectChanges();
                },
                Hide: () => {
                    this.isHidden.next(true);
                    this.cdrf.detectChanges();
                },
                Init: (config) => {
                    this.Init = config;
                },
                Shutdown: () => {
                    this.logout = true;
                    this.unique_id = '';
                    this.client_uuid = '';
                    this.name = '';
                    this.mail = '';
                    this.number = '';
                    this.additionalData = null;
                    this.initWidget();
                },
                forcedStop: false,
            };
        }
        this.PubNubStatus$.subscribe((res) => {
            switch (res) {
                case 'RECONNECTED': {
                    let FromTime: number;
                    let uuid;
                    let widgetToken;
                    this.PubNubDisconnectedTime$.pipe(take(1)).subscribe((time) => {
                        FromTime = time;
                    });
                    this.store.pipe(select(selectClientUUID), take(1)).subscribe((id) => {
                        uuid = id;
                    });
                    this.store.pipe(select(selectWidgetToken), take(1)).subscribe((token) => {
                        widgetToken = token;
                    });
                    // if (FromTime && channels?.length) {
                    //     channels.forEach((channel) => {
                    //         this.store.dispatch(
                    //             GetChannelHistory({
                    //                 request: {
                    //                     channel,
                    //                     origin: 'chat',
                    //                     page_size: 30,
                    //                     start_from: 1,
                    //                 },
                    //                 reconnection: true,
                    //             })
                    //         );
                    //     });
                    // }
                    if (uuid && widgetToken) {
                        this.store.dispatch(
                            getChannelList({
                                widgetToken,
                                data: { uuid },
                                uuid,
                                reconnection: true,
                            })
                        );
                    }
                }
            }
        });

        this.selectInitWidgetFailed$.subscribe((res) => {
            if (res) {
                this.isHidden.next(true);
            }
        });

        this.initWidgetSuccess$.subscribe((res) => {
            if (res) {
                this.isHidden.next(false);
            }
        });

        this.store
            .pipe(select(getWidgetTheme), distinctUntilChanged(isEqual), takeUntil(this.destroy$))
            .subscribe((res) => {
                if (res) {
                    this.textColor = res.textColor;
                }
            });

        this.store
            .pipe(select(selectWidgetInfo), distinctUntilChanged(isEqual), takeUntil(this.destroy$))
            .subscribe((res) => {
                if (res) {
                    this.createTheme({
                        primaryColor:
                            this.sdkConfig?.customTheme && this.isMobileSDK
                                ? this.sdkConfig?.customTheme
                                : res.primary_color,
                    });
                    if (
                        this.additionalData?.launch_widget === true ||
                        (this.additionalData?.launch_widget !== false && res.launch_widget)
                    ) {
                        this.openChat();
                    }
                    if (
                        this.additionalData?.hide_launcher === true ||
                        (this.additionalData?.hide_launcher !== false && res.hide_launcher)
                    ) {
                        window[MSG91_WIDGET_HIDE_LAUNCHER_STATUS] = true;
                    }
                }
            });

        combineLatest([
            this.store.pipe(
                select(selectClientUUID),
                filter((id) => !!id)
            ),
            this.store.pipe(
                select(selectWidgetInfo),
                filter((info) => !!info)
            ),
            this.store.pipe(
                select((p) => p.pubnub.isPubNubInitialized),
                filter((status) => !!status)
            ),
        ])
            .pipe(take(1))
            .subscribe((res) => {
                if (res) {
                    this.store.dispatch(SubscribeChannels({ channel: [`ch-comp-${res[1]?.company_id}.${res[0]}`] }));
                    if (this.botConfig?.type === 'trial_bot') {
                        const channel: IChannel = {
                            id: 1,
                            channel: this.botConfig?.session_id,
                        } as any;
                        this.store.dispatch(
                            actions.setChannels({
                                channels: [channel],
                                uuid: res[0],
                            })
                        );
                        this.store.dispatch(actions.SubscribeChannels({ channel: [channel.channel] }));
                        this.store.dispatch(actions.selectChannel({ channel: channel.channel }));
                        this.store.dispatch(actions.setChatScreen({ chatScreen: CHAT_SECTION.selectedChannel }));
                    }
                }
            });

        this.store
            .pipe(select(selectPushNotificationMessage), distinctUntilChanged(isEqual), takeUntil(this.destroy$))
            .subscribe((res) => {
                if (res) {
                    this.popService.showAsElement('', res);
                }
            });

        this.store
            .pipe(select(selectPushMessage), takeUntil(this.destroy$), distinctUntilChanged(isEqual))
            .subscribe((res) => {
                if (res && !this.visible && !this.getValueFromObservable(this.store.pipe(select(selectedChannelId)))) {
                    this.openChat();
                }
            });

        // for checking value icon bottom space is number or not
        if (this.icon_bottom_margin && typeof this.icon_bottom_margin !== 'number') {
            this.isValidIconBottomMargin = false;
            console.warn(this.icon_bottom_margin, 'Invalid chat icon position. Please check the document at https://msg91.com/help');
        }
    }

    private addDomainData(): void {
        let uuid, widgetInfo;
        this.store.pipe(select(selectClientUUID), take(1)).subscribe((id) => (uuid = id));
        this.store.pipe(select(selectWidgetInfo), take(1)).subscribe((widget) => (widgetInfo = widget));
        if (widgetInfo?.is_domain_enable && uuid) {
            this.store.dispatch(addDomainTracking({ domain: window.location.href }));
        }
    }

    private initNetworkMonitor() {
        if (window.navigator.onLine) {
            this.store.dispatch(setNetworkStatus({ status: 'ONLINE' }));
        }
        window.addEventListener('online', (event) => this.store.dispatch(setNetworkStatus({ status: 'ONLINE' })));
        window.addEventListener('offline', (event) => this.store.dispatch(setNetworkStatus({ status: 'OFFLINE' })));
    }

    private removeListeners() {
        window.removeEventListener('online', (event) => console.log(event));
        window.removeEventListener('offline', (event) => console.log(event));
        window.removeEventListener('popstate', (event) => console.log(event));
        // this.observer?.disconnect();
    }

    private addCustomData(data): void {
        this.store.pipe(select(getAuthToken), take(1)).subscribe((authToken) => {
            this.service.updateClient({ ...data }, authToken).subscribe((res) => {
                // console.log(res);
            });
        });
    }

    public initWidget() {
        setTimeout(() => {
            if (this.unique_id) {
                // this.client_uuid = this.unique_id;

                // Issue fixed related to this card
                // https://app.clickup.com/t/86cu9eu1x
                removeCookie('hello-widget-anonymous-uuid');
            } else {
                this.client_uuid =
                    this.getCookieValue('hello-widget-uuid') || this.getCookieValue('hello-widget-anonymous-uuid');
            }
            this.store.dispatch(
                actions.initWidget({
                    config: {
                        widgetToken: this.widgetToken,
                        mail: this.mail,
                        additionalData: this.additionalData,
                        name: this.name,
                        client_uuid: this.client_uuid,
                        number: this.number,
                        unique_id: this.unique_id,
                    },
                })
            );
            this.store
                .pipe(select(selectClientUUID), distinctUntilChanged(isEqual), takeUntil(this.destroy$))
                .subscribe((res) => {
                    if (res && window['CobrowseIO']) {
                        window['CobrowseIO'].customData = {
                            device_id: res,
                        };
                    }
                });
            this.initNetworkMonitor();
            this.delayTimerEnd = true;
        }, this.delay);
    }

    public closeWidgetWithCallBack(): void {
        this.toggleChat();
        this.widgetClose({ widgetClose: true });
    }

    public toggleChat() {
        this.visible$.pipe(take(1)).subscribe((visible) => {
            this.visible = !visible;
            this.setCobrowser();
            this.cdrf.detectChanges();
        });
    }

    public openChat() {
        this.visible = true;
        this.setCobrowser();
        this.cdrf.detectChanges();
    }

    public closeChat() {
        this.visible = false;
        this.cdrf.detectChanges();
    }

    public ngOnDestroy() {
        this.addDomainData();
        this.removeListeners();
        clearInterval(this.mutationInterval);
        document.getElementById('viewportMetaTagRef')?.remove();
        super.ngOnDestroy();
    }

    public enableChatView(e) {
        this.ngZone.run(() => {
            this.store.dispatch(actions.setActiveView({ activeView: e ? 'Chat' : 'FAQ' }));
        });
    }

    private getCookieValue(name) {
        const result = this._document.cookie.match('(^|[^;]+)\\s*' + name + '\\s*=\\s*([^;]+)');
        return result ? result.pop() : '';
    }

    public createTheme(res): void {
        const primaryColor = res && res?.primaryColor ? res?.primaryColor : '#0F22A7';
        const warningColor = res && res?.warningColor ? res?.warningColor : '#cc3300';
        const headerTextColor = res && res?.headerTextColor ? res?.headerTextColor : '';
        const gradientHeader = res && res?.gradientHeader ? res?.gradientHeader : false;
        this.primaryColor = primaryColor;

        const widgetTheme = {
            primaryColor: primaryColor,
            primaryColorLight: shadeColor(primaryColor, 15),
            primaryColorDark: shadeColor(primaryColor, -20),
            textColor: headerTextColor ? headerTextColor : invertTextHex(primaryColor),
            secondaryColor: hexToRgbA(primaryColor, '9%'),
            inboundMsg: hexToRgbA(primaryColor, '9%'),
            outboundMsg: primaryColor,
            textMsgColor: invertTextHex(primaryColor),
            warningColor: warningColor,
            gradientHeader: gradientHeader,
            fontFamily: "'Inter', sans-serif",
        };

        this.themeWrapper.style.setProperty('--msg-primaryColor', widgetTheme.primaryColor);
        this.themeWrapper.style.setProperty('--msg-primaryColorLight', widgetTheme.primaryColorLight);
        this.themeWrapper.style.setProperty('--msg-primaryColorDark', widgetTheme.primaryColorDark);
        this.themeWrapper.style.setProperty('--msg-secondaryColor', widgetTheme.secondaryColor);
        this.themeWrapper.style.setProperty('--msg-outboundMsg', widgetTheme.outboundMsg);
        this.themeWrapper.style.setProperty('--msg-inboundMsg', widgetTheme.inboundMsg);
        this.themeWrapper.style.setProperty('--msg-textColor', widgetTheme.textColor);
        this.themeWrapper.style.setProperty('--msg-textMsgColor', widgetTheme.textMsgColor);
        this.themeWrapper.style.setProperty('--msg-warningColor', widgetTheme.warningColor);
        this.themeWrapper.style.setProperty('--msg-fontFamily', widgetTheme.fontFamily);
        this.store.dispatch(setWidgetTheme({ widgetTheme }));
    }

    getOpenFontCSS() {
        const link = this._renderer2.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap`;
        this._renderer2.appendChild(this._document.head, link);
    }

    getMatIconFontCSS() {
        const link = this._renderer2.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/icon?family=Material+Icons`;
        this._renderer2.appendChild(this._document.head, link);
    }

    loadFroalaEmbedJs() {
        // commenting code as currently embed URL not working in widget with current code & issue occurred in ng 8 to 10
        // const link = this._renderer2.createElement('script');
        // link.src = `//cdn.embedly.com/widgets/platform.js`;
        // this._renderer2.appendChild(this._document.head, link);
    }

    public setCobrowser(): void {
        if (!this.cobrowserLoaded && !this.isMobileSDK) {
            this.store.pipe(select(selectClientUUID), take(1)).subscribe((uuid) => {
                const coBrowseScript = document.createElement('script');
                coBrowseScript.type = 'text/javascript';
                coBrowseScript.innerHTML = `
                    (function(w,t,c,p,s,e){p=new Promise(function(r){w[c]={client:function(){if(!s){
                    s=document.createElement(t);s.src='https://js.cobrowse.io/CobrowseIO.js';s.async=1;
                    e=document.getElementsByTagName(t)[0];e.parentNode.insertBefore(s,e);s.onload=function()
                    {r(w[c]);};}return p;}};});})(window,'script','CobrowseIO');

                    CobrowseIO.license = "FZBGaF9-Od0GEQ";
                    CobrowseIO.customData = {
                            device_id: "${uuid}"
                        };
                    CobrowseIO.client().then(() => {
                    if(CobrowseIO) {
                        CobrowseIO.start();
                        }
                    });`;
                const headerEle = document.getElementsByTagName('head').item(0);
                if (headerEle && !window['CobrowseIO']) {
                    headerEle.append(coBrowseScript);
                    this.cobrowserLoaded = true;
                }
            });
        }
    }
}
