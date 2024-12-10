import { AfterViewInit, Component, ElementRef, Inject, Optional, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ENVIRONMENT_TOKEN, ENVIRONMENT_TOKEN_NOT_PROVIDED_ERROR } from '@msg91/constant';
import { errorResolver } from '@msg91/models/root-models';
import { ITestDltReq } from '@msg91/models/sms-models';
import { SmsTemplatesService } from '@msg91/services/msg91/sms/template-service';
import { BaseComponent } from '@msg91/ui/base-component';
import { PrimeNgToastService } from '@msg91/ui/prime-ng-toast';
import { IntlPhoneLib } from '@msg91/utils';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'msg91-test-dlt-dialog',
    templateUrl: './test-dlt-dialog.component.html',
})
export class TestDltDialogComponent extends BaseComponent implements AfterViewInit {
    @ViewChild('initContact') initContact: ElementRef<HTMLInputElement>;
    public mobileNumber = new FormControl<string | number | null>('', [Validators.required]);
    public isLoading$ = new BehaviorSubject<boolean>(false);
    public intlClass: IntlPhoneLib;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: ITestDltReq,
        public dialogRef: MatDialogRef<TestDltDialogComponent>,
        private elemRef: ElementRef,
        private smsTemplatesService: SmsTemplatesService,
        public toast: PrimeNgToastService,
        @Optional() @Inject(ENVIRONMENT_TOKEN) private environment: any
    ) {
        super();
        if (!this.environment) {
            throw new Error(ENVIRONMENT_TOKEN_NOT_PROVIDED_ERROR);
        }
    }

    ngAfterViewInit(): void {
        this.initIntl();
        this.dialogOnCloseEsc(this.dialogRef, [this.mobileNumber], null);
    }

    public initIntl(): void {
        const parentDom = this.elemRef?.nativeElement;
        const input = this.initContact?.nativeElement;
        const customCssStyleURL = `${this.environment.server}/${
            this.environment.env === 'prod' ? 'app' : 'hello-new'
        }/assets/utils/intl-tel-input-custom.css`;
        if (input) {
            this.intlClass = new IntlPhoneLib(
                input,
                parentDom,
                customCssStyleURL,
                false,
                {
                    allowDropdown: false,
                    separateDialCode: true,
                    formatOnDisplay: false,
                    initialCountry: 'in',
                },
                {
                    domain: `${this.environment.server}/${this.environment.env !== 'prod' ? 'hello-new' : 'app'}`,
                }
            );
            setTimeout(() => {
                this.mobileNumber.setValue(this.data.mobile ?? '');
                input.value = this.data.mobile?.toString() ?? '';
            }, 100);
        }
    }

    public testDLT() {
        if (this.mobileNumber.invalid || !this.intlClass?.isValidNumber) {
            this.mobileNumber.markAsTouched();
            return;
        }
        this.isLoading$.next(true);
        this.toast.success('Processing...', { life: 1000 });
        this.smsTemplatesService
            .testDLT({
                ...this.data,
                mobile: this.intlClass.phoneNumber.replace('+', ''),
            })
            .subscribe({
                next: (response) => {
                    if (response?.hasError) {
                        this.toast.error(errorResolver(response.errors)[0]);
                    } else {
                        this.toast.success(response.data, {
                            removeTextDecoration: true,
                        });
                        this.onNoClick();
                    }
                    this.isLoading$.next(false);
                },
                error: (errors: any) => {
                    this.isLoading$.next(false);
                    this.toast.error(errorResolver(errors.errors)[0]);
                },
            });
    }

    public onPaste(event: ClipboardEvent) {
        // Extracted Integer from Pasted Value and set Extracted Value in Input Field
        const extractedValue = event.clipboardData.getData('Text').match(/\d/g)?.join('') ?? '';
        setTimeout(() => {
            this.initContact.nativeElement.value = extractedValue;
            this.mobileNumber.setValue(extractedValue);
            this.mobileNumber.updateValueAndValidity();
        });
    }

    public onNoClick(): void {
        this.dialogRef.close();
    }
}
