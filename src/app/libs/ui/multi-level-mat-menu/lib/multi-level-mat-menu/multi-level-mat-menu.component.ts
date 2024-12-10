import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { BaseComponent } from '@msg91/ui/base-component';
import { MatMenu } from '@angular/material/menu';
import { CustomLazyLoadingDirectiveModule } from '@msg91/directives/custom-lazy-loading-directive';
import { MAT_MENU_DEFAULT_OPTIONS } from '@angular/material/menu';

@Component({
    selector: 'msg91-multi-level-mat-menu',
    standalone: true,
    templateUrl: './multi-level-mat-menu.component.html',
    styleUrls: ['./multi-level-mat-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, MatMenuModule, CustomLazyLoadingDirectiveModule],
    providers: [
        {
            provide: MAT_MENU_DEFAULT_OPTIONS,
            useValue: {
                overlayPanelClass: ['multi-level-menu', 'search-with-ai-menu'],
            },
        },
    ],
})
export class MultiLevelMatMenuComponent extends BaseComponent implements OnInit, OnDestroy, OnChanges {
    /** Refer to mat menu */
    @ViewChild('multiLevelMatMenu', { static: false }) public multiLevelMatMenu: MatMenu;

    /** Data to show  */
    @Input() menuData: any[] = [];
    /** Whether the menu has a backdrop  */
    @Input() hasBackdrop: boolean = false;
    /** Whether to show menu above the button */
    @Input() overlapTrigger = false;

    /** emit selected mat menu item. */
    @Output() selectedValue: EventEmitter<any> = new EventEmitter();

    // when there is scroll
    @Output() scroll: EventEmitter<any> = new EventEmitter();

    constructor() {
        super();
    }

    ngOnInit(): void {}

    ngOnChanges(changes: SimpleChanges): void {}

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public emitValueOrCallCallback(child) {
        if (child.callback) {
            child.callback(child);
        } else if (this.selectedValue.observed) {
            this.selectedValue.emit(child);
        }
    }
}
