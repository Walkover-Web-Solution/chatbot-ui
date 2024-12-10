import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'msg91-no-network-connection',
    template: ` <div
            class="mat-right-dialog-header logs-details-header d-flex align-items-center justify-content-end"
            *ngIf="data?.showCloseButton"
        >
            <button mat-icon-button mat-dialog-close color="primary" (click)="dialogRef.close()">
                <mat-icon>close</mat-icon>
            </button>
        </div>
        <div class="d-flex align-items-center gap-3" mat-dialog-content>
            <div class="d-flex justify-content-center align-items-center network-off-icon">
                <mat-icon class="d-table">wifi_off</mat-icon>
            </div>
            <p class="my-0">Network connection is not stable enough!</p>
        </div>`,
    styles: [
        `
            .network-off-icon {
                height: 40px;
                width: 40px;
                background-color: red;
                border-radius: 100%;
                min-width: 40px;
            }
            .network-off-icon .d-table {
                font-size: 24px;
                color: var(--color-common-white);
            }
        `,
    ],
})
export class NoNetworkConnection {
    constructor(
        public dialogRef: MatDialogRef<NoNetworkConnection>,
        @Inject(MAT_DIALOG_DATA) public data
    ) {}
}
