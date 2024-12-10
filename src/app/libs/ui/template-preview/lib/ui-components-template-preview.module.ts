import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { SmsPreviewComponent } from './sms-preview/sms-preview.component';
import { EmailPreviewComponent } from './email-preview/email-preview.component';
import { WhatsappPreviewComponent } from './whatsapp-preview/whatsapp-preview.component';
import { PipesReplaceModule } from '@msg91/pipes/replace';
import { MatRadioModule } from '@angular/material/radio';
import { PipesSafeUrlPipeModule } from '@msg91/pipes/SafeURLPipe';
import { PipesWhatsappInlineStyleFormatModule } from '@msg91/pipes/whatsapp-inline-style-format';
import { PipesSanitizeHtmlPipeModule } from '@msg91/pipes/SanitizeHtmlPipe';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    imports: [
        CommonModule,
        MatIconModule,
        MatCardModule,
        MatButtonModule,
        PipesReplaceModule,
        MatIconModule,
        MatRadioModule,
        PipesSafeUrlPipeModule,
        PipesWhatsappInlineStyleFormatModule,
        PipesSanitizeHtmlPipeModule,
        MatIconModule,
    ],
    declarations: [SmsPreviewComponent, EmailPreviewComponent, WhatsappPreviewComponent],
    exports: [SmsPreviewComponent, EmailPreviewComponent, WhatsappPreviewComponent],
})
export class UiComponentsTemplatePreviewModule {}
