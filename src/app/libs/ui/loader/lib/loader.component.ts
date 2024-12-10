import { Component, ElementRef, Input, OnDestroy } from '@angular/core';
import { BaseComponent } from '@msg91/ui/base-component';
import { CommonService } from 'src/app/services/common/common.service';
import { Subscription, takeUntil, timer } from 'rxjs';

@Component({
    selector: 'msg91-loader',
    template: `
        <div class="h-100 content-loader">
            <div class="loading-box">
                <mat-spinner></mat-spinner>
                <span>{{ message }}</span>
            </div>
        </div>
    `,
})
export class LoaderComponent extends BaseComponent implements OnDestroy {
    @Input() public message: string = 'Loading...';

    /** Hold subscription for each second */
    public timerSubscription: Subscription | undefined;
    /** Timer stay alive in seconds */
    public timerSec = 3;
    /** Remaining time while timer run */
    public timeRemain: number | undefined;

    constructor(
        private ref: ElementRef,
        private commonService: CommonService
    ) {
        super();
        this.startTimer();
    }

    ngOnInit() {
        this.commonService.removeLoader$.pipe(takeUntil(this.destroy$)).subscribe((response) => {
            if (response) {
                this.commonService.setRemoveLoader(false);
                this.timeRemain = 0;
                this.destroyTimerSubscription();
            }
        });
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public startTimer(): void {
        const source = timer(1000, 1000);
        this.timerSubscription = source.pipe(takeUntil(this.destroy$)).subscribe((val) => {
            this.timeRemain = this.timerSec - val;
            if (this.timeRemain === 0) {
                this.destroyTimerSubscription();
            }
        });
    }

    public destroyTimerSubscription(): void {
        this.timerSubscription?.unsubscribe();
        if (this.ref.nativeElement) {
            this.ref.nativeElement.remove();
        }
    }
}
