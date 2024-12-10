import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MicroServiceTypeDropdownComponent } from './microservice-type-dropdown/microservice-type-dropdown.component';
import { FormsModule } from '@angular/forms';
import { DirectivesAutoSelectDropdownModule } from '@msg91/directives/auto-select-dropdown';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PipesSplitModule } from '@msg91/pipes/split';
import { PipesJoinModule } from '@msg91/pipes/join';
import { DirectivesCloseDropdownOnEscapeModule } from '@msg91/directives/close-dropdown-on-escape';
@NgModule({
    declarations: [MicroServiceTypeDropdownComponent],
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatSelectModule,
        FormsModule,
        DirectivesAutoSelectDropdownModule,
        MatCheckboxModule,
        PipesSplitModule,
        PipesJoinModule,
        DirectivesCloseDropdownOnEscapeModule,
    ],
    exports: [MicroServiceTypeDropdownComponent],
})
export class UiMicroserviceTypeDropdownModule {}
