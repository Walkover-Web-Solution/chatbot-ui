import { animate, style, transition, trigger } from '@angular/animations';

export const fadeInOut = trigger('fadeInOut', [
    transition(':enter', [style({ opacity: 0 }), animate(250)]),
    transition('* => void', [
        animate(
            250,
            style({
                opacity: 0,
            })
        ),
    ]),
]);
export const fadeIn = trigger('fadeIn', [
    transition(':enter', [style({ opacity: 0 }), animate(250)]),
    transition('* => void', [
        animate(
            250,
            style({
                opacity: 0,
            })
        ),
    ]),
]);

export const fadeInRight = trigger('fadeInRight', [
    transition(':enter', [style({ opacity: 0, right: -200 }), animate(350)]),
    // transition(':leave', [
    //   style({ opacity: 0, right: -100 }),
    //   animate(1)
    // ])
]);

export const fadeInLeft = trigger('fadeInLeft', [
    transition(':enter', [style({ opacity: 0, left: -200 }), animate(350)]),
    // transition(':leave', [
    //   style({ opacity: 0, left: -100 }),
    //   animate(1)
    // ])
]);
