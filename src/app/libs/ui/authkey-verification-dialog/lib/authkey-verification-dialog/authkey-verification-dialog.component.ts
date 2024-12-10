import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BaseComponent } from '@msg91/ui/base-component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Observable, skip, takeUntil } from 'rxjs';
import { AuthKeyVerificationComponentStore } from './authkey-verification.store';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DirectivesLoaderButtonModule } from '@msg91/directives/loader-button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PrimeNgToastService } from '@msg91/ui/prime-ng-toast';
import { WIDGET_SCRIPT_JS } from '@msg91/constant';
import { environment } from 'apps/msg91/src/environments/environment';
import { envVariables } from 'apps/msg91/src/environments/env-variables';

declare var initSendOTP: any;

@Component({
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        MatSelectModule,
        ReactiveFormsModule,
        DirectivesLoaderButtonModule,
        MatFormFieldModule,
        MatInputModule,
    ],
    selector: 'msg91-authkey-verification-dialog',
    templateUrl: './authkey-verification-dialog.component.html',
    styleUrls: ['./authkey-verification-dialog.component.scss'],
    providers: [AuthKeyVerificationComponentStore],
})
export class AuthkeyVerificationDialogComponent extends BaseComponent implements OnDestroy {
    public maskedContactFormControl: FormControl = new FormControl('');
    public mobileNumberFormControl: FormControl = new FormControl('');
    public maskedContacts$: Observable<any> = this.componentStore.maskedContacts$;
    public getMaskedContactsInProgress$: Observable<boolean> = this.componentStore.getMaskedContactsInProgress$;
    public verifyAuthKeyInProgress: boolean = false;
    public verifyAuthKeyIsSuccess: boolean = false;

    constructor(
        private dialogRef: MatDialogRef<AuthkeyVerificationDialogComponent>,
        private componentStore: AuthKeyVerificationComponentStore,
        private toast: PrimeNgToastService,
        private changeDetectionRef: ChangeDetectorRef
    ) {
        super();

        this.componentStore.getMaskedOwnerContact();

        this.componentStore.verifyAuthKeyIsSuccess$.pipe(takeUntil(this.destroy$)).subscribe((response) => {
            this.verifyAuthKeyIsSuccess = response;
            if (response) {
                this.changeDetectionRef.detectChanges();
                this.dialogRef.close(true);
            }
        });

        this.componentStore.verifyAuthKeyInProgress$.pipe(skip(1), takeUntil(this.destroy$)).subscribe((response) => {
            this.verifyAuthKeyInProgress = response;
            this.changeDetectionRef.detectChanges();
        });
    }

    /**
     * Matches input mobile number with masked mobile number and shows otp widget if matches
     *
     * @return {*}  {void}
     * @memberof AuthkeyVerificationDialogComponent
     */
    public verifyMobileNumber(): void {
        if (!this.maskedContactFormControl.value || !this.mobileNumberFormControl.value) {
            return;
        }

        const start1 = this.maskedContactFormControl.value?.substring(0, 3); // First 3 characters of masked contact
        const end1 = this.maskedContactFormControl.value?.substring(this.maskedContactFormControl.value?.length - 3); // Last 3 characters of masked contact

        const start2 = this.mobileNumberFormControl.value?.substring(0, 3); // First 3 characters of input mobile number
        const end2 = this.mobileNumberFormControl.value?.substring(this.mobileNumberFormControl.value?.length - 3); // Last 3 characters of input mobile number

        let configuration = {
            widgetId: envVariables.msg91AuthKeyWidgetId,
            tokenAuth: envVariables.msg91AuthKeyToken,
            identifier: '',
            exposeMethods: false,
            success: (data: any) => {
                this.componentStore.verifyAuthkeyPageAccess({
                    token: data?.message,
                    mobile: this.mobileNumberFormControl.value,
                });
            },
        };

        // Check if both starting and ending characters match
        if (start1 === start2 && end1 === end2) {
            configuration.identifier = this.mobileNumberFormControl.value;

            if (window['initSendOTP'] === undefined) {
                let scriptTag = document.createElement('script');
                scriptTag.src = WIDGET_SCRIPT_JS(environment);
                scriptTag.type = 'text/javascript';
                scriptTag.defer = true;
                scriptTag.onload = () => {
                    initSendOTP(configuration);
                };
                document.body.appendChild(scriptTag);
            } else {
                initSendOTP(configuration);
            }
        } else {
            this.toast.error("Mobile number doesn't match.");
        }
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
