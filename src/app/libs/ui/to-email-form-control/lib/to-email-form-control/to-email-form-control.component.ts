import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { EMAIL_REGEX } from '@msg91/regex';
import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { cloneDeep, isEqual, uniq } from 'lodash-es';
import { distinctUntilChanged, takeUntil } from 'rxjs';
import { BaseComponent } from '@msg91/ui/base-component';

@Component({
    selector: 'msg91-to-email-form-control',
    templateUrl: './to-email-form-control.component.html',
})
export class ToEmailFormControlComponent extends BaseComponent implements OnInit {
    @Input() label: string;
    @Input() control: FormControl;
    @Input() validationRequired: boolean = false;
    @Output() emailList = new EventEmitter<string[]>();
    @ViewChild('customEmailChipList') customEmailChipList;
    readonly separatorKeysCodes = [ENTER, COMMA, SPACE] as const;
    public singleMailFormControl = new FormControl(null, [Validators.pattern(EMAIL_REGEX)]);
    public selectedEmails: any = [];

    constructor(private cdr: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        this.getFormControl.valueChanges
            .pipe(distinctUntilChanged(isEqual), takeUntil(this.destroy$))
            .subscribe((toValue) => {
                this.selectedEmails = cloneDeep(toValue);
                this.emailList.emit(this.selectedEmails);
                this.cdr.detectChanges();
            });

        if (this.validationRequired) {
            this.singleMailFormControl.setValidators([Validators.required, Validators.pattern(EMAIL_REGEX)]);
        }
    }

    get getFormControl() {
        return this.control as FormControl;
    }

    public addCustomEmail(event): void {
        if (new RegExp(EMAIL_REGEX).test(event.value)) {
            this.getFormControl.setValue(uniq([...this.selectedEmails, event.value]));
            event.chipInput!.clear();
        }
        this.getFormControl.markAsTouched();
    }

    public removeTo(email: string): void {
        let getAll = this.getFormControl.value as string[];
        getAll = getAll.filter((f) => f !== email);
        this.getFormControl.setValue(getAll);
    }

    public checkEmailValidations(): void {
        if (this.customEmailChipList) {
            const result = this.singleMailFormControl?.value?.split(',')?.filter((element) => element.trim().length);
            if (!result?.length) {
                this.customEmailChipList.errorState = !this.selectedEmails?.length && this.validationRequired;
            } else {
                this.customEmailChipList.errorState =
                    this.singleMailFormControl.touched && this.singleMailFormControl.invalid;
            }
            if (!this.control.dirty) {
                this.control.markAsDirty();
            }
        }
    }
}
