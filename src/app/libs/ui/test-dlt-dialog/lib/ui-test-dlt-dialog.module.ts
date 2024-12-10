import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestDltDialogComponent } from './test-dlt-dialog/test-dlt-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectivesRemoveCharacterDirectiveModule } from '@msg91/directives/RemoveCharacterDirective';
import { MatButtonModule } from '@angular/material/button';
import { ServicesMsg91SmsTemplateServiceModule } from '@msg91/services/msg91/sms/template-service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatInputModule,
        MatFormFieldModule,
        DirectivesRemoveCharacterDirectiveModule,
        ServicesMsg91SmsTemplateServiceModule,
    ],
    declarations: [TestDltDialogComponent],
    exports: [TestDltDialogComponent],
})
export class UiTestDltDialogModule {}
