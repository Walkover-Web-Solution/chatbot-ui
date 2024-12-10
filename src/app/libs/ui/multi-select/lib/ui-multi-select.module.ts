import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiSelectComponent } from './multi-select/multi-select.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DirectivesCloseDropdownOnEscapeModule } from '@msg91/directives/close-dropdown-on-escape';

@NgModule({
    declarations: [MultiSelectComponent],
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule,
        MatCheckboxModule,
        DirectivesCloseDropdownOnEscapeModule,
    ],
    exports: [MultiSelectComponent],
})
export class UiMultiSelectModule {}
