import { Component, inject, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { FormArray, FormGroup } from '@angular/forms';
import { ONLY_INTEGER_REGEX } from '@msg91/regex';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Platform } from '@angular/cdk/platform';
import { ConfirmDialogComponent } from '@msg91/ui/confirm-dialog';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { takeUntil, filter, take } from 'rxjs/operators';

type ConfirmDialogSettingType = {
    confirmationMessage: string;
    confirmButtonText: string;
};

@Component({
    template: '',
    standalone: false
})
export abstract class BaseComponent implements OnDestroy {
    private _destroy$: Subject<any>;
    protected _hasUnsavedData: boolean;
    public location: Location = inject(Location);
    private injectedRouter = inject(Router);
    public cdkPlatform = inject(Platform);
    private injectedMatDialog = inject(MatDialog);

    constructor() {
        this._hasUnsavedData = false;
    }

    get destroy$() {
        if (!this._destroy$) {
            this._destroy$ = new Subject();
        }
        return this._destroy$;
    }

    public ngOnDestroy(): void {
        this._hasUnsavedData = false;
        if (this._destroy$) {
            this._destroy$.next(true);
            this._destroy$.complete();
        }
    }

    public makeFormDirty(form: FormGroup | FormArray): void {
        if (form instanceof FormGroup) {
            // tslint:disable-next-line:forin
            for (const controlsKey in form.controls) {
                const control = form.get(controlsKey);
                if (control instanceof FormArray || control instanceof FormGroup) {
                    this.makeFormDirty(control);
                }
                control.markAsTouched();
            }
        } else {
            form.controls.forEach((c) => {
                if (c instanceof FormArray || c instanceof FormGroup) {
                    this.makeFormDirty(c);
                }
                c.markAsTouched();
            });
        }
    }

    public onlyNumber(e: KeyboardEvent): void {
        const inputChar = String.fromCharCode(e.charCode);
        if (e.keyCode !== 8 && !new RegExp(ONLY_INTEGER_REGEX).test(inputChar)) {
            e.preventDefault();
        }
    }

    public hasUnsavedData(): boolean {
        return this._hasUnsavedData;
    }

    public getValueFromObservable(observable: Observable<any>): any {
        let returnValue: any;
        observable.pipe(take(1)).subscribe((value) => (returnValue = value));
        return returnValue;
    }

    /**
     * Navigates back in the platform's history.
     */
    goBackToHistory(redirectTo: string[] = null): void {
        if (redirectTo?.length) {
            this.injectedRouter.navigate(redirectTo);
        } else {
            this.location.back();
        }
    }

    /**
     *
     * @param {MatDialogRef<any>} dialogRef Mat dialog reference
     * @param {Array<any>} forms  used to check user has change the value of forms or not.
     * @param {any} responseToReturn response should be returned on dialog close.
     * @param {ConfirmDialogSettingType} confirmationDialogSetting used to show message and button string on confirmation dialog
     * @param {() => void} callBack call-back call before close dialog
     */
    dialogOnCloseEsc(
        dialogRef: MatDialogRef<any>,
        forms: Array<any> = [],
        responseToReturn: any = {},
        confirmationDialogSetting: ConfirmDialogSettingType = {
            confirmationMessage: 'There are some unsaved changes, do you still want to close ?',
            confirmButtonText: 'Close',
        },
        callBack?: () => void
    ) {
        dialogRef
            ?.keydownEvents()
            .pipe(
                filter((e: KeyboardEvent) => e.code === 'Escape'),
                takeUntil(this.destroy$)
            )
            .subscribe(() => {
                let isUserChangedValue = this.checkIfFormIsDirty(forms);
                if (isUserChangedValue) {
                    this.onCloseConfirmation(dialogRef, responseToReturn, confirmationDialogSetting, callBack);
                } else {
                    if (callBack) {
                        callBack();
                    }
                    dialogRef.close(responseToReturn);
                }
            });
    }

    protected checkIfFormIsDirty(forms: any): any {
        return forms.find((form) => form && form?.dirty);
    }

    /**
     *
     * @param {MatDialogRef<any>} dialogRef Mat dialog reference
     * @param {any} responseToReturn response should be returned on dialog close.
     * @param {ConfirmDialogSettingType} confirmationDialogSetting used to show message and button string on confirmation dialog
     * @param {() => void} callBack call-back call before close dialog
     */
    public onCloseConfirmation(
        dialogRef: MatDialogRef<any>,
        responseToReturn: any,
        confirmationDialogSetting: ConfirmDialogSettingType,
        callBack?: () => void
    ): void {
        const alreadyOpenedConfirmation = this.injectedMatDialog.openDialogs.find((f) =>
            f.componentInstance?.hasOwnProperty('confirmationMessage')
        );
        if (alreadyOpenedConfirmation) {
            return;
        }
        const confirmDialogRef = this.injectedMatDialog.open(ConfirmDialogComponent);
        const componentInstance = confirmDialogRef.componentInstance;
        componentInstance.confirmationMessage = confirmationDialogSetting.confirmationMessage;
        componentInstance.confirmButtonText = confirmationDialogSetting.confirmButtonText;
        confirmDialogRef.afterClosed().subscribe((action) => {
            if (action === 'yes') {
                if (callBack) {
                    callBack();
                }
                dialogRef.close(responseToReturn);
            }
        });
    }
}
