import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SegmentsAutocompleteComponent } from './segments-autocomplete/segments-autocomplete.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UiVirtualScrollModule } from '@msg91/ui/virtual-scroll';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DirectivesCloseDropdownOnEscapeModule } from '@msg91/directives/close-dropdown-on-escape';
import { ServicesMsg91SegmentoSegmentModule } from '@msg91/services/msg91/segmento/segment';
import { DirectivesLoaderButtonModule } from '@msg91/directives/loader-button';

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
        MatProgressSpinnerModule,
        DirectivesCloseDropdownOnEscapeModule,
        ServicesMsg91SegmentoSegmentModule,
        DirectivesLoaderButtonModule,
    ],
    declarations: [SegmentsAutocompleteComponent],
    exports: [SegmentsAutocompleteComponent],
})
export class UiComponentsSegmentsAutocompleteModule {}
