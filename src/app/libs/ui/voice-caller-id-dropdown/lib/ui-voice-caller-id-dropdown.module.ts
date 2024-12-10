import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DirectivesAutoSelectDropdownModule } from '@msg91/directives/auto-select-dropdown';
import { VoiceCallerIdDropdownComponent } from './voice-caller-id-dropdown/voice-caller-id-dropdown.component';
import { UiVirtualScrollModule } from '@msg91/ui/virtual-scroll';
import { DirectivesCloseDropdownOnEscapeModule } from '@msg91/directives/close-dropdown-on-escape';

@NgModule({
    imports: [
        CommonModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        UiVirtualScrollModule,
        DirectivesAutoSelectDropdownModule,
        DirectivesCloseDropdownOnEscapeModule,
    ],
    declarations: [VoiceCallerIdDropdownComponent],
    exports: [VoiceCallerIdDropdownComponent],
})
export class UiVoiceCallerIdDropdownModule {}
