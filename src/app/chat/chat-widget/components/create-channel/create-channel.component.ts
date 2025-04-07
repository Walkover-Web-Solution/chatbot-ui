import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BaseComponent } from '@msg91/ui/base-component';

@Component({
    selector: 'msg91-create-channel',
    templateUrl: './create-channel.component.html',
    styleUrls: ['./create-channel.component.scss'],
    standalone: false
})
export class CreateChannelComponent extends BaseComponent implements OnDestroy {
    @Input() isClientBlocked: boolean = false;

    constructor() {
        super();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
