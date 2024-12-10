import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhatsappTemplateDropDownComponent } from './whatsapp-template-dropdown/whatsapp-template-dropdown.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DirectivesAutoSelectDropdownModule } from '@msg91/directives/auto-select-dropdown';
import { DirectivesLoaderButtonModule } from '@msg91/directives/loader-button';
import { DirectivesCloseDropdownOnEscapeModule } from '@msg91/directives/close-dropdown-on-escape';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { UiVirtualScrollModule } from '@msg91/ui/virtual-scroll';
import { MatInputModule } from '@angular/material/input';

@NgModule({
    declarations: [WhatsappTemplateDropDownComponent],
    imports: [
        CommonModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        DirectivesLoaderButtonModule,
        DirectivesAutoSelectDropdownModule,
        DirectivesCloseDropdownOnEscapeModule,
        MatAutocompleteModule,
        UiVirtualScrollModule,
        MatInputModule,
    ],
    exports: [WhatsappTemplateDropDownComponent],
})
export class UiComponentsWhatsappTemplateDropdownModule {}
