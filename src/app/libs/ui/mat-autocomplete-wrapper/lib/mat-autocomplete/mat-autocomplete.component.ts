import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { fromEvent } from 'rxjs';
import { debounceTime, filter, take, takeUntil } from 'rxjs/operators';
import { BaseComponent } from '@msg91/ui/base-component';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { cloneDeep } from 'lodash-es';
import { CustomValidators } from '@msg91/custom-validator';

@Component({
    selector: 'msg91-mat-autocomplete',
    templateUrl: './mat-autocomplete.component.html',
    styleUrls: ['./mat-autocomplete.component.scss'],
})
export class MatAutocompleteComponent extends BaseComponent implements OnInit, AfterViewInit, OnChanges {
    @ViewChild('autoCompleteInput') public autoCompleteInput: ElementRef;
    @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
    @Input() matFormControl: FormControl;
    @Input() appearance = 'outline';
    @Input() labelFloat: boolean = true;
    @Input() optionsList: any[] = [];
    @Input() filteredKey: string;
    @Input() fieldName: string;
    @Input() disabledField: boolean = false;
    @Input() useAutoSelect: boolean = true;
    /** True if entire object needs to be emitted on selection */
    @Input() emitEntireObjectAsValue: boolean;
    /** Required when a different key than 'filteredKey' should be used for validation (when objects are involved) */
    @Input() customKeyForValidation: string;
    @Input() showAddFeatureButton: boolean = false;
    @Input() featureButtonContent: string = '';
    @Input() shouldGroupOptions: boolean = false;
    @Input() groupByKeys: any[] = [];
    @Input() isRequired: boolean = true;
    @Output() addButtonEventTrigger: EventEmitter<any> = new EventEmitter();
    @Output() getSelectedValue: EventEmitter<any> = new EventEmitter();
    public filteredList: any[] = [];

    constructor() {
        super();
    }

    public ngOnInit(): void {
        this.matFormControl.valueChanges
            .pipe(
                filter((e) => e),
                take(1)
            )
            .subscribe((res) => {
                this.filteredList = cloneDeep(this.optionsList)?.filter((e) =>
                    e[this.filteredKey]
                        ?.toLowerCase()
                        ?.includes(
                            this.emitEntireObjectAsValue ? res[this.filteredKey]?.toLowerCase() : res?.toLowerCase()
                        )
                );
                this.updateValidations();
            });
    }

    public ngAfterViewInit() {
        fromEvent(this.autoCompleteInput.nativeElement, 'input')
            .pipe(debounceTime(700), takeUntil(this.destroy$))
            .subscribe((event: any) => {
                this.filteredList = cloneDeep(this.optionsList)?.filter((e) =>
                    e[this.filteredKey]?.toLowerCase()?.includes(event?.target?.value?.toLowerCase())
                );
                this.updateValidations();
            });
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes?.optionsList && this.optionsList?.length) {
            this.filteredList = cloneDeep(this.optionsList);
            this.updateValidations();
        }
        if (changes?.matFormControl && this.matFormControl?.value && this.optionsList?.length) {
            this.filteredList = cloneDeep(this.optionsList)?.filter((e) =>
                e[this.filteredKey]
                    ?.toLowerCase()
                    ?.includes(
                        this.emitEntireObjectAsValue
                            ? this.matFormControl.value?.[this.filteredKey]?.toLowerCase()
                            : this.matFormControl.value?.toLowerCase()
                    )
            );
            this.updateValidations();
        }

        if (changes.disabledField) {
            if (this.disabledField) {
                this.matFormControl.disable();
                this.matFormControl.updateValueAndValidity();
            } else {
                this.matFormControl.enable();
                this.matFormControl.updateValueAndValidity();
            }
        }

        if (changes?.isRequired) {
            this.updateValidations();
        }
    }

    public setControlValue(event): void {
        if (this.useAutoSelect) {
            this.matFormControl.setValue(event);
            this.matFormControl.markAsDirty();
            this.selectOption();
        }
    }

    public selectOption(): void {
        this.getSelectedValue.emit(this.matFormControl.value);
    }

    public clearValue(): void {
        this.getSelectedValue.emit(null);
        this.matFormControl.setValue(null);
        this.filteredList = cloneDeep(this.optionsList);
        this.updateValidations();
    }

    public displayFunction = (option: any): string => {
        return this.emitEntireObjectAsValue ? option?.name : option;
    };

    private updateValidations(): void {
        if (this.isRequired) {
            this.matFormControl.setValidators([
                Validators.required,
                CustomValidators.elementExistsInList(
                    this.filteredList?.map((e) => e[this.customKeyForValidation ?? this.filteredKey]),
                    this.customKeyForValidation ?? null
                ),
            ]);
        } else {
            this.matFormControl.setValidators([
                CustomValidators.elementExistsInList(
                    this.filteredList?.map((e) => e[this.customKeyForValidation ?? this.filteredKey]),
                    this.customKeyForValidation ?? null
                ),
            ]);
        }
        this.matFormControl.updateValueAndValidity();
    }
}
