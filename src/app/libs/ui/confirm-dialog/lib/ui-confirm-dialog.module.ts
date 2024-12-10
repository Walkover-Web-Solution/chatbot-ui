import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { A11yModule } from '@angular/cdk/a11y';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { DirectivesSkeletonModule } from '@msg91/directives/skeleton';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
    declarations: [ConfirmDialogComponent],
    exports: [ConfirmDialogComponent],
    imports: [CommonModule, MatButtonModule, A11yModule, DirectivesSkeletonModule, MatDialogModule],
})
export class UiConfirmDialogModule {}
