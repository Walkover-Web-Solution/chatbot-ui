import { MatDialog } from '@angular/material/dialog';
import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Optional, Output } from '@angular/core';
import { BaseComponent } from '@msg91/ui/base-component';
import { AuthKeyDropDownComponentStore } from './authkey-dropdown.store';
import { Observable, takeUntil } from 'rxjs';
import { IAuthKeyResData } from '@msg91/models/authkey-models';
import { AuthkeyVerificationDialogComponent } from '@msg91/ui/authkey-verification-dialog';
import { ENVIRONMENT_TOKEN } from '@msg91/constant';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'msg91-authkey-dropdown',
    templateUrl: './authkey-dropdown.component.html',
    providers: [AuthKeyDropDownComponentStore],
})
export class AuthkeyDropdownComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input() public authKeyFormControl: FormControl = new FormControl('');
    @Input() formFieldAppearance: string = 'outline';
    @Input() matFormFieldClass = 'w-100';
    @Output() public authKeySelectionChange = new EventEmitter<any>();

    public authkeys$: Observable<IAuthKeyResData> = this.componentStore.authKeys$;
    public authKeyAccess$: Observable<any> = this.componentStore.authKeyAccess$;
    public authKeysInProcess$: Observable<boolean> = this.componentStore.authKeysInProcess$;
    public authKeyAccessActionInProcess$: Observable<boolean> = this.componentStore.authKeyAccessActionInProcess$;

    constructor(
        @Optional() @Inject(ENVIRONMENT_TOKEN) private environment: any,
        private componentStore: AuthKeyDropDownComponentStore,
        private dialog: MatDialog
    ) {
        super();
    }

    ngOnInit(): void {
        this.componentStore.checkPageAccess();
        this.authKeyAccess$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res && res?.status?.value === 1) {
                this.fetchAuthkey();
            }
        });
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public getAuthkey() {
        const authKeyAccess = this.getValueFromObservable(this.authKeyAccess$);
        if (authKeyAccess?.status?.value) {
            this.fetchAuthkey();
            return;
        }
        if (this.environment.env === 'local') {
            window.open(authKeyAccess?.redirectUrl, '_blank');
        } else {
            const dialogRef = this.dialog.open(AuthkeyVerificationDialogComponent, {
                panelClass: ['mat-dialog', 'mat-dialog-xlg'],
                height: '75vh',
                width: '60vw',
                data: { url: authKeyAccess?.redirectUrl },
                autoFocus: false,
            });

            dialogRef.afterClosed().subscribe((res) => {
                if (res) {
                    this.componentStore.checkPageAccess();
                }
            });
        }
    }

    public fetchAuthkey() {
        this.componentStore.getAllAuthenticationKeys();
    }
}
