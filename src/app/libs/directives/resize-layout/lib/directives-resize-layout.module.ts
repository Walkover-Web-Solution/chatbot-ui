import { Directive, ElementRef, HostListener, Input, NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Directive({
    selector: '[resizeLayout]',
})
export class DirectivesResizeLayout implements OnInit {
    @Input('resizeElement') resizeElement: HTMLElement;
    @Input('minWidth') minWidth: number;
    @Input('maxWidth') maxWidth: number;
    @Input('sideNavCurrentWidth') sideNavCurrentWidth: number;
    @Input('localStorageKey') localStorageKey: string;
    public flag: boolean = false;

    constructor(private el: ElementRef<HTMLElement>) {}

    public ngOnInit(): void {
        let divWidth = localStorage.getItem(this.localStorageKey);
        if (divWidth) {
            this.resizeElement.style.flex = `0 0 ${+divWidth}px`;
        }
    }

    @HostListener('mousedown') onMouseDown() {
        this.flag = true;
    }
    @HostListener('window:mouseup') onMouseUp() {
        this.flag = false;
    }

    @HostListener('window:mousemove', ['$event']) onMouseMove(event: MouseEvent) {
        if (this.flag) {
            const calculatedValue = event.clientX - (this.sideNavCurrentWidth + 8);
            let finalWidth =
                calculatedValue > this.maxWidth
                    ? this.maxWidth
                    : calculatedValue < +this.minWidth
                      ? +this.minWidth
                      : calculatedValue;
            if (event.movementX > 0) {
                if (this.resizeElement.offsetWidth < this.maxWidth) {
                    this.resizeElement.style.flex = `0 0 ${finalWidth}px`;
                    localStorage.setItem(this.localStorageKey, finalWidth.toString());
                } else {
                    this.resizeElement.style.flex = `0 0 ${this.maxWidth}px`;
                    localStorage.setItem(this.localStorageKey, this.maxWidth.toString());
                }
            } else if (event.movementX < 0) {
                if (this.resizeElement.offsetWidth > +this.minWidth) {
                    this.resizeElement.style.flex = `0 0 ${finalWidth}px`;
                    localStorage.setItem(this.localStorageKey, finalWidth.toString());
                } else {
                    this.resizeElement.style.flex = `0 0 ${+this.minWidth}px`;
                    localStorage.setItem(this.localStorageKey, this.minWidth.toString());
                }
            }
        }
    }
}

@NgModule({
    imports: [CommonModule],
    declarations: [DirectivesResizeLayout],
    exports: [DirectivesResizeLayout],
})
export class DirectivesResizeLayoutModule {}
