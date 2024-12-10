import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { tapResponse } from '@ngrx/operators';
import { EMPTY, Observable } from 'rxjs';
import { BaseResponse, errorResolver } from '@msg91/models/root-models';
import { catchError, switchMap } from 'rxjs/operators';
import { PrimeNgToastService } from '@msg91/ui/prime-ng-toast';
import { HttpErrorResponse } from '@angular/common/http';
import { IAuthKeyResData } from '@msg91/models/authkey-models';
import { AuthKeyService } from '@msg91/services/msg91/sms/authkey-service';

export interface AuthKeyDropdownState {
    authKeysInProcess: boolean;
    authKeys: IAuthKeyResData;
    authKeyAccess: any;
    authKeyAccessActionInProcess: boolean;
}

const DEFAULT_STATE: AuthKeyDropdownState = {
    authKeys: null,
    authKeysInProcess: false,
    authKeyAccess: null,
    authKeyAccessActionInProcess: false,
};

@Injectable()
export class AuthKeyDropDownComponentStore extends ComponentStore<AuthKeyDropdownState> {
    readonly authKeys$: Observable<IAuthKeyResData> = this.select((state) => state.authKeys);
    readonly authKeyAccess$: Observable<any> = this.select((state) => state.authKeyAccess);

    readonly authKeysInProcess$: Observable<any> = this.select((state) => state.authKeysInProcess);
    readonly authKeyAccessActionInProcess$: Observable<any> = this.select(
        (state) => state.authKeyAccessActionInProcess
    );

    constructor(
        private toast: PrimeNgToastService,
        private authkeyService: AuthKeyService
    ) {
        super(DEFAULT_STATE);
    }

    readonly getAllAuthenticationKeys = this.effect((data) => {
        return data.pipe(
            switchMap(() => {
                this.patchState({
                    authKeysInProcess: true,
                });
                return this.authkeyService.getAllAuthenticationKeys({ pageNo: 1, limit: 10000 }).pipe(
                    tapResponse(
                        (res: BaseResponse<IAuthKeyResData, null>) => {
                            if (res?.hasError) {
                                this.errorToast(res);
                            }
                            return this.patchState({
                                authKeys: res.data,
                                authKeysInProcess: false,
                            });
                        },
                        (error: HttpErrorResponse) => {
                            this.errorToast(error);
                            return this.patchState({
                                authKeys: { data: [], total_count: 0 },
                                authKeysInProcess: false,
                            });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });

    readonly checkPageAccess = this.effect((data) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ authKeyAccessActionInProcess: true });
                return this.authkeyService.apiPageAccessValidation().pipe(
                    tapResponse(
                        (res: BaseResponse<any, any>) => {
                            if (res?.hasError) {
                                this.errorToast(res);
                            }
                            this.patchState({
                                authKeyAccess: res?.hasError ? null : res.data,
                                authKeyAccessActionInProcess: false,
                            });
                        },
                        (error: HttpErrorResponse) => {
                            this.errorToast(error);
                            this.patchState({
                                authKeyAccessActionInProcess: false,
                                authKeyAccess: null,
                            });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });

    private errorToast(error: any) {
        const errorMessage = errorResolver(error?.errors || error);
        errorMessage.forEach((error) => {
            this.toast.error(error);
        });
    }
}
