import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { PipesLinkifyPipeModule } from '@msg91/pipes/LinkifyPipe';
import { PipesReplaceModule } from '@msg91/pipes/replace';
import { UiBotOptionsModule } from '@msg91/ui/bot-options';
import { MatButtonModule } from '@angular/material/button';
import { ChatInteractiveComponent } from './chat-interactive/chat-interactive.component';
import { PipesWhatsappInlineStyleFormatModule } from '@msg91/pipes/whatsapp-inline-style-format';
import { PipesSafeUrlPipeModule } from '@msg91/pipes/SafeURLPipe';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    imports: [
        CommonModule,
        PipesLinkifyPipeModule,
        PipesReplaceModule,
        UiBotOptionsModule,
        MatListModule,
        MatButtonModule,
        PipesWhatsappInlineStyleFormatModule,
        PipesSafeUrlPipeModule,
        MatIconModule,
    ],
    declarations: [ChatInteractiveComponent],
    exports: [ChatInteractiveComponent],
})
export class UiInteractiveMessageModule {}
