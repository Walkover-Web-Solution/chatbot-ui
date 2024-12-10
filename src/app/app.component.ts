import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { BaseComponent } from '@msg91/ui/base-component';

@Component({
    selector: 'msg91-root',
    template: ``,
    styles: [],
})
export class AppComponent extends BaseComponent implements OnInit, OnDestroy {
    public configuration: any;

    constructor() {
        super();
    }

    ngOnInit() {}

    @HostListener('window:beforeunload')
    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
