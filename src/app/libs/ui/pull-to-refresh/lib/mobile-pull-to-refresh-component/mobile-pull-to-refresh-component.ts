import {
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnInit,
    Output,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { BaseComponent } from '@msg91/ui/base-component';
// import { Store } from '@ngrx/store';
// import { pullToReload } from 'apps/msg91/src/app/store/actions/general';
// import { IAppState } from 'apps/msg91/src/app/store/reducers/app.state';
import { Observable, of, distinctUntilChanged, map, filter, takeUntil, Subject, mapTo } from 'rxjs';
import { LOADED } from '../loaded.token';
import { MICRO_OFFSET, PULLED_DISTANCE, PULLING, PULL_TO_REFRESH_PROVIDERS } from '../pull-to-refresh.providers';

const loaded$ = new Subject<void>();

@Component({
    selector: 'msg91-mobile-refresh',
    templateUrl: './mobile-pull-to-refresh-component.html',
    styleUrls: ['./mobile-pull-to-refresh-component.scss'],
    providers: [
        PULL_TO_REFRESH_PROVIDERS,
        {
            provide: LOADED,
            useValue: loaded$.asObservable(),
        },
    ],
})
export class MobilePullToRefreshComponent extends BaseComponent implements OnInit {
    @ViewChild('parentOfAll') public parentOfAll: ElementRef;

    /** Use to render template */
    @Input() public template: TemplateRef<unknown>;
    /** Use to hide refresh button */
    @Input() set hideRefreshButton(reHit: any) {
        if (reHit) {
            const { firstElementChild } = this.parentOfAll.nativeElement;
            setTimeout(() => this.hideButton(firstElementChild, !reHit), reHit === 1 ? 400 : 200);
        }
    }

    /**
     * Here we wait pulling$ to emit PULLED_DISTANCE constant which means loading time.
     * We also transform it to undefined just to follow API with <void> type.
     */
    @Output()
    readonly pulled: Observable<any> = this.pulling$.pipe(
        distinctUntilChanged(),
        filter((distance) => distance === PULLED_DISTANCE),
        mapTo(undefined)
    );

    @Output() public pullComplete: EventEmitter<void> = new EventEmitter();

    protected IOS_LOADING_DISTANCE = PULLED_DISTANCE / 2;
    protected ANDROID_MAX_DISTANCE = PULLED_DISTANCE * 1.5;

    /**
     * Pulling percentage about how much user pulled.
     */
    readonly pulledInPercent$: Observable<number> = this.pulling$.pipe(
        map((distance) => (distance * 100) / PULLED_DISTANCE)
    );

    /**
     * We just transform pulling$ and limit it with a one-and-a-half pulled distance
     * to give users more space to pull but not too far.
     */
    readonly loaderTransform$: Observable<string> = this.pulling$.pipe(
        map((distance) => this.translateY(Math.min(distance, this.ANDROID_MAX_DISTANCE)))
    );

    /**
     * On IOS, a user pulls all the content and a loading circle appears.
     * That is why we can also add a stream of content transformation:
     * We compare current distance with PULLED_DISTANCE . When it equals,
     * we set distance for IOS and start loading
     */
    readonly contentTransform$: Observable<string | null> = this.cdkPlatform.IOS
        ? this.pulling$.pipe(
              map((distance) => (distance === PULLED_DISTANCE ? this.IOS_LOADING_DISTANCE : distance)),
              map(this.translateY)
          )
        : of(null);

    /**
     * Stream that we need for Android loading is adding .drop-animation class
     * with smooth animation for the loading circle going to its position .
     * distance ≤ MICRO_OFFSET is a case when user drops pulling before PULLED_DISTANCE.
     * And distance === PULLED_DISTANCE is loading.
     */
    readonly dropped$: Observable<boolean> = this.pulling$.pipe(
        map((distance) => distance <= MICRO_OFFSET || distance === PULLED_DISTANCE),
        distinctUntilChanged()
    );

    constructor(@Inject(PULLING) private readonly pulling$: Observable<number>) {
        super();
    }

    ngOnInit() {
        this.pulledInPercent$.pipe(takeUntil(this.destroy$)).subscribe({
            next: (response) => {
                if (response === 100) {
                    // this.store.dispatch(pullToReload({ response: true }));
                    this.pullComplete.emit();
                    setTimeout(() => {
                        loaded$.next();
                    }, 1500);
                }
            },
        });
    }

    ngAfterViewInit() {
        const dynamicDiv = document.createElement('div');
        dynamicDiv.classList.add('pull-to-refresh-check-point');
        const { firstElementChild } = this.parentOfAll.nativeElement;
        firstElementChild.insertAdjacentElement('afterbegin', dynamicDiv);
        this.hideButton(firstElementChild);
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    private hideButton(firstElementChild: HTMLElement, displayBlock: boolean = false) {
        const findRefreshButton: HTMLButtonElement = firstElementChild.querySelector('button[mattooltip="Refresh"]');
        if (findRefreshButton) {
            if (!displayBlock) {
                findRefreshButton.style.display = 'none';
            } else if (displayBlock) {
                findRefreshButton.style.display = 'block';
            }
        }
    }

    private translateY(distance: number): string {
        return `translateY(${distance}px)`;
    }
}
