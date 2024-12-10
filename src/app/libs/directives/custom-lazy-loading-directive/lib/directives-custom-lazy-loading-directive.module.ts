import {
    AfterViewInit,
    Directive,
    EventEmitter,
    HostListener,
    Input,
    NgModule,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import { DEBOUNCE_TIME } from '@msg91/constant';
import { isMobileDevice } from '@msg91/utils';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Directive({ selector: '[msg91CustomLazyLoading]' })
export class CustomLazyLoadingDirective implements OnInit, AfterViewInit, OnDestroy {
    @Output() public scrollEvent = new EventEmitter<any>();
    @Input() public offsetFromBottom: number = 30;
    /** If true, then emits the event for website, required for web pages */
    @Input() public enableForWeb: boolean;
    /** If true, will attach scroll event on custom element */
    @Input() public enableCustomScroller: boolean;
    /** Selector for custom element  */
    @Input() public selector: string;

    /** Subject to avoid multiple calculations  */
    private scrollEventSubject: Subject<any> = new Subject();
    /** Subject to unsubscribe from listeners */
    private destroy$: Subject<any> = new Subject();

    constructor() {}

    @HostListener('scroll', ['$event'])
    public onScroll(e): void {
        this.scrollEventSubject.next(e);
    }

    /**
     * Scroll event handler
     *
     * @param {*} event Scroll event
     * @memberof CustomLazyLoadingDirective
     */
    public scrollEventListener = (event) => {
        this.scrollEventSubject.next(event);
    };

    /**
     * Scroll event listener
     *
     * @param {*} e Scroll event
     * @memberof CustomLazyLoadingDirective
     */
    public handleScrollEvent(e: any): void {
        if (e.target['offsetHeight'] + e.target['scrollTop'] + this.offsetFromBottom > e.target['scrollHeight']) {
            if (isMobileDevice() || this.enableForWeb) {
                this.scrollEvent.emit(true);
            }
        }
    }

    /**
     * Initializes the component
     *
     * @memberof CustomLazyLoadingDirective
     */
    ngOnInit(): void {
        this.scrollEventSubject
            .pipe(debounceTime(DEBOUNCE_TIME), takeUntil(this.destroy$))
            .subscribe((event) => this.handleScrollEvent(event));
    }

    /**
     * Adds the event listener for custom element
     *
     * @memberof CustomLazyLoadingDirective
     */
    ngAfterViewInit(): void {
        if (this.enableCustomScroller && this.selector) {
            const element = document.querySelector(this.selector);
            element?.addEventListener('scroll', this.scrollEventListener);
        }
    }

    /**
     * Unsubscribes the listeners
     *
     * @memberof CustomLazyLoadingDirective
     */
    ngOnDestroy(): void {
        if (this.enableCustomScroller && this.selector) {
            const element = document.querySelector(this.selector);
            element?.removeEventListener('scroll', this.scrollEventListener);
        }
        this.destroy$.next(false);
        this.destroy$.complete();
    }
}

@NgModule({
    imports: [],
    declarations: [CustomLazyLoadingDirective],
    exports: [CustomLazyLoadingDirective],
})
export class CustomLazyLoadingDirectiveModule {}
