import { ComponentRef, Directive, Input, OnChanges, SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';
import { MobilePullToRefreshComponent } from './mobile-pull-to-refresh-component/mobile-pull-to-refresh-component';
import { takeUntil } from 'rxjs/operators';

@Directive({
    selector: '[pullToReload]',
})
export class PullToReloadDirective implements OnChanges {
    /** Use to init component MobilePullToRefreshComponent. */
    @Input() pullToReload: boolean = false;
    /** Use to hide Refresh button on component. */
    @Input('pullToReloadHideButton') public hideButton: boolean = false;
    /** input property to take subject so we can use it as @Output event emitter. */
    @Input('pullToReloadPulled') public pulled: Subject<boolean>;
    /** Input property for emitting the pull down complete event for parent component to carry out further operation */
    @Input('pullToReloadPullComplete') public pullComplete: Subject<void>;

    /** Hold reference of dynamic component. */
    private componentRef: ComponentRef<MobilePullToRefreshComponent> = null;

    /** Subject to unsubscribe from the listeners */
    private destroy$: Subject<boolean> = new Subject();

    constructor(
        private readonly viewContainerReference: ViewContainerRef,
        private templateRef: TemplateRef<unknown>
    ) {}

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.pullToReload) {
            if (changes.pullToReload?.currentValue) {
                this.createPullToRefreshWrapperComponent();
            } else {
                this.viewContainerReference.createEmbeddedView(this.templateRef);
            }
        }
        if (changes.hideButton?.currentValue) {
            const valueType = typeof changes.hideButton?.currentValue;
            if (valueType === 'boolean') {
                this.componentRef.instance.hideRefreshButton = changes.hideButton.currentValue;
            } else if (valueType === 'number') {
                this.componentRef.instance.hideRefreshButton = changes.hideButton?.currentValue;
            }
        }
    }

    /**
     * Create component and render template with in it.
     */
    private createPullToRefreshWrapperComponent(): void {
        this.componentRef = this.viewContainerReference.createComponent(MobilePullToRefreshComponent);
        this.componentRef.instance.template = this.templateRef;
        if (this.pulled?.observed) {
            this.componentRef.instance.pulled.pipe(takeUntil(this.destroy$)).subscribe({
                next: () => this.pulled.next(true),
            });
        }
        if (this.pullComplete) {
            this.componentRef.instance.pullComplete.pipe(takeUntil(this.destroy$)).subscribe({
                next: () => {
                    this.pullComplete?.next();
                },
            });
        }
    }

    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
}
