import { ElementRef, inject, InjectionToken, Provider } from '@angular/core';
import { LOADED } from './loaded.token';
import { fromEvent, merge, Observable, tap, from, take } from 'rxjs';
import { endWith, filter, map, mapTo, scan, switchMap, takeUntil } from 'rxjs/operators';
import { Platform } from '@angular/cdk/platform';
import { elementIsVisibleInViewport } from '@msg91/utils';

// minor offset from top 0.000001
export const MICRO_OFFSET = 10 ** -6;
// distance is use as check point to check pulled success.
export const PULLED_DISTANCE = 70;

/** InjectionToken that will be injected into our component  */
export const PULLING = new InjectionToken<Observable<number>>('Stream that emits content pulling');

/**
 * When component injects PULLING token, pullingFactory will be called with DI entities from deps array as arguments.
 * LOADED stream that we provide in our MobilePullToRefreshComponent. It emits when loading after pulling finished.
 * ElementRef of the component
 * pullingFactory is decision maker wether it will pulled or not.
 */
export const PULL_TO_REFRESH_PROVIDERS: Provider[] = [
    {
        provide: PULLING,
        deps: [LOADED, ElementRef],
        useFactory: pullingFactory,
    },
];

/**
 * Use as factory, how much user pulled from render pull-to-refresh-check-point component.
 *
 * @param {Observable<unknown>} loaded$
 * @param { nativeElement } nativeElement element reference of MobilePullToRefreshComponent
 * @returns {Observable<number>} how much pulled.
 */
export function pullingFactory(
    loaded$: Observable<unknown>,
    { nativeElement }: ElementRef<HTMLElement>
): Observable<number> {
    const isIos = inject(Platform);
    /** element is in view port or not. */
    let isElementExist: boolean = false;
    /** find element added by directive with in MobilePullToRefreshComponent component to proceed further */
    const furtherProcess = () =>
        from(elementIsVisibleInViewport(nativeElement.getElementsByClassName('pull-to-refresh-check-point')?.[0], 200))
            .pipe(take(1))
            .subscribe((isExist) => (isElementExist = isExist));
    return merge(
        fromEvent(nativeElement, 'touchstart').pipe(
            tap((p) => furtherProcess()),
            // filter(() => nativeElement.scrollTop === 0 && window.scrollY === 0),
            switchMap((touchStart: TouchEvent) =>
                /**
                 * We switch it to touchmove and just find the difference between the start event clientY and
                 * current that is pulling distance. We’ll take it until the first touchend with 0 as last emit.
                 */
                fromEvent(nativeElement, 'touchmove').pipe(
                    filter(() => isElementExist),
                    map((touchMove: TouchEvent) => touchMove.touches[0].clientY - touchStart.touches[0].clientY),
                    takeUntil(fromEvent(nativeElement, 'touchend')),
                    endWith(0)
                )
            )
        ),
        loaded$.pipe(mapTo(NaN)) // It is a kind of reset value after refresh
    ).pipe(
        scan((max, current) => {
            if (isNaN(current)) {
                return 0;
            }
            /**
             * Here we determine a moment when the user pulled longer than PULLED_DISTANCE and
             * current distance is 0 that means that touchend happened with pulled loader and
             * it is time to start loading and we return PULLED_DISTANCE constant to fix this
             * state until loading (if NaN was emitted).
             * Otherwise, we just return the current offset plus MICRO_OFFSET. We need it to prevent
             * a situation when the current offset will be equal PULLED_DISTANCE and it can be
             * mistaken for androidLoading stage.
             */
            const androidLoading = !isIos.IOS && max === PULLED_DISTANCE;
            const dropped = current === 0 && max > PULLED_DISTANCE;

            return androidLoading || dropped ? PULLED_DISTANCE : current + MICRO_OFFSET;
        }, 0)
    );
}
