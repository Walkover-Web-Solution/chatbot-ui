import { Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { BaseComponent } from '@msg91/ui/base-component';
import { Observable } from 'rxjs';
import { CHAT_SECTION, IChannel, IChannelAssignees } from '../../../model';
import { IAppState } from '../../../store';
import { select, Store } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';
import {
    allChannels,
    getAssigneesOfChannel,
    getWidgetTheme,
    selectClientName,
    selectFaqFlag,
    selectWidgetTagline,
} from '../../../store/selectors';
import * as actions from '../../../store/actions';
import { environment } from '../../../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'msg91-channels-list',
    templateUrl: './channels-list.component.html',
    styleUrls: ['./channels-list.component.scss'],
    standalone: false
})
export class ChannelsListComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input() sdkConfig: any;
    @Input() isMobileSDK: boolean;
    public channels$: Observable<IChannel[]>;
    public clientName$: Observable<any>;
    public widgetTagline$: Observable<any>;
    public widgetShowFaq$: Observable<boolean>;
    public channelAssignees$: { [channel: string]: Observable<IChannelAssignees> } = {};
    appurl: string = environment.appUrl;
    public backgroundImage: any;
    public primaryColor: string;

    constructor(private store: Store<IAppState>, private sanitizer: DomSanitizer, private ngZone: NgZone) {
        super();
    }

    ngOnInit() {
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
        this.channels$ = this.store.pipe(
            select(allChannels),
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

        this.store
            .pipe(select(getWidgetTheme), distinctUntilChanged(isEqual), takeUntil(this.destroy$))
            .subscribe((res) => {
                if (res) {
                    this.backgroundImage = res.gradientHeader
                        ? this.transform(
                              `url( \'${this.appurl}assets/img/bg-branding.png\'), linear-gradient(211deg, ${res?.primaryColorDark} 44%, ${res?.primaryColorDark} 40.2%, ${res?.primaryColorLight} 116.5%, ${res?.primaryColorLight} 102.1%)`
                          )
                        : '';
                    this.primaryColor = res.primaryColor;
                }
            });
    }

    transform(style) {
        return this.sanitizer.bypassSecurityTrustStyle(style);
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    backToChat() {
        this.store.dispatch(actions.setChatScreen({ chatScreen: null }));
    }

    selectChannel(channel: IChannel) {
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
}
