import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhatsappMediaUploadInputComponent } from './whatsapp-media-upload-input/whatsapp-media-upload-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ServicesMsg91WhatsappModule } from '@msg91/services/msg91/whatsapp';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatIconModule,
        ServicesMsg91WhatsappModule,
    ],
    declarations: [WhatsappMediaUploadInputComponent],
    exports: [WhatsappMediaUploadInputComponent],
})
export class UiWhatsappMediaUploadInputModule {}
