import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { ToEmailFormControlComponent } from './to-email-form-control/to-email-form-control.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    declarations: [ToEmailFormControlComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatChipsModule,
        MatIconModule,
    ],
    exports: [ToEmailFormControlComponent],
})
export class UiToEmailFormControlModule {}
