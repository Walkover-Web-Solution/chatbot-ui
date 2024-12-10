import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { UiVirtualScrollModule } from '@msg91/ui/virtual-scroll';
import { MatSelectModule } from '@angular/material/select';
import { DirectivesAutoSelectDropdownModule } from '@msg91/directives/auto-select-dropdown';
import { DirectivesLoaderButtonModule } from '@msg91/directives/loader-button';
import { DirectivesCloseDropdownOnEscapeModule } from '@msg91/directives/close-dropdown-on-escape';
import { LongcodeNumberInboxAutocompleteComponent } from './longcode-number-inbox-autocomplete/longcode-number-inbox-autocomplete.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ServicesMsg91ComposeModule } from '@msg91/services/msg91/compose';

@NgModule({
    imports: [
        CommonModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatAutocompleteModule,
        MatIconModule,
        MatButtonModule,
        UiVirtualScrollModule,
        MatSelectModule,
        MatTooltipModule,
        DirectivesLoaderButtonModule,
        DirectivesAutoSelectDropdownModule,
        DirectivesCloseDropdownOnEscapeModule,
        ServicesMsg91ComposeModule,
    ],
    declarations: [LongcodeNumberInboxAutocompleteComponent],
    exports: [LongcodeNumberInboxAutocompleteComponent],
})
export class UiLongcodeNumberInboxAutocompleteModule {}
