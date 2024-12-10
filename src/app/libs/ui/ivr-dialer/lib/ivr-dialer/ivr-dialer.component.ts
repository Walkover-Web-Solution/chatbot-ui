import { BaseComponent } from '@msg91/ui/base-component';
import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

const DIALER_REGEX = /\*|\#|[0-9]/;

@Component({
    selector: 'msg91-ivr-dialer',
    templateUrl: './ivr-dialer.component.html',
    styleUrls: ['./ivr-dialer.component.scss'],
})
export class IvrDialerComponent extends BaseComponent implements OnDestroy {
    @Output() sendDTMF = new EventEmitter<string | number>();
    public dtmfInput = '';

    constructor(public dialogRef: MatDialogRef<IvrDialerComponent>) {
        super();
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public digitClicked(event): void {
        this.dtmfInput += event.srcElement.id;
        this.sendDTMF.emit(event.srcElement.id);
    }

    public handleKeyDown(event: KeyboardEvent): void {
        if (event.key.match(DIALER_REGEX)) {
            this.sendDTMF.emit(event.key);
        } else if (event.key === 'Backspace') {
            this.dtmfInput = '';
        } else {
            event.stopPropagation();
            event.preventDefault();
        }
    }

    public onNoClick() {
        this.dialogRef.close();
    }
}
