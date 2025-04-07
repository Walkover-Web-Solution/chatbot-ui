import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BaseComponent } from '@msg91/ui/base-component';

@Component({
    selector: 'msg91-profile-name',
    templateUrl: './profile-name.component.html',
    styleUrls: ['./profile-name.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ProfileNameComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input() shortName: string = 'A';
    @Input() hashCode: string = '#0f22a7';

    @Input() width: number;
    @Input() height: number;
    @Input() aProfileClass: string;

    constructor() {
        super();
    }

    ngOnInit() {}

    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
