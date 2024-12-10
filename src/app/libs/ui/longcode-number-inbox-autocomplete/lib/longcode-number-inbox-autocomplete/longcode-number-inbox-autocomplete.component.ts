import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { FormControl, ValidatorFn } from '@angular/forms';
import { PrimeNgToastService } from '@msg91/ui/prime-ng-toast';
import { BehaviorSubject, fromEvent, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, take, takeUntil, tap } from 'rxjs/operators';
import { BaseComponent } from '@msg91/ui/base-component';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { isEqual } from 'lodash';
import { ComposeService } from '@msg91/services/msg91/compose';
import { ILongCodeNumberResModel } from '@msg91/models/numbers-models';
import { CustomValidators } from '@msg91/custom-validator';

@Component({
    selector: 'msg91-longcode-number-inbox-autocomplete',
    templateUrl: './longcode-number-inbox-autocomplete.component.html',
})
export class LongcodeNumberInboxAutocompleteComponent
    extends BaseComponent
    implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
    @Input() longcodeNumberFormControl: FormControl;
    @Input() clearFilter: boolean;
    @Input() appearance = 'outline';
    @Input() permittedNumbers: Array<string>;
    @Input() labelFloat: boolean = true;

    @Output() fetchNumberListInprogress: EventEmitter<any> = new EventEmitter();
    @Output() getSelectedNumber: EventEmitter<any> = new EventEmitter();
    @Output() clearNumberValue: EventEmitter<any> = new EventEmitter();

    @ViewChild('longcodeNumberInputRef') public longcodeNumberInputRef: ElementRef;
    @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;

    public numbers$: Observable<ILongCodeNumberResModel[]> = of([]);
    public searchedNumber$: Observable<ILongCodeNumberResModel[]> = of([]);
    public numbers: ILongCodeNumberResModel[] = [];
    public showCloseNumber: boolean = false;
    public searchedNumber: string = '';
    public apiInProgress: boolean = false;
    public apiInProgress$ = of(false);
    public permittedNumberObject;
    public existInListValidatorFn: ValidatorFn;
    public noIntegrationFound = new BehaviorSubject<boolean>(false);

    constructor(
        private composeService: ComposeService,
        private cdr: ChangeDetectorRef,
        private toast: PrimeNgToastService
    ) {
        super();
    }

    ngAfterViewInit() {
        fromEvent(this.longcodeNumberInputRef.nativeElement, 'input')
            .pipe(
                tap((event: any) => {
                    if (event?.target?.value) {
                        this.showCloseNumber = true;
                    } else {
                        this.showCloseNumber = false;
                    }
                }),
                debounceTime(700),
                takeUntil(this.destroy$)
            )
            .subscribe((event: any) => {
                this.searchedNumber = event?.target?.value;
                this.numberList();
            });
    }

    ngOnInit(): void {
        this.fetchLongcodeNumbers();
        this.numbers$.pipe(distinctUntilChanged(isEqual), takeUntil(this.destroy$)).subscribe((res) => {
            this.numbers = res;
        });
    }

    public ngOnDestroy(): void {
        if (this.existInListValidatorFn) {
            this.longcodeNumberFormControl.removeValidators(this.existInListValidatorFn);
        }
        super.ngOnDestroy();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes) {
            if (this.clearFilter) {
                this.clearNumber();
            }
            if (changes.permittedNumbers?.currentValue) {
                this.findPermittedNumbers();
            }
        }
    }

    private numberList(): void {
        this.numbers$.pipe(take(1)).subscribe((res) => {
            const longcodeNumbers = res?.filter((number) => number.longcode_number.includes(this.searchedNumber));
            this.searchedNumber$ = of(longcodeNumbers);
            this.cdr.detectChanges();
        });
    }

    /**
     * Select Number
     */
    public selectNumber(): void {
        if (this.longcodeNumberFormControl.value) {
            this.showCloseNumber = true;
        }
        const selectedNumber = this.numbers.find((e) => e.longcode_number === this.longcodeNumberFormControl?.value);
        if (selectedNumber) {
            this.getSelectedNumber.emit(selectedNumber);
        }
    }

    public numberDisplayFunction(number: ILongCodeNumberResModel): string {
        return number?.longcode_number;
    }

    public refreshNumber(): void {
        this.numbers = [];
        this.fetchLongcodeNumbers();
    }

    public clearNumber(): void {
        this.numbers = [];
        this.showCloseNumber = false;
        this.searchedNumber = '';
        this.longcodeNumberFormControl.patchValue('');
        this.fetchLongcodeNumbers();
        this.clearNumberValue.emit();
    }

    public setControlValue(event: any): void {
        if (!this.longcodeNumberFormControl.value) {
            this.longcodeNumberFormControl.setValue(event);
            this.longcodeNumberFormControl.markAsDirty();
            this.selectNumber();
        }
    }

    private fetchLongcodeNumbers(): void {
        if (this.apiInProgress) {
            return;
        }
        this.apiInProgress = true;
        this.fetchNumberListInprogress.emit(true);
        this.apiInProgress$ = of(true);
        this.composeService.getLongcodeNumberIntegrationDetails().subscribe(
            (response) => {
                const longCodeNumbers = response?.data?.numbers_integrations?.filter(
                    (number) => number.type === 'sms' || number.type === 'both'
                );
                this.numbers$ = of(longCodeNumbers);
                this.numbers = longCodeNumbers;
                if (this.permittedNumbers) {
                    this.findPermittedNumbers();
                }
                this.numberList();
                this.setExistInListValidator();
                this.fetchNumberListInprogress.emit(false);
                this.apiInProgress$ = of(false);
                this.selectNumber();
                this.apiInProgress = false;
            },
            (error) => {
                this.fetchNumberListInprogress.emit(false);
                this.apiInProgress$ = of(false);
                this.toast.error(error?.errors[0] || error?.message);
                this.apiInProgress = false;
            }
        );
    }

    private findPermittedNumbers(): void {
        this.permittedNumberObject = {};
        this.permittedNumbers.forEach((number) => {
            const longCodeNumber = this.numbers.find((lcNumber) => lcNumber.longcode_number === number);
            if (longCodeNumber) {
                this.permittedNumberObject[longCodeNumber?.longcode_number] = true;
            }
        });
    }

    private setExistInListValidator(): void {
        if (this.existInListValidatorFn) {
            this.longcodeNumberFormControl.removeValidators(this.existInListValidatorFn);
        }
        const numberList =
            (this.permittedNumbers
                ? this.numbers
                      ?.filter((obj) => obj?.longcode_number && this.permittedNumberObject[obj?.longcode_number])
                      ?.map((obj) => obj?.longcode_number)
                : this.numbers?.map((obj) => obj?.longcode_number)) || [];
        if (!numberList?.length) {
            this.noIntegrationFound.next(true);
        }
        this.existInListValidatorFn = CustomValidators.elementExistsInList(numberList, 'longcode_number');
        this.longcodeNumberFormControl.addValidators(this.existInListValidatorFn);
    }
}
