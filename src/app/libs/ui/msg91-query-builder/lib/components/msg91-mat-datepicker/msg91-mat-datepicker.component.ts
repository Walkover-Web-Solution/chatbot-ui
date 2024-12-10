import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BaseComponent } from '@msg91/ui/base-component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DirectivesOpenDatepickerOnFocusDirectiveModule } from '@msg91/directives/open-datepicker-on-focus-directive';

const Imports = [
    CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    DirectivesOpenDatepickerOnFocusDirectiveModule,
];

@Component({
    standalone: true,
    selector: 'msg91-mat-datepicker',
    templateUrl: './msg91-mat-datepicker.component.html',
    styleUrls: ['./msg91-mat-datepicker.component.scss'],
    imports: Imports,
})
export class Msg91MatDatePickerComponent extends BaseComponent {
    @Input() useControlInForm: boolean = true;
    @Input() control: FormControl;
    @Input() showLabel: boolean = false;
    @Input() labelText: string = '';
    @Input() placeholder: string = 'Select Date';
    @Input() class: string | string[] = '';
    @Input() appearance: string = 'outline';
    @Input() showError: boolean = true;
    @Input() showErrorIntoMatFormField: boolean = true;
    @Input() controlErrorsMessage: { [key: string]: string } = {};
    @Input() readonly: boolean = false;
    @Input() openOnFocus: boolean = false;

    /** Emits the selected value when date changes */
    @Output() dateChange: EventEmitter<any> = new EventEmitter();

    constructor() {
        super();
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    protected controlValueChange(event: any) {
        if (this.dateChange.observed) {
            this.dateChange.emit(event);
        }
    }
}
