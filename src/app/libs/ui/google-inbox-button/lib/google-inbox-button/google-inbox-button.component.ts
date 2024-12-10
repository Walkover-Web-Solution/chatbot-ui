import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { BaseComponent } from '@msg91/ui/base-component';

@Component({
    selector: 'msg91-google-inbox-button',
    templateUrl: './google-inbox-button.component.html',
    styleUrls: ['./google-inbox-button.component.scss'],
})
export class GoogleInboxButtonComponent extends BaseComponent implements OnDestroy {
    @Output() public buttonClicked = new EventEmitter();
    constructor() {
        super();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
