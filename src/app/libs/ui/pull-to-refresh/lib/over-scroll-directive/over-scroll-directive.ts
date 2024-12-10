import { Directive, ElementRef, HostBinding, Inject, Input } from '@angular/core';
import { filter, fromEvent, Subject, tap } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { canScroll } from './can-scroll';
import { getScrollParent } from './util';

/**
 * Directive to isolate scrolling, i.e. prevent body scroll behind modal dialog
 */
@Directive({
    selector: '[overScroll]',
})
export class OverscrollDirective {
    @Input('overScroll')
    mode: 'all' | 'none' | 'scroll' = 'scroll';

    /**
     * all : blocks all scrolling,
     * none : directive not work,
     * scroll : Blocks parent scrolling if container is scrollable
     */

    /** Subject to unsubscribe from the listeners */
    private destroy$: Subject<boolean> = new Subject();

    constructor(@Inject(ElementRef) { nativeElement }: ElementRef<HTMLElement>) {
        fromEvent(nativeElement, 'wheel', { passive: false })
            .pipe(
                filter(() => this.enabled),
                takeUntil(this.destroy$)
            )
            .subscribe((event: WheelEvent) => {
                this.processEvent(event, !!event.deltaY, event.deltaY ? event.deltaY < 0 : event.deltaX < 0);
            });

        fromEvent(nativeElement, 'touchstart', { passive: true })
            .pipe(
                switchMap(({ touches }: TouchEvent) => {
                    let { clientX, clientY } = touches[0];
                    let deltaX = 0;
                    let deltaY = 0;
                    let vertical: boolean;

                    return fromEvent(nativeElement, 'touchmove', {
                        passive: false,
                    }).pipe(
                        filter(() => this.enabled),
                        tap((event: TouchEvent) => {
                            // We have to have it in tap instead of subscribe due to variables in closure
                            const changedTouch = event.changedTouches[0];

                            deltaX = clientX - changedTouch.clientX;
                            deltaY = clientY - changedTouch.clientY;
                            clientX = changedTouch.clientX;
                            clientY = changedTouch.clientY;

                            if (vertical === undefined) {
                                vertical = Math.abs(deltaY) > Math.abs(deltaX);
                            }

                            this.processEvent(event, vertical, vertical ? deltaY < 0 : deltaX < 0);
                        })
                    );
                }),
                takeUntil(this.destroy$)
            )
            .subscribe();
    }

    get enabled(): boolean {
        return this.mode !== 'none';
    }

    @HostBinding('style.overscrollBehavior')
    get overscrollBehavior(): 'contain' | null {
        return this.enabled ? 'contain' : null;
    }

    private processEvent(event: any, vertical: boolean, negative: boolean): void {
        const { target, currentTarget, cancelable } = event;

        if (!cancelable || (target as HTMLInputElement)?.type === 'range') {
            return;
        }

        // This is all what's needed in Chrome/Firefox thanks to CSS overscroll-behavior
        // this condition means we have to stop scroll behavior by comparing scroll parent and current target.
        if (
            this.mode === 'all' &&
            ((vertical && !currentTarget.contains(getScrollParent(target))) ||
                (!vertical && !currentTarget.contains(getScrollParent(target, false))))
        ) {
            event.preventDefault();

            return;
        }

        // This is Safari/IE/Edge fallback
        // wether you are scrolling vertical so we have to hide default behavior of reload browser.
        if (
            vertical &&
            ((negative && !canScroll(target, currentTarget, true, false)) ||
                (!negative && !canScroll(target, currentTarget, true, true)))
        ) {
            event.preventDefault();

            return;
        }

        // wether you are scrolling !vertical so we have to prevent default behavior of scroll browser.
        if (
            !vertical &&
            ((negative && !canScroll(target, currentTarget, false, false)) ||
                (!negative && !canScroll(target, currentTarget, false, true)))
        ) {
            event.preventDefault();
        }
    }

    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
}
