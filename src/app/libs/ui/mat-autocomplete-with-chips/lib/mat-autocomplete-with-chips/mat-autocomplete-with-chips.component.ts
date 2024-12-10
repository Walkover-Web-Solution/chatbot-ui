import { Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BaseComponent } from '@msg91/ui/base-component';
import { BehaviorSubject, map, Observable, startWith } from 'rxjs';

@Component({
    selector: 'msg91-mat-autocomplete-with-chips',
    templateUrl: './mat-autocomplete-with-chips.component.html',
    styleUrls: ['./mat-autocomplete-with-chips.component.scss'],
})
export class MatAutocompleteWithChipsComponent extends BaseComponent {
    @ViewChild('input') input: ElementRef<HTMLInputElement>;

    @Input('appearance') appearance = 'outline';
    @Input('label') label: string;
    @Input('placeholder') placeholder: string;
    /** Form control  */
    @Input('control') control: FormControl;
    /** Options array, that are used in mat-auto complete */
    @Input('options') options: any[];
    /** Key to use show in ui for select */
    @Input('keyToUseShowOnOption') keyToUseShowOnOption: string;
    /** Keys value is used to add in control */
    @Input('keyToUseAsValue') keyToUseAsValue: string;

    protected filteredOptions$: Observable<any>;

    protected selectedOptions$: BehaviorSubject<any> = new BehaviorSubject([]);

    protected matChipFormControl: FormControl = new FormControl(null);

    constructor() {
        super();
        this.filteredOptions$ = this.matChipFormControl.valueChanges.pipe(
            startWith(null),
            map((value: string | null) => {
                return value ? this._filter(value) : this.options.slice();
            })
        );
    }

    ngOnInit() {}

    ngOnChanges(changes: SimpleChanges) {
        if (this.control && this.options) {
            const selectedOptionValue = [];
            this.control?.value?.forEach((value: any) => {
                const findOption = this.options.find(
                    (option: any) => (this.keyToUseAsValue ? option[this.keyToUseAsValue] : option) === value
                );
                if (findOption) {
                    selectedOptionValue.push(findOption);
                }
            });
            this.selectedOptions$.next(selectedOptionValue);
        }
    }

    ngOnDestroy() {
        this.selectedOptions$.next([]);
        super.ngOnDestroy();
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.options.filter((option: any) => {
            return (this.keyToUseShowOnOption ? option[this.keyToUseShowOnOption] : option)
                ?.toLowerCase()
                .includes(filterValue);
        });
    }

    setSelectedOptionsOnChanges(): void {
        console.log(event);
    }

    protected optionClicked(event: any, data) {
        event.stopPropagation();
        this.input.nativeElement.value = '';
        this.matChipFormControl.setValue(null);
        this.toggleSelection(data);
    }

    protected toggleSelection(data: any): void {
        const valueToCheck = this.keyToUseAsValue ? data[this.keyToUseAsValue] : data;
        const index = this.control.value?.findIndex((value) => value === valueToCheck);
        if (index > -1) {
            const selectedOptionValue = [...this.selectedOptions$.getValue()];
            selectedOptionValue.splice(index, 1);
            this.selectedOptions$.next(selectedOptionValue);
            const newControlValue = [...this.control.value];
            newControlValue?.splice(index, 1);
            this.control.patchValue(newControlValue);
        } else {
            const selectedOptionValue = this.selectedOptions$.getValue();
            this.selectedOptions$.next([...selectedOptionValue, data]);
            const newControlValue = [...(!this.control.value ? [] : this.control.value), valueToCheck];
            this.control.patchValue(newControlValue);
        }
        this.control.updateValueAndValidity();
    }
}
