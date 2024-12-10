import { Injectable } from '@angular/core';
import { BaseResponse, errorResolver } from '@msg91/models/root-models';
import { IWhatsAppTemplateRequestBody, IWhatsAppTemplateJsonCodeResp } from '@msg91/models/whatsapp-models';
import { WhatsAppService } from '@msg91/services/msg91/whatsapp';
import { PrimeNgToastService } from '@msg91/ui/prime-ng-toast';
import { ComponentStore } from '@ngrx/component-store';
import { tapResponse } from '@ngrx/operators';
import { catchError, EMPTY, exhaustMap, Observable, switchMap } from 'rxjs';

interface IInteractiveMessageSection {
    catalogDetails: any;
}

const DEFAULT_STATE: IInteractiveMessageSection = {
    catalogDetails: null,
};
@Injectable()
export class InteractiveMessageSectionStore extends ComponentStore<IInteractiveMessageSection> {
    constructor(
        private service: WhatsAppService,
        private toast: PrimeNgToastService
    ) {
        super(DEFAULT_STATE);
    }

    public catalogDetails$ = this.select((state) => state.catalogDetails);

    readonly getCatalogDetails = this.effect((data: Observable<any>) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ catalogDetails: null });
                return this.service.getCatalogDetails(req).pipe(
                    tapResponse(
                        (res: BaseResponse<any, any>) => {
                            if (res?.hasError) {
                                this.showErrorToast(res);
                            }
                            return this.patchState({ catalogDetails: res?.data });
                        },
                        (error: any) => {
                            this.showErrorToast(error);
                            return this.patchState({ catalogDetails: null });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });

    private showErrorToast(error: any): void {
        const errorMessage = errorResolver(error?.errors || error);
        errorMessage.forEach((error) => {
            this.toast.error(error);
        });
    }
}
