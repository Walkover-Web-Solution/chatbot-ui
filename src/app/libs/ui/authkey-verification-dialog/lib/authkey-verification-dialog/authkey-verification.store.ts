import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { tapResponse } from '@ngrx/operators';
import { EMPTY, Observable } from 'rxjs';
import { BaseResponse, errorResolver } from '@msg91/models/root-models';
import { catchError, switchMap } from 'rxjs/operators';
import { PrimeNgToastService } from '@msg91/ui/prime-ng-toast';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthKeyService } from '@msg91/services/msg91/sms/authkey-service';
import { MaskedContact, VerifyAuthKey } from '@msg91/models/authkey-models';

interface AuthKeyVerificationState {
    getMaskedContactsInProgress: boolean;
    maskedContacts: any;
    verifyAuthKeyInProgress: boolean;
    verifyAuthKeyIsSuccess: boolean;
}

const DEFAULT_STATE: AuthKeyVerificationState = {
    getMaskedContactsInProgress: false,
    maskedContacts: null,
    verifyAuthKeyInProgress: false,
    verifyAuthKeyIsSuccess: false,
};

@Injectable()
export class AuthKeyVerificationComponentStore extends ComponentStore<AuthKeyVerificationState> {
    constructor(
        private toast: PrimeNgToastService,
        private authkeyService: AuthKeyService
    ) {
        super(DEFAULT_STATE);
    }

    readonly maskedContacts$: Observable<MaskedContact> = this.select((state) => state.maskedContacts);
    readonly getMaskedContactsInProgress$: Observable<boolean> = this.select(
        (state) => state.getMaskedContactsInProgress
    );
    readonly verifyAuthKeyInProgress$: Observable<boolean> = this.select((state) => state.verifyAuthKeyInProgress);
    readonly verifyAuthKeyIsSuccess$: Observable<boolean> = this.select((state) => state.verifyAuthKeyIsSuccess);

    readonly getMaskedOwnerContact = this.effect((data) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({
                    getMaskedContactsInProgress: true,
                    maskedContacts: null,
                    verifyAuthKeyIsSuccess: false,
                });
                return this.authkeyService.getMaskedOwnerContact().pipe(
                    tapResponse(
                        (res: BaseResponse<any, any>) => {
                            if (res?.hasError) {
                                this.errorToast(res);
                            }
                            return this.patchState({
                                maskedContacts: res?.hasError ? null : res.data,
                                getMaskedContactsInProgress: false,
                            });
                        },
                        (error: HttpErrorResponse) => {
                            this.errorToast(error);
                            return this.patchState({
                                getMaskedContactsInProgress: false,
                                maskedContacts: null,
                            });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });

    readonly verifyAuthkeyPageAccess = this.effect((data: Observable<VerifyAuthKey>) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ verifyAuthKeyInProgress: true, verifyAuthKeyIsSuccess: false });
                return this.authkeyService.verifyAuthkeyPageAccess(req).pipe(
                    tapResponse(
                        (res: BaseResponse<any, any>) => {
                            if (res?.hasError) {
                                this.errorToast(res);
                            }
                            return this.patchState({
                                verifyAuthKeyInProgress: false,
                                verifyAuthKeyIsSuccess: true,
                            });
                        },
                        (error: HttpErrorResponse) => {
                            this.errorToast(error);
                            return this.patchState({
                                verifyAuthKeyInProgress: false,
                                verifyAuthKeyIsSuccess: false,
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
