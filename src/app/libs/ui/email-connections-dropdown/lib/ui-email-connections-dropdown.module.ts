import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailConnectionsDropdownComponent } from './email-connections-dropdown/email-connections-dropdown.component';
import { ServicesMsg91EmailConnectionsModule } from '@msg91/services/msg91/email/connections';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectivesLoaderButtonModule } from '@msg91/directives/loader-button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ServicesMsg91EmailConnectionsModule,
        MatSelectModule,
        MatFormFieldModule,
        MatButtonModule,
        DirectivesLoaderButtonModule,
        MatIconModule,
    ],
    declarations: [EmailConnectionsDropdownComponent],
    exports: [EmailConnectionsDropdownComponent],
})
export class UiEmailConnectionsDropdownModule {}
