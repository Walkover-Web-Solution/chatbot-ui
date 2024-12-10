import {
    NgModule,
    OnInit,
    Directive,
    ElementRef,
    Input,
    OnChanges,
    Component,
    ViewContainerRef,
    SimpleChanges,
    inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Platform } from '@angular/cdk/platform';

@Component({
    selector: 'msg91-loader-button-wrapper',
    template: `
        <ng-container [ngSwitch]="buttonType">
            <button *ngSwitchCase="'flat'" mat-raised-button disabled="true" [ngClass]="wrapperClass">
                <ng-container *ngTemplateOutlet="commonButtonContentTemplate"></ng-container>
            </button>
            <button *ngSwitchCase="'icon'" mat-icon-button disabled="true" [ngClass]="wrapperClass">
                <ng-container *ngTemplateOutlet="commonButtonContentTemplate"></ng-container>
            </button>
            <button *ngSwitchCase="'flat-icon'" mat-mini-fab disabled="true" [ngClass]="wrapperClass">
                <ng-container *ngTemplateOutlet="commonButtonContentTemplate"></ng-container>
            </button>
        </ng-container>

        <ng-template #commonButtonContentTemplate>
            <div
                class="d-flex align-items-center justify-content-center gap-2"
                [ngStyle]="{ 'height.px': buttonStyle === 'lg' ? 40 : buttonStyle === 'md' ? 30 : 20 }"
            >
                <mat-spinner [diameter]="loaderSize"></mat-spinner>
                <span *ngIf="buttonText">{{ buttonText }}</span>
            </div>
        </ng-template>
    `,
})
export class LoaderButtonWrapperComponent {
    public buttonText: string = null;
    public buttonStyle: 'lg' | 'md' | 'sm' = 'lg';
    public buttonType: 'flat' | 'icon' | 'flat-icon' = 'flat';
    public loaderSize: string = '24';
    public wrapperClass: string;
}

@Directive({
    selector: '[msg91ButtonLoader]',
})
export class LoaderButtonDirective implements OnInit, OnChanges {
    @Input() public msg91ButtonLoader: boolean;
    @Input() public buttonText: string = null;
    @Input() public buttonStyle: 'lg' | 'md' | 'sm' = 'lg';
    @Input() public buttonType: 'flat' | 'icon' | 'flat-icon' = 'flat';
    @Input() public loaderSize: string = '18';
    @Input() public wrapperClass: string;
    public cdkPlatform = inject(Platform);

    constructor(
        private el: ElementRef,
        private viewContainerRef: ViewContainerRef
    ) {}

    public ngOnInit(): void {
        const button = this.el.nativeElement;
        if (button.classList.contains('mat-flat-button')) {
            if (button.classList.contains('flat-icon-btn')) {
                this.buttonType = 'flat-icon';
            } else {
                this.buttonType = 'flat';
            }
        } else if (button.classList.contains('mat-icon-button')) {
            this.buttonType = 'icon';
        }
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['msg91ButtonLoader']?.currentValue === changes['msg91ButtonLoader']?.previousValue) {
            return;
        }
        this.msg91ButtonLoader = changes.msg91ButtonLoader?.currentValue;
        this.viewContainerRef.clear();
        if (!this.cdkPlatform.ANDROID && !this.cdkPlatform.IOS) {
            if (this.msg91ButtonLoader) {
                this.createButtonWrapper();
            } else {
                this.el.nativeElement.setAttribute('style', 'display: block');
            }
        }
    }

    private createButtonWrapper() {
        this.el.nativeElement.setAttribute('style', 'display: none');
        let componentRef = this.viewContainerRef.createComponent(LoaderButtonWrapperComponent);
        componentRef.instance.buttonText = this.buttonText;
        componentRef.instance.buttonStyle = this.buttonStyle;
        componentRef.instance.buttonType = this.buttonType;
        componentRef.instance.loaderSize = this.loaderSize;
        componentRef.instance.wrapperClass = this.wrapperClass;
    }
}

@NgModule({
    imports: [CommonModule, MatProgressSpinnerModule, MatButtonModule],
    declarations: [LoaderButtonDirective, LoaderButtonWrapperComponent],
    exports: [LoaderButtonDirective],
})
export class DirectivesLoaderButtonModule {}
