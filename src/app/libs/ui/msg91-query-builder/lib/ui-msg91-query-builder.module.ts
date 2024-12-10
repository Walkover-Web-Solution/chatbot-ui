import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { Msg91MatSelectComponent } from './components/msg91-mat-select/msg91-mat-select.component';
import { Msg91MatInputComponent } from './components/msg91-mat-input/msg91-mat-input.component';
import { Msg91QueryBuilderComponent } from './msg91-query-builder/msg91-query-builder.component';
import { Msg91MatDatePickerComponent } from './components/msg91-mat-datepicker/msg91-mat-datepicker.component';
import { PipesFieldValuePipeModule } from '@msg91/pipes/FieldValuePipe';

@NgModule({
    declarations: [Msg91QueryBuilderComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        Msg91MatInputComponent,
        Msg91MatSelectComponent,
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
        Msg91MatDatePickerComponent,
        PipesFieldValuePipeModule,
    ],
    exports: [Msg91QueryBuilderComponent, Msg91MatInputComponent, Msg91MatSelectComponent],
})
export class UiMsg91QueryBuilderModule {}
