import { Directive, ElementRef, Input, NgModule, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';

@Directive({
    selector: '[msg91AutoResizeTextarea]',
})
export class AutoResizableTextareaDirective implements OnInit, OnDestroy {
    public unsubscribeSubscription;

    @Input() public textareaHeight: number;

    constructor(
        private elementRef: ElementRef,
        private renderer: Renderer2
    ) {}

    public ngOnInit(): void {
        if (this.elementRef.nativeElement) {
            if (this.unsubscribeSubscription) {
                this.unsubscribeSubscription();
            }
            this.renderer.setStyle(
                this.elementRef.nativeElement,
                'height',
                this.textareaHeight ? `${this.textareaHeight}px` : 'auto'
            );
            this.renderer.setStyle(this.elementRef.nativeElement, 'box-sizing', 'border-box');
            this.unsubscribeSubscription = this.renderer.listen(this.elementRef.nativeElement, 'input', (event) => {
                this.renderer.setStyle(this.elementRef.nativeElement, 'height', 'auto');
                const height = Math.max(event.target?.scrollHeight, this.textareaHeight ?? 100);
                this.renderer.setStyle(this.elementRef.nativeElement, 'height', `${height}px`);
            });
        }
    }

    public ngOnDestroy(): void {
        if (this.unsubscribeSubscription) {
            this.unsubscribeSubscription();
        }
    }
}

@NgModule({
    imports: [CommonModule],
    declarations: [AutoResizableTextareaDirective],
    exports: [AutoResizableTextareaDirective],
})
export class DirectivesAutoResizableTextareaModule {}
