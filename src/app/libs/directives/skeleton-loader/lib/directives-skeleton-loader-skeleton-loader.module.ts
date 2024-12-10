import {
    Component,
    ComponentRef,
    Directive,
    NgModule,
    OnChanges,
    SimpleChanges,
    TemplateRef,
    Input,
    ViewContainerRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectivesSkeletonModule } from '@msg91/directives/skeleton';

@Component({
    selector: 'msg91-skeleton-loader',
    template: ` <div *skeleton="isLoading; repeat: repeat; width: width; height: height; className: className"></div> `,
    styles: [
        `
            :host {
                display: block;
                width: 100%;
            }
        `,
    ],
})
export class SkeletonLoaderComponent {
    public template: TemplateRef<unknown>;
    public isLoading: boolean = false;
    public className: string | Array<string>;
    public width: string;
    public height: string;
    public repeat: number = 1;
}

@Directive({
    selector: '[msg91SkeletonLoader]',
})
export class SkeletonLoaderDirective implements OnChanges {
    public componentRef: ComponentRef<SkeletonLoaderComponent>;

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Input('msg91SkeletonLoader') isLoading: boolean = false;
    @Input('msg91SkeletonLoaderClassName') className: string | Array<string> = ['w-100', 'rounded-4'];
    @Input('msg91SkeletonLoaderWidth') width: string = '100%';
    @Input('msg91SkeletonLoaderHeight') height: string = '20px';
    @Input('msg91SkeletonLoaderRepeat') repeat: number = 1;

    constructor(
        private viewContainerRef: ViewContainerRef,
        private templateRef: TemplateRef<unknown>
    ) {}

    public ngOnChanges(changes: SimpleChanges): void {
        this.viewContainerRef.clear();
        if (changes?.isLoading?.currentValue) {
            this.showSkeletonLoader();
        } else {
            this.viewContainerRef.createEmbeddedView(this.templateRef);
        }
    }

    private showSkeletonLoader(): void {
        this.componentRef = this.viewContainerRef.createComponent(SkeletonLoaderComponent);
        this.componentRef.instance.template = this.templateRef;
        this.componentRef.instance.isLoading = this.isLoading;
        this.componentRef.instance.className = this.className;
        this.componentRef.instance.repeat = this.repeat;
        this.componentRef.instance.width = this.width;
        this.componentRef.instance.height = this.height;
    }
}

@NgModule({
    imports: [CommonModule, DirectivesSkeletonModule],
    declarations: [SkeletonLoaderDirective, SkeletonLoaderComponent],
    exports: [SkeletonLoaderDirective],
})
export class SkeletonLoaderDirectiveModule {}
