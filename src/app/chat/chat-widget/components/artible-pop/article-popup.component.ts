import { Component, EventEmitter, HostBinding, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SetPushNotifications } from '../../../store/actions';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../store';

export interface IPosition {
    horizontal_position: string;
    vertical_position: string;
}
export interface ISize {
    width: string;
    height: string;
}
@Component({
    selector: 'msg91-article-popup',
    templateUrl: './article-popup.component.html',
    styleUrls: ['./article-popup.component.scss'],
    animations: [
        trigger('state', [
            state('opened', style({ transform: 'translateY(0%)' })),
            state('void, closed', style({ transform: 'translateY(100%)', opacity: 0 })),
            transition('* => *', animate('100ms ease-in')),
        ]),
    ],
})
export class ArticlePopupComponent implements OnInit, OnDestroy {
    @HostBinding('@state')
    state: 'opened' | 'closed' = 'closed';
    @Output()
    closed = new EventEmitter<void>();

    constructor(private store: Store<IAppState>) {}

    private _message: string;

    @Input()
    get message(): string {
        return this._message;
    }

    set message(message: string) {
        this._message = message;
        this.state = 'opened';
    }

    private _position: IPosition;

    @Input()
    get position(): IPosition {
        return this._position;
    }

    set position(position: IPosition) {
        this._position = position;
    }

    private _isNotification: boolean = true;
    @Input()
    get isNotification(): boolean {
        return this._isNotification;
    }

    set isNotification(isNotification: boolean) {
        this._isNotification = isNotification;
    }

    private _title: string;

    @Input()
    get title(): string {
        return this._title;
    }

    set title(title: string) {
        this._title = title;
        this.state = 'opened';
    }

    private _size: ISize;

    @Input()
    get size(): ISize {
        return this._size;
    }

    set size(size: ISize) {
        this._size = size;
    }

    ngOnInit(): void {}

    ngOnDestroy(): void {
        this.store.dispatch(SetPushNotifications({ response: { message: null } }));
    }

    public onIframeLoad(iframe, data): void {
        const frame = iframe.contentDocument || iframe.contentWindow;
        const sizeIframe = frame.body;
        frame.open();
        frame.write(data);
        if (this.size?.width && this.size?.height) {
            iframe.style.height = this.size.height + 'px';
            iframe.style.width = this.size.width + 'px';
        } else if (sizeIframe) {
            const frameWidth = sizeIframe.offsetWidth;
            const frameHeight = sizeIframe.offsetHeight;
            iframe.style.width = frameWidth + 'px';
            iframe.style.height = frameHeight + 'px';
        } else {
            iframe.style.height = frame.scrollingElement.scrollHeight + 'px';
            iframe.style.width = frame.scrollingElement.scrollWidth + 'px';
        }
    }
}
