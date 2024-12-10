import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { NoRecordFoundComponent } from './no-record-found.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
    exports: [NoRecordFoundComponent],
    declarations: [NoRecordFoundComponent],
})
export class UiNoRecordFoundModule {}
