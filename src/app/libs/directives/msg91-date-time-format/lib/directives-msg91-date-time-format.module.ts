import { NgModule, Directive, ElementRef, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTooltip } from '@angular/material/tooltip';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as customParseFormat from 'dayjs/plugin/utc';
import { TooltipPosition } from '@angular/material/tooltip';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

@Directive({
    selector: '[msg91DateTimeFormat]',
    providers: [MatTooltip, DatePipe],
})
export class DateTimeFormatDirective implements OnChanges {
    public dateTimeTooltip: string = null;
    @Input() date: string;
    @Input() utcTimeZone: boolean = false;
    @Input() customTimeZone: string = null;
    @Input() formatWithoutTime: boolean;
    @Input() currentDateFormat: string;
    @Input() desiredDateFormat: string;
    @Input() showTooltip: boolean = true;
    @Input() fullDateTime: boolean = false;
    @Input() showTimeOnly: boolean = false;
    @Input() tooltipPosition: TooltipPosition = 'above';

    constructor(
        private el: ElementRef,
        private tooltip: MatTooltip,
        private datePipe: DatePipe
    ) {}

    @HostListener('mouseenter') onMouseEnter() {
        if (this.dateTimeTooltip && this.showTooltip) {
            this.tooltip.message = this.dateTimeTooltip;
            this.tooltip.position = this.tooltipPosition;
            this.tooltip.show();
        }
    }

    @HostListener('mouseleave') mouseleave() {
        this.tooltip.hide();
    }

    public ngOnChanges(change: SimpleChanges): void {
        if (change?.date || change?.customTimeZone) {
            if (!this.date || this.date === 'null') {
                this.el.nativeElement.innerHTML = '-';
                return;
            }

            // extra support for safari older versions
            let userAgentString = navigator.userAgent;
            let chromeAgent = userAgentString.indexOf('Chrome') > -1;
            let safariAgent = userAgentString.indexOf('Safari') > -1;
            if (chromeAgent && safariAgent) safariAgent = false;
            if (safariAgent && typeof this.date === 'string') {
                this.date = this.date?.replace(' ', 'T');
            }

            let finalContentToShow = null;
            let timeFormat24: boolean = true; // check system time format
            if (this.customTimeZone) {
                this.date = this.datePipe.transform(new Date(this.date), 'MMM d y h:mm:ss a', this.customTimeZone);
            }
            const timeFormat = `${timeFormat24 ? 'HH:mm' : 'hh:mm A'}`;
            let tooltipTimeFormat = `${timeFormat24 ? 'HH:mm:ss' : 'hh:mm:ss A'}`;
            const formattedDate = this.utcTimeZone
                ? dayjs.utc(this.date).local()
                : this.currentDateFormat
                  ? dayjs(this.date, this.currentDateFormat)
                  : dayjs(this.date);
            if (!this.formatWithoutTime) {
                this.dateTimeTooltip = formattedDate.format(`DD MMM YYYY, ${tooltipTimeFormat}`);
                finalContentToShow = this.getFormattedContent(formattedDate, timeFormat);
            } else {
                this.dateTimeTooltip = formattedDate.format(`DD MMM YYYY`);
                this.date = dayjs(this.date, this.currentDateFormat ?? 'YYYY-MM-DD').format(
                    `${this.desiredDateFormat ?? 'YYYY-MM-DD'}`
                );
                finalContentToShow = this.getFormattedContent(formattedDate);
            }
            this.el.nativeElement.innerHTML = this.date
                ? this.fullDateTime
                    ? this.dateTimeTooltip
                    : finalContentToShow
                : '-';
            if (this.showTimeOnly) {
                this.dateTimeTooltip = formattedDate.format(tooltipTimeFormat);
                this.el.nativeElement.innerHTML = this.dateTimeTooltip;
            }
        }
    }

    private getFormattedContent(formattedDate: dayjs.Dayjs, timeFormat?: string): string {
        let finalContentToShow;
        if (dayjs(this.dateTimeTooltip).isSame(dayjs(new Date()), 'day')) {
            // same day
            finalContentToShow = timeFormat ? formattedDate.format(timeFormat) : formattedDate.format(`DD MMM`);
        } else if (dayjs(this.dateTimeTooltip).isSame(dayjs(new Date()), 'year')) {
            // same year
            finalContentToShow = formattedDate.format(`DD MMM`);
        } else {
            finalContentToShow = formattedDate.format(`DD MMM YY`);
        }
        return finalContentToShow;
    }
}

@NgModule({
    imports: [CommonModule, MatTooltipModule],
    declarations: [DateTimeFormatDirective],
    exports: [DateTimeFormatDirective],
})
export class DirectivesMsg91DateTimeFormatModule {}
