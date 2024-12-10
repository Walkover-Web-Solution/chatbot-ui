import {
    NgModule,
    Directive,
    ViewContainerRef,
    TemplateRef,
    Component,
    ComponentRef,
    Input,
    OnChanges,
    SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'msg91-button-wrapper',
    template: `
        <div [ngClass]="wrapperClass" [matTooltip]="tooltipText" [matTooltipPosition]="tooltipPosition">
            <ng-template [ngTemplateOutlet]="template"></ng-template>
        </div>
    `,
})
export class ButtonWrapperComponent {
    public template: TemplateRef<unknown>;
    public tooltipText: string;
    public tooltipPosition: string;
    public wrapperClass: string;
}

@Directive({
    selector: '[msg91ButtonWrapper]',
})
export class ButtonWrapperDirective implements OnChanges {
    public componentRef: ComponentRef<ButtonWrapperComponent>;

    @Input('msg91ButtonWrapper') isDisabled: boolean;
    @Input('msg91ButtonWrapperTooltipText') tooltipText: string;
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Input('msg91ButtonWrapperTooltipPosition') tooltipPosition: string = 'above';
    @Input('msg91ButtonWrapperWrapperClass') wrapperClass: string;

    constructor(
        private viewContainerRef: ViewContainerRef,
        private templateRef: TemplateRef<unknown>
    ) {}

    public ngOnChanges(changes: SimpleChanges): void {
        this.viewContainerRef.clear();
        if (!changes?.isDisabled?.currentValue) {
            this.createButtonWrapper();
        } else {
            this.viewContainerRef.createEmbeddedView(this.templateRef);
        }
    }

    private createButtonWrapper() {
        this.componentRef = this.viewContainerRef.createComponent(ButtonWrapperComponent);
        this.componentRef.instance.template = this.templateRef;
        this.componentRef.instance.tooltipPosition = this.tooltipPosition;
        this.componentRef.instance.tooltipText = this.tooltipText;
        this.componentRef.instance.wrapperClass = this.wrapperClass;
    }
}

@NgModule({
    imports: [MatTooltipModule, CommonModule],
    declarations: [ButtonWrapperComponent, ButtonWrapperDirective],
    exports: [ButtonWrapperDirective],
})
export class ButtonWrapperDirectiveModule {}
