import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BaseComponent } from '@msg91/ui/base-component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Observable, of, pairwise, startWith } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UiComponentsSearchModule } from '@msg91/ui/search';
import { MAT_SELECT_CONFIG } from '@angular/material/select';

const Imports = [CommonModule, MatFormFieldModule, ReactiveFormsModule, MatSelectModule, UiComponentsSearchModule];

@Component({
    standalone: true,
    selector: 'msg91-mat-select',
    templateUrl: './msg91-mat-select.component.html',
    styleUrls: ['./msg91-mat-select.component.scss'],
    imports: Imports,
    providers: [
        {
            provide: MAT_SELECT_CONFIG,
            useValue: { overlayPanelClass: 'fixed-mat-select-panel' },
        },
    ],
})
export class Msg91MatSelectComponent extends BaseComponent implements OnChanges {
    @Input() control: FormControl;
    @Input() showLabel: boolean = false;
    @Input() labelText: string = '';
    @Input() options: any[];
    @Input() disableOptionCentering: boolean = true;
    @Input() placeholder: string;
    @Input() keyToUseShowLabel: string = 'name';
    @Input() keyToUseForValue: string = 'value';
    @Input() class: string | string[] = '';
    @Input() appearance: string = 'outline';
    @Input() showError: boolean = true;
    @Input() showErrorIntoMatFormField: boolean = true;
    @Input() controlErrorsMessage: { [key: string]: string } = {};
    @Input() withPreviousValueInOnChange: boolean = false;
    @Input() enableSearch: boolean = false;
    /**
     * set true withOutKey only if your options is array of string/number/boolean
     */
    @Input() searchSettings: {
        placeHolder: string;
        keyToLookUpInto: string;
        withOutKey: boolean;
    } = {
        placeHolder: 'Search ',
        keyToLookUpInto: 'name',
        withOutKey: false,
    };

    /** Emits the selected value when option changes */
    @Output() onChange: EventEmitter<any> = new EventEmitter();

    /** Control of holding search string. */
    protected searchControl: FormControl = new FormControl();
    /** Hold filtered options to show in mat select */
    protected filteredOptions: Observable<any[]> = of([]);

    constructor() {
        super();
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    ngOnChanges(simpleChanges: SimpleChanges) {
        if (simpleChanges.control?.currentValue && this.withPreviousValueInOnChange) {
            this.control.valueChanges
                .pipe(startWith(this.control.value), pairwise(), takeUntil(this.destroy$))
                .subscribe({
                    next: ([old, latest]: [any, any]) => {
                        this.onChange.emit({ latest, old });
                    },
                });
        }
        if (simpleChanges.options?.currentValue) {
            this.filteredOptions = of(this.options);
        }
    }

    protected controlValueChange(event: any) {
        if (this.onChange.observed) {
            this.onChange.emit(event);
        }
    }

    protected search(event: string) {
        this.searchControl.setValue(event);
        if (event === '') {
            this.filteredOptions = of(this.options);
            return;
        }
        const eventToLower = event.toLowerCase();
        const { withOutKey } = this.searchSettings;
        this.filteredOptions = of(
            this.options.filter((option: any) => {
                if (withOutKey) {
                    return option.toLowerCase().includes(eventToLower);
                } else {
                    return option[this.searchSettings.keyToLookUpInto]?.toLowerCase().includes(eventToLower);
                }
            })
        );
    }
}
