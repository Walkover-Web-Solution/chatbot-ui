import { Directive, ElementRef, Input, NgModule, OnDestroy, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelect } from '@angular/material/select';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

/**
 * If The Parent of Mat Select or Mat Autocomplete closes on ESCAPE
 * then we should prevent propagation of escape event and close dropdown if the dropdown is open
 */
@Directive({
    selector: '[msg91CloseDropdownOnEscape]',
    exportAs: 'msg91CloseDropdownOnEscape',
})
export class CloseDropdownOnEscapeDirective implements OnDestroy {
    /**
     * Pass MatAutocompleteTrigger Ref for Mat Autocomplete
     * In case of Mat Select this Input should not be provided
     */
    @Input('msg91CloseDropdownOnEscape') matAutocompleteTriggerRef: MatAutocompleteTrigger;
    /** Created handler to use it in removeEventListener  */
    public handler = this.onCloseFunc.bind(this);

    constructor(
        @Optional() private selectHost: MatSelect,
        private elementRef: ElementRef
    ) {
        this.elementRef?.nativeElement?.addEventListener('keydown', this.handler);
    }

    onCloseFunc(event: any): void {
        if (event?.key === 'Escape') {
            if (this.selectHost) {
                if (this.selectHost?.panelOpen) {
                    this.selectHost.close();
                    event.stopPropagation();
                }
            } else if (this.matAutocompleteTriggerRef) {
                if (this.matAutocompleteTriggerRef?.panelOpen) {
                    this.matAutocompleteTriggerRef.closePanel();
                    event.stopPropagation();
                }
            }
        }
    }

    ngOnDestroy(): void {
        this.elementRef?.nativeElement?.removeEventListener('keydown', this.handler);
    }
}

@NgModule({
    imports: [CommonModule],
    declarations: [CloseDropdownOnEscapeDirective],
    exports: [CloseDropdownOnEscapeDirective],
})
export class DirectivesCloseDropdownOnEscapeModule {}
