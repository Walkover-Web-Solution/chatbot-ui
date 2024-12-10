import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhatsappIcebreakerPreviewComponent } from './whatsapp-icebreaker-preview/whatsapp-icebreaker-preview.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@NgModule({
    imports: [CommonModule, MatIconModule, MatCardModule],
    declarations: [WhatsappIcebreakerPreviewComponent],
    exports: [WhatsappIcebreakerPreviewComponent],
})
export class UiWhastappFullPreviewModule {}
