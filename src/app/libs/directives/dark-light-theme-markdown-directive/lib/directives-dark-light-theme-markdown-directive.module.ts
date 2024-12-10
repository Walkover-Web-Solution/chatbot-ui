import {
    AfterViewInit,
    Component,
    Directive,
    ElementRef,
    Input,
    NgModule,
    ViewContainerRef,
    ChangeDetectorRef,
    OnChanges,
    SimpleChanges,
    OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MARKDOWN_DARK_CLASS, MARKDOWN_LIGHT_CLASS } from '..';

@Component({
    selector: 'msg91-dark-light-button',
    template: `
        <button
            mat-icon-button
            class="position-absolute"
            [ngClass]="class"
            style="right: 50px; top: 10px"
            color="primary"
            (click)="changeTheme()"
        >
            <mat-icon>{{ dark ? 'sunny' : 'brightness_3' }}</mat-icon>
        </button>
    `,
    styles: [
        `
            .no-copy-btn {
                right: 16px !important;
            }
        `,
    ],
})
export class DarkLightButtonComponent {
    public dark: boolean = false;
    public class: string;
    public elementRef: ElementRef;

    public changeTheme() {
        this.dark = !this.dark;
        this.addClass();
    }

    private addClass() {
        if (this.elementRef) {
            this.elementRef?.nativeElement?.parentElement?.classList?.remove(
                this.dark ? MARKDOWN_LIGHT_CLASS : MARKDOWN_DARK_CLASS
            );
            this.elementRef?.nativeElement?.parentElement?.classList?.add(
                this.dark ? MARKDOWN_DARK_CLASS : MARKDOWN_LIGHT_CLASS
            );
        }
    }
}

@Directive({
    selector: '[darkLightButtonMarkdown]',
})
export class DarkLightButtonDirective implements OnInit {
    @Input() public darkLightButtonDefault: string = 'light';
    @Input() public darkLightButtonClass: string = 'icon-btn-md';

    constructor(
        private elRef: ElementRef,
        private viewContainerRef: ViewContainerRef
    ) {}

    public ngOnInit(): void {
        this.elRef?.nativeElement?.parentElement?.classList?.add(
            this.darkLightButtonDefault === 'dark' ? MARKDOWN_DARK_CLASS : MARKDOWN_LIGHT_CLASS
        );
        this.createButtonWrapper();
    }

    private createButtonWrapper() {
        let componentRef = this.viewContainerRef.createComponent(DarkLightButtonComponent);
        componentRef.instance.dark = this.darkLightButtonDefault === 'dark';
        componentRef.instance.class = this.darkLightButtonClass;
        componentRef.instance.elementRef = this.elRef;
    }
}

@NgModule({
    imports: [CommonModule, MatIconModule, MatButtonModule],
    declarations: [DarkLightButtonComponent, DarkLightButtonDirective],
    exports: [DarkLightButtonComponent, DarkLightButtonDirective],
})
export class DirectivesDarkLightThemeMarkdownDirectiveModule {}
