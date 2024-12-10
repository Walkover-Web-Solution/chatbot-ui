import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BotOptionsComponent } from './bot-options/bot-options.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    declarations: [BotOptionsComponent],
    imports: [CommonModule, MatButtonModule],
    exports: [BotOptionsComponent],
})
export class UiBotOptionsModule {}
