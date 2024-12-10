import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DateRange, MatCalendar } from '@angular/material/datepicker';
import { MatMenuTrigger } from '@angular/material/menu';
import { JS_START_DATE, SelectDateRange } from '@msg91/constant';
import { DATE_FORMAT_REGEX } from '@msg91/regex';
import * as dayjs from 'dayjs';
import * as quarterOfYear from 'dayjs/plugin/quarterOfYear';
import * as advancedFormat from 'dayjs/plugin/advancedFormat';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import { cloneDeep, isEqual } from 'lodash-es';
import { Subject } from 'rxjs';
dayjs.extend(quarterOfYear);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

@Component({
    selector: 'date-range-picker',
    templateUrl: './date-range-picker.component.html',
    styleUrls: ['./date-range-picker.component.scss'],
    host: {
        '(window:resize)': 'onResize($event)',
    },
})
export class DateRangePickerComponent implements OnInit, OnChanges, OnDestroy {
    @ViewChild('calendar', { static: false }) calendar: MatCalendar<Date>;
    @ViewChild('trigger') trigger: MatMenuTrigger;
    @Input() selectedRangeValue: DateRange<Date> | undefined;
    @Input() placeholder = 'Date Range';
    @Input() selectedDefaultDateRange: SelectDateRange = null;
    @Output() selectedRangeValueChange: any = new EventEmitter<DateRange<Date>>();
    @Output() menuClosedEvent = new EventEmitter<boolean>();
    @Output() resetDateRange = new EventEmitter<boolean>();
    @Input() floatLabelBackground: string = 'var(--color-common-white)';
    @Input() minDate: Date = JS_START_DATE;
    @Input() public customOptionActive: boolean = true;
    @Input() public openMenu: boolean = false;
    @Input() public cssClass: string = '';
    @Input() public applyMinDate: boolean = false;
    /** Disables the date range validations, required for scenarios where infinte date is allowed */
    @Input() public disableDateValidations: boolean;
    @Input() public maxDate: Date = new Date();
    private _destroy$: Subject<any>;
    public showRangePicker: boolean = false;
    public range = new FormGroup({
        start: new FormControl(''),
        end: new FormControl(''),
    });
    public today: Date = new Date();
    public startDate: any;
    public endDate: any;
    public selectedDateValue: string;
    public calenderDateRange: DateRange<Date>;
    public monthSelected: 'current' | 'last' | null = null;
    public quarterSelected: 'current' | 'last' | null = null;
    public innerWidth: number;
    public initialSelectedDateRange: DateRange<Date> | undefined;
    public selectedDateIsGreaterThanToday: boolean = false;
    public selectedDateIsSmallerThanMinDate: boolean = false;
    private rangeValue: { start: null | Date; end: null | Date } = {
        start: null,
        end: null,
    };
    public ngOnInit(): void {
        if (!this.disableDateValidations) {
            this.range.get('start').setValidators([Validators.required, Validators.pattern(DATE_FORMAT_REGEX)]);
            this.range.get('end').setValidators([Validators.required, Validators.pattern(DATE_FORMAT_REGEX)]);
            this.range.updateValueAndValidity();
        }
        if (!this.disableDateValidations && (!this.selectedRangeValue || !this.selectedRangeValue.start)) {
            this.setDateRange(dayjs(), dayjs());
            this.selectedDateValue = 'Select Date Range';
        } else if (this.disableDateValidations && !this.selectedRangeValue.start && !this.selectedRangeValue.end) {
            this.selectedDateValue = 'Select Date Range';
        }
        this.innerWidth = window.innerWidth;
        this.initialSelectedDateRange = cloneDeep(this.selectedRangeValue);
        if (this.applyMinDate) {
            this.range.disable();
        }
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes?.selectedDefaultDateRange) {
            switch (this.selectedDefaultDateRange) {
                case SelectDateRange.CurrentMonth:
                    this.selectThisMonth();
                    break;
                case SelectDateRange.PreviousMonth:
                    this.selectLastMonth();
                    break;
                case SelectDateRange.CurrentQuarter:
                    this.selectThisQuarter();
                    break;
                case SelectDateRange.PreviousQuarter:
                    this.selectLastQuarter();
                    break;
                default:
                    break;
            }
        }
        if (
            changes?.selectedRangeValue &&
            !isEqual(changes?.selectedRangeValue.currentValue, changes?.selectedRangeValue.previousValue)
        ) {
            const startTime = new Date(dayjs(this.selectedRangeValue.start).format('YYYY-MM-DD')).getTime();
            const endTime = new Date(dayjs(this.selectedRangeValue.end).format('YYYY-MM-DD')).getTime();
            this.monthSelected = null;
            this.quarterSelected = null;
            this.setInputDate();
            if (new Date(this.selectedRangeValue.start).getDate() !== 1) {
                return;
            }
            const startDate = dayjs().clone().startOf('month').format('YYYY-MM-DD');
            const endDate = dayjs().format('YYYY-MM-DD');
            if (startTime === new Date(startDate).getTime() && endTime === new Date(endDate).getTime()) {
                this.monthSelected = 'current';
                this.quarterSelected = null;
            } else {
                const previousMonth = dayjs().subtract(1, 'month').clone();
                const previousMonthStart = dayjs(cloneDeep(previousMonth).startOf('month')).format('YYYY-MM-DD');
                const previousMonthEnd = dayjs(cloneDeep(previousMonth).endOf('month')).format('YYYY-MM-DD');
                if (
                    startTime === new Date(previousMonthStart).getTime() &&
                    endTime === new Date(previousMonthEnd).getTime()
                ) {
                    this.monthSelected = 'last';
                    this.quarterSelected = null;
                } else {
                    const quarterStart = dayjs().quarter(dayjs().quarter()).startOf('quarter').format('YYYY-MM-DD');
                    const quarterEnd = dayjs().format('YYYY-MM-DD');
                    if (startTime === new Date(quarterStart).getTime() && endTime === new Date(quarterEnd).getTime()) {
                        this.quarterSelected = 'current';
                        this.monthSelected = null;
                    } else {
                        const previousQuarter = dayjs().quarter(dayjs().quarter()).subtract(1, 'quarter');
                        const previousQuarterStart = dayjs(cloneDeep(previousQuarter).startOf('quarter')).format(
                            'YYYY-MM-DD'
                        );
                        const previousQuarterEnd = dayjs(cloneDeep(previousQuarter).endOf('quarter')).format(
                            'YYYY-MM-DD'
                        );
                        if (
                            startTime === new Date(previousQuarterStart).getTime() &&
                            endTime === new Date(previousQuarterEnd).getTime()
                        ) {
                            this.quarterSelected = 'last';
                            this.monthSelected = null;
                        }
                    }
                }
            }
        }
        if (changes && changes['openMenu']?.currentValue) {
            this.trigger?.openMenu();
        }
    }

    public ngOnDestroy(): void {
        if (this._destroy$) {
            this._destroy$.next(true);
            this._destroy$.complete();
        }
    }

    public onResize(event): void {
        this.innerWidth = event.target.innerWidth;
    }

    public setInputDate(): void {
        if (this.disableDateValidations) {
            this.calenderDateRange = cloneDeep(this.selectedRangeValue);
        } else {
            this.calenderDateRange =
                this.selectedRangeValue && this.selectedRangeValue.start
                    ? cloneDeep(this.selectedRangeValue)
                    : new DateRange<Date>(new Date(), new Date());
        }
        this.setDateRange(this.calenderDateRange.start, this.calenderDateRange.end);
        if (!this.disableDateValidations) {
            if (this.selectedRangeValue && this.selectedRangeValue.start) {
                this.selectedDateValue =
                    dayjs(this.calenderDateRange.start).format('Do MMM YY') +
                    ' - ' +
                    dayjs(this.calenderDateRange.end).format('Do MMM YY');
            } else {
                this.selectedDateValue = 'Select Date Range';
            }
        } else {
            if (this.calenderDateRange.start || this.calenderDateRange.end) {
                this.selectedDateValue =
                    (this.calenderDateRange.start
                        ? dayjs(this.calenderDateRange.start).format('Do MMM YY')
                        : 'No Date Selected') +
                    ' - ' +
                    (this.calenderDateRange.end
                        ? dayjs(this.calenderDateRange.end).format('Do MMM YY')
                        : 'No Date Selected');
            } else {
                this.selectedDateValue = 'Select Date Range';
            }
        }
        if (this.calendar && this.calenderDateRange.start) {
            this.calendar._goToDateInView(new Date(this.calenderDateRange.start), 'month');
        }
    }

    public selectedChange(m: any): void {
        this.resetErrorState();
        let start, end;
        if (this.rangeValue.start && this.rangeValue.end) {
            this.rangeValue = {
                start: null,
                end: null,
            };
        }

        this.monthSelected = null;
        this.quarterSelected = null;

        if (!this.rangeValue.start && !this.rangeValue.end) {
            this.rangeValue.start = m;
            start = this.rangeValue.start;
            end = this.calenderDateRange?.end;
            if (start > end) {
                const temp = start;
                start = end;
                end = temp;
            }
        } else if (this.rangeValue.start && !this.rangeValue.end) {
            this.rangeValue.end = m;
            start = this.rangeValue.start;
            end = this.rangeValue.end;
            if (start > end) {
                const temp = start;
                start = end;
                end = temp;
            }
        }
        this.calenderDateRange = new DateRange<Date>(end, start);
        this.setDateRange(start, end);
        // if (!this.calenderDateRange?.start || this.calenderDateRange?.end) {
        //     this.calenderDateRange = new DateRange<Date>(m, null);
        // } else {
        //     const start = this.calenderDateRange.start;
        //     const end = m;
        //     if (end < start) {
        //         this.calenderDateRange = new DateRange<Date>(end, start);
        //         this.setDateRange(end, start);
        //     } else {
        //         this.calenderDateRange = new DateRange<Date>(start, end);
        //         this.setDateRange(start, end);
        //     }
        // }
    }

    public toggleRangePicker() {
        this.showRangePicker = !this.showRangePicker;
        this.monthSelected = null;
    }

    public selectThisMonth(): void {
        const start = dayjs().clone().startOf('month');
        const end = dayjs();
        this.monthSelected = 'current';
        this.quarterSelected = null;
        this.setDateRange(start, end);
        // For mobile view
        if (this.innerWidth <= 600) {
            this.applyDateRange();
        }
    }

    public selectLastMonth(): void {
        const previousMonth = dayjs().subtract(1, 'month').clone();
        const start = cloneDeep(previousMonth).startOf('month');
        const end = cloneDeep(previousMonth).endOf('month');
        this.monthSelected = 'last';
        this.quarterSelected = null;
        this.setDateRange(start, end);
        // For mobile view
        if (this.innerWidth <= 600) {
            this.applyDateRange();
        }
    }

    public selectThisQuarter(): void {
        const start = dayjs().quarter(dayjs().quarter()).startOf('quarter');
        const end = dayjs();
        this.quarterSelected = 'current';
        this.monthSelected = null;
        this.setDateRange(start, end);
        // For mobile view
        if (this.innerWidth <= 600) {
            this.applyDateRange();
        }
    }

    public selectLastQuarter(): void {
        const previousQuarter = dayjs().quarter(dayjs().quarter()).subtract(1, 'quarter');
        const start = cloneDeep(previousQuarter).startOf('quarter');
        const end = cloneDeep(previousQuarter).endOf('quarter');
        this.quarterSelected = 'last';
        this.monthSelected = null;
        this.setDateRange(start, end);
        // For mobile view
        if (this.innerWidth <= 600) {
            this.applyDateRange();
        }
    }

    private setDateRange(start, end): void {
        this.calenderDateRange = new DateRange<Date | null>(start ? new Date(start) : null, end ? new Date(end) : null);
        this.startDate = start ? dayjs(start).format('YYYY-MM-DD') : null;
        this.endDate = end ? dayjs(end).format('YYYY-MM-DD') : null;
        this.range.patchValue({
            start: start ? dayjs(start).format('DD/MM/YYYY') : null,
            end: end ? dayjs(end).format('DD/MM/YYYY') : null,
        });
        if (this.calendar && this.startDate) {
            this.calendar._goToDateInView(new Date(this.startDate), 'month');
        }
    }

    public applyDateRange(): void {
        if (!this.disableDateValidations) {
            if (!this.calenderDateRange.end && this.calenderDateRange.start) {
                this.calenderDateRange = new DateRange<Date>(
                    new Date(this.calenderDateRange.start),
                    new Date(this.calenderDateRange.start)
                );
            }
            if (!this.calenderDateRange.start && this.calenderDateRange.end) {
                this.calenderDateRange = new DateRange<Date>(
                    new Date(this.calenderDateRange.end),
                    new Date(this.calenderDateRange.end)
                );
            }
            this.selectedDateValue =
                dayjs(this.calenderDateRange.start).format('Do MMM YY') +
                ' - ' +
                dayjs(this.calenderDateRange.end).format('Do MMM YY');
        } else {
            if (this.calenderDateRange.start || this.calenderDateRange.end) {
                this.selectedDateValue =
                    (this.calenderDateRange.start
                        ? dayjs(this.calenderDateRange.start).format('Do MMM YY')
                        : 'No Date Selected') +
                    ' - ' +
                    (this.calenderDateRange.end
                        ? dayjs(this.calenderDateRange.end).format('Do MMM YY')
                        : 'No Date Selected');
            } else {
                this.selectedDateValue = 'Select Date Range';
            }
        }
        this.selectedRangeValue = cloneDeep(this.calenderDateRange);
        this.selectedRangeValueChange.emit(this.calenderDateRange);
        this.showRangePicker = false;
        this.trigger?.closeMenu();
    }

    public closeDialog(): void {
        this.trigger.closeMenu();
    }

    public resetDate(): void {
        this.selectedRangeValue = cloneDeep(this.initialSelectedDateRange);
        if (this.initialSelectedDateRange.start) {
            this.setInputDate();
            this.applyDateRange();
        } else {
            this.selectedDateValue = 'Select Date Range';
            this.selectedRangeValueChange.emit(this.selectedDateValue);
            this.showRangePicker = false;
            this.trigger.closeMenu();
        }
        this.resetDateRange.emit(true);
        this.monthSelected = null;
        this.quarterSelected = null;
    }

    public resetErrorState(): void {
        this.selectedDateIsGreaterThanToday = false;
        this.selectedDateIsSmallerThanMinDate = false;
    }

    public checkFromToDate(fromDateChange: boolean): void {
        this.resetErrorState();
        if (this.range.valid) {
            if (!this.disableDateValidations) {
                const startDateParts = this.range.value.start.split('/');
                const endDateParts = this.range.value.end.split('/');
                const startDate = new Date(`${startDateParts[1]}/${startDateParts[0]}/${startDateParts[2]}`);
                const endDate = new Date(`${endDateParts[1]}/${endDateParts[0]}/${endDateParts[2]}`);
                if (startDate > this.today || endDate > this.today) {
                    this.selectedDateIsGreaterThanToday = true;
                    return;
                }
                if (startDate < this.minDate || endDate < this.minDate || endDate < startDate) {
                    this.selectedDateIsSmallerThanMinDate = true;
                    return;
                }
                if (!dayjs(this.range.value.start, 'DD/MM/YYYY', true).isValid()) {
                    this.range.get('start').setErrors({ validFormat: true });
                    return;
                }
                if (!dayjs(this.range.value.end, 'DD/MM/YYYY', true).isValid()) {
                    this.range.get('end').setErrors({ validFormat: true });
                    return;
                }
                if (startDate < endDate) {
                    this.setDateRange(startDate, endDate);
                } else {
                    if (fromDateChange) {
                        this.setDateRange(startDate, startDate);
                    } else {
                        this.setDateRange(endDate, endDate);
                    }
                }
            } else {
                const startDateParts = this.range.value.start?.split('/') ?? [''];
                const endDateParts = this.range.value.end?.split('/') ?? [''];
                const startDate =
                    startDateParts?.length === 3
                        ? new Date(`${startDateParts[1]}/${startDateParts[0]}/${startDateParts[2]}`)
                        : null;
                const endDate =
                    endDateParts?.length === 3
                        ? new Date(`${endDateParts[1]}/${endDateParts[0]}/${endDateParts[2]}`)
                        : null;
                if (startDate < endDate) {
                    this.setDateRange(startDate, endDate);
                } else {
                    if (fromDateChange) {
                        this.setDateRange(startDate ?? endDate, startDate);
                    } else {
                        this.setDateRange(endDate ?? startDate, endDate);
                    }
                }
            }
        }
    }

    public menuClosed(): void {
        this.menuClosedEvent.emit(true);
    }
}
