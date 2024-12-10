import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthkeyDropdownComponent } from './authkey-dropdown/authkey-dropdown.component';
import { ServicesMsg91SmsAuthkeyServiceModule } from '@msg91/services/msg91/sms/authkey-service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectivesLoaderButtonModule } from '@msg91/directives/loader-button';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatTooltipModule,
        MatSelectModule,
        MatDialogModule,
        RouterModule,
        ServicesMsg91SmsAuthkeyServiceModule,
        DirectivesLoaderButtonModule,
    ],
    declarations: [AuthkeyDropdownComponent],
    exports: [AuthkeyDropdownComponent],
})
export class UiAuthkeyDropdownModule {}
