import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DirectivesAutoSelectDropdownModule } from '@msg91/directives/auto-select-dropdown';
import { ServicesMsg91ComposeModule } from '@msg91/services/msg91/compose';
import { InboxAutocompleteComponent } from './inbox-autocomplete/inbox-autocomplete.component';
import { DirectivesCloseDropdownOnEscapeModule } from '@msg91/directives/close-dropdown-on-escape';

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
        DirectivesCloseDropdownOnEscapeModule,
    ],
    declarations: [InboxAutocompleteComponent],
    exports: [InboxAutocompleteComponent],
})
export class UiComponentsInboxAutocompleteModule {}
