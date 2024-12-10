import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PlayerComponent } from './player/player.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    declarations: [PlayerComponent],
    imports: [CommonModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule],
    exports: [PlayerComponent],
})
export class UiPlayerModule {}
