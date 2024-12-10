import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhonebookAutocompleteComponent } from './phonebook-autocomplete/phonebook-autocomplete.component';
import { MatButtonModule } from '@angular/material/button';
import { ServicesMsg91ComposeModule } from '@msg91/services/msg91/compose';
import { DirectivesAutoSelectDropdownModule } from '@msg91/directives/auto-select-dropdown';
// import { PhonebookDialogModule } from '../../../../../apps/msg91/src/app/segmento-redesign/phonebook-dialog/phonebook-dialog.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DirectivesCloseDropdownOnEscapeModule } from '@msg91/directives/close-dropdown-on-escape';
import { DirectivesLoaderButtonModule } from '@msg91/directives/loader-button';

@NgModule({
    imports: [
        CommonModule,
        MatButtonModule,
        ReactiveFormsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatIconModule,
        ServicesMsg91ComposeModule,
        DirectivesAutoSelectDropdownModule,
        // PhonebookDialogModule,
        MatProgressSpinnerModule,
        DirectivesCloseDropdownOnEscapeModule,
        DirectivesLoaderButtonModule,
    ],
    declarations: [PhonebookAutocompleteComponent],
    exports: [PhonebookAutocompleteComponent],
})
export class UiComponentsPhonebookAutocompleteModule {}
