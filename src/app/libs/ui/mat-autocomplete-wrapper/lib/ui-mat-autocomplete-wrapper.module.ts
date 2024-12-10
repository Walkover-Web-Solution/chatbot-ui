import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatAutocompleteComponent } from './mat-autocomplete/mat-autocomplete.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DirectivesCloseDropdownOnEscapeModule } from '@msg91/directives/close-dropdown-on-escape';

@NgModule({
    declarations: [MatAutocompleteComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        DirectivesCloseDropdownOnEscapeModule,
    ],
    exports: [MatAutocompleteComponent],
})
export class UiMatAutocompleteWrapperModule {}
