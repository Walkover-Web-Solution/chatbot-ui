import {
    ChangeDetectorRef,
    ComponentRef,
    Directive,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import { ConnectedPosition, Overlay, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { CustomTooltipComponent } from './custom-tooltip.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Directive({ selector: '[awesomeTooltip]', exportAs: 'awesomeTooltip' })
export class CustomTooltipDirective implements OnInit, OnDestroy {
    /** Key value pair to be shown on tooltip */
    @Input('awesomeTooltip') toolTipValue: [];
    /** False, if tooltip need to be shown manually or on any other event than hover such as double click */
    @Input() public toggleTooltipOnHover: boolean = true;
    /** True, if close button needs to be shown in directive */
    @Input() public showCloseButton: boolean = false;
    /** True, if Backdrop needs to be shown in directive */
    @Input() public hasBackdrop: boolean = false;
    /** True, if need stop closing directive no backdrop click */
    @Input() public disableClose: boolean = false;
    /** Classes needs to be added on backdrop */
    @Input() public backdropClass: string = '';
    /** offsetX accept both positive and negative number */
    @Input() public offsetX: number = 0;
    /** offsetY accept both positive and negative number  */
    @Input() public offsetY: number = 0;
    /** tooltip closed */
    @Output() public toolTipClosed: EventEmitter<boolean> = new EventEmitter();
    /** True, if tooltip is shown */
    public isShown: boolean = false;
    /** Overlay ref for tooltip component */
    private overlayRef: OverlayRef;
    /** Subject to unsubscribe from the listeners */
    private destroy$: Subject<boolean> = new Subject();
    /** object that allows you to abort one or more DOM requests */
    private controller: AbortController;

    constructor(
        private overlay: Overlay,
        private overlayPositionBuilder: OverlayPositionBuilder,
        private elementRef: ElementRef,
        private cdk: ChangeDetectorRef
    ) {}

    public ngOnInit(): void {
        const positionStrategy = this.overlayPositionBuilder
            .flexibleConnectedTo(this.elementRef)
            .withPositions(Object.values(this.positionConfig()) as ConnectedPosition[]);
        this.overlayRef = this.overlay.create({
            positionStrategy,
            ...(this.hasBackdrop && { hasBackdrop: true, backdropClass: this.backdropClass }),
        });
        if (this.hasBackdrop && !this.disableClose) {
            this.overlayRef
                .backdropClick()
                .pipe(takeUntil(this.destroy$))
                .subscribe(() => this.hide());
        }
    }

    @HostListener('mouseover')
    public showTooltipOnHover(): void {
        if (this.toggleTooltipOnHover && this.toolTipValue.length > 0) {
            this.show();
        }
    }

    @HostListener('mouseout')
    public hideTooltipOnHover(): void {
        if (this.toggleTooltipOnHover && this.toolTipValue.length > 0) {
            this.hide();
        }
    }

    public show(): void {
        this.isShown = true;
        const tooltipRef: ComponentRef<CustomTooltipComponent> = this.overlayRef.attach(
            new ComponentPortal(CustomTooltipComponent)
        );
        const componentInstance = tooltipRef.instance;
        componentInstance.showCloseButton = this.showCloseButton;
        componentInstance.toolTipValue = this.toolTipValue;
        componentInstance.toolTipValueType = typeof this.toolTipValue;
        componentInstance.closeTooltip.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.hide();
        });
        this.controller = new AbortController();
        this.removeOnScroll();
    }

    public hide(): void {
        if (this.overlayRef) {
            this.overlayRef.detach();
            // this.overlayRef.dispose();
            this.closeToolTip();
        }
        this.isShown = false;
    }

    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    public positionConfig() {
        return {
            rightCenter: {
                originX: 'end',
                originY: 'center',
                overlayX: 'start',
                overlayY: 'center',
                offsetX: this.offsetX,
                offsetY: this.offsetY,
            },
            bottomCenter: {
                originX: 'center',
                originY: 'bottom',
                overlayX: 'center',
                overlayY: 'top',
                offsetX: this.offsetX,
                offsetY: this.offsetY,
            },
            leftCenter: {
                originX: 'start',
                originY: 'center',
                overlayX: 'end',
                overlayY: 'center',
                offsetX: this.offsetX,
                offsetY: this.offsetY,
            },
            topCenter: {
                originX: 'center',
                originY: 'top',
                overlayX: 'center',
                overlayY: 'bottom',
                offsetX: this.offsetX,
                offsetY: this.offsetY,
            },
        };
    }

    public closeToolTip(): void {
        if (this.overlayRef) {
            this.overlayRef.detach();
            this.cdk.detectChanges();
        }
        if (!this.overlayRef.hasAttached() && this.controller) {
            this.controller.abort();
            this.controller = null;
            if (this.toolTipClosed.observed) {
                this.toolTipClosed.emit(true);
            }
        }
    }

    public removeOnScroll() {
        const tableScroll = document.getElementsByClassName('table-scroll')?.[0];
        this.addEventListenerWrapper(tableScroll, this.closeToolTip, 'scroll', { signal: this.controller.signal });
    }

    public addEventListenerWrapper(elementToAddListener: any, fun: Function, event: string, options?: any) {
        elementToAddListener?.addEventListener(event, fun.bind(this), options || {});
    }
}
