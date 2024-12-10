import { CommonModule } from '@angular/common';
import {
    Directive,
    EventEmitter,
    HostListener,
    Input,
    NgModule,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    Renderer2,
    Self,
    TemplateRef,
} from '@angular/core';
import {
    ControlContainer,
    FormGroup,
    FormGroupDirective,
    FormsModule,
    NgControl,
    ReactiveFormsModule,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';

@Directive({
    selector: '[msg91MarkAllAsTouched]',
})
export class MarkAllAsTouchedDirective implements OnInit, OnDestroy {
    /** Button reference to handle custom form submit where submit event is not listened */
    @Input() buttonRef: MatButton;
    /** Emits when the form is valid */
    @Output() valid: EventEmitter<void> = new EventEmitter();
    @Output() markAsTouched: EventEmitter<void> = new EventEmitter();

    /** Listener instance to unsubscribe for memory optimization */
    private unsubscribeListener;

    constructor(
        @Self() @Optional() private container: ControlContainer,
        @Self() @Optional() private formGroupDirective: FormGroupDirective,
        private renderer: Renderer2,
        @Self() @Optional() private formControl: NgControl
    ) {}

    @HostListener('submit')
    markAllAsTouched(): void {
        if (this.container) {
            this.container.control.markAllAsTouched();
        }
        if (this.formGroupDirective) {
            this.recursivelyMarkAsTouched(this.formGroupDirective.control);
        }
        if (!this.container && !this.formGroupDirective && this.formControl) {
            this.formControl.control.markAllAsTouched();
        }
    }

    /**
     * Initializes the directive
     *
     * @memberof MarkAllAsTouchedDirective
     */
    public ngOnInit(): void {
        if (this.buttonRef?.['_elementRef']?.nativeElement) {
            if (this.unsubscribeListener) {
                this.unsubscribeListener();
            }
            this.unsubscribeListener = this.renderer.listen(
                this.buttonRef?.['_elementRef']?.nativeElement,
                'click',
                (event) => {
                    this.markAllAsTouched();
                    if (this.container?.invalid || this.formControl?.invalid) {
                        event.stopPropagation();
                        event.preventDefault();
                        this.markAsTouched.emit();
                    } else {
                        this.valid.emit();
                    }
                }
            );
        }
    }

    /**
     * Unsubscribes to all the listeners
     *
     * @memberof MarkAllAsTouchedDirective
     */
    public ngOnDestroy(): void {
        if (this.unsubscribeListener) {
            this.unsubscribeListener();
        }
    }

    /**
     * Recursively mark as touched
     *
     * @private
     * @param {FormGroup} formGroup FormGroup instance
     * @memberof MarkAllAsTouchedDirective
     */
    private recursivelyMarkAsTouched(formGroup: FormGroup): void {
        Object.values(formGroup.controls).forEach((control: any) => {
            control.markAllAsTouched();
            if (control.controls) {
                this.recursivelyMarkAsTouched(control);
            }
        });
    }
}

@NgModule({
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    declarations: [MarkAllAsTouchedDirective],
    exports: [MarkAllAsTouchedDirective],
})
export class DirectivesMarkAllAsTouchedModule {}
