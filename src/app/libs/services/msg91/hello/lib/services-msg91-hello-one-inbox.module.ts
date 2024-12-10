import { Inject, Injectable, NgModule } from '@angular/core';
import { PreviewType } from '@msg91/models/campaign-models';
import { BaseResponse, MicroserviceBaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    IWhatsAppClientTemplatesRespModel,
    IWhatsAppTemplateJsonCodeResp,
    IWhatsAppTemplateRequestBody,
} from '@msg91/models/whatsapp-models';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { OneInboxUrls } from '@msg91/urls/hello';
import { ComponentStore } from '@ngrx/component-store';
import { BehaviorSubject, Observable, take } from 'rxjs';

@NgModule({})
export class ServicesMsg91HelloOneInboxModule {}

@Injectable({
    providedIn: ServicesMsg91HelloOneInboxModule,
})
export class OneInboxService extends ComponentStore<IOneInboxState> {
    public options = {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'One-Inbox': 'true',
        },
        withCredentials: false,
        noNeedToAddProxy: true,
    };
    // public fetchInboxList = new BehaviorSubject<boolean>(false);
    public oneInboxData = new BehaviorSubject<any>(null);
    public isOneInboxViewActive = new BehaviorSubject<boolean>(false);
    public activeOneInboxId = new BehaviorSubject<number>(null);

    readonly fetchInboxList$: Observable<boolean> = this.select((x) => x?.fetchInboxList);

    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.HelloBaseURL) private helloBaseUrl: string
    ) {
        super({
            fetchInboxList: false,
        });

        this.isOneInboxViewActive.subscribe((res) => {
            this.http.isOneInboxViewActive.next(res);
        });

        this.activeOneInboxId.subscribe((res) => {
            this.http.activeOneInboxId.next(res);
        });
    }

    readonly setFetchInboxListStatus = this.updater((state: IOneInboxState, status: boolean) => ({
        ...state,
        fetchInboxList: status,
    }));

    public getOneInboxList(params: { [key: string]: any } = {}): Observable<MicroserviceBaseResponse<any, any>> {
        return this.http.get(OneInboxUrls.getOneInboxList(this.helloBaseUrl), params, this.options);
    }

    public addOneInbox(payload: any): Observable<MicroserviceBaseResponse<any, any>> {
        return this.http.post(OneInboxUrls.addOneInbox(this.helloBaseUrl), payload, this.options);
    }

    public deleteOneInbox(id: any): Observable<MicroserviceBaseResponse<any, any>> {
        let options = {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'One-Inbox': 'true',
            },
            withCredentials: false,
            noNeedToAddProxy: true,
        };
        return this.http.delete(OneInboxUrls.addOneInbox(this.helloBaseUrl) + `?one_inbox_id=${id}`, {}, options);
    }

    public getWhatsAppTemplateDetails(
        phoneNumber: string,
        oneInboxId: string,
        params: any = {}
    ): Observable<BaseResponse<IWhatsAppClientTemplatesRespModel[], string>> {
        let options = {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'One-Inbox': oneInboxId,
            },
            withCredentials: false,
            noNeedToAddProxy: true,
        };
        return this.http.get<BaseResponse<IWhatsAppClientTemplatesRespModel[], string>>(
            `${OneInboxUrls.getWhatsAppTemplateDetails(this.helloBaseUrl)}`.replace(':phoneNumber', phoneNumber),
            { ...params, one_inbox_id: oneInboxId },
            options
        );
    }

    public getTemplateDetails(requestObj: {
        previewType: PreviewType;
        template_id: string;
        language?: string;
        integrated_number?: string;
        one_inbox_id?: string;
    }): Observable<BaseResponse<any, any>> {
        let options = {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'One-Inbox': requestObj.one_inbox_id,
            },
            withCredentials: false,
            noNeedToAddProxy: true,
        };
        return this.http.get(
            OneInboxUrls.getWhatsappTemplateDetails(this.helloBaseUrl).replace(
                ':phoneNumber',
                requestObj.integrated_number
            ),
            {
                template_name: requestObj.template_id,
                template_language: requestObj.language,
                one_inbox_id: requestObj.one_inbox_id,
            },
            options
        );
    }

    getTemplateJsonDetails(
        payload: IWhatsAppTemplateRequestBody
    ): Observable<BaseResponse<IWhatsAppTemplateJsonCodeResp, any>> {
        let options = {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'One-Inbox': payload.one_inbox_id,
            },
            withCredentials: false,
            noNeedToAddProxy: true,
        };
        return this.http.post<BaseResponse<IWhatsAppTemplateJsonCodeResp, any>>(
            OneInboxUrls.getTemplateJsonDetails(this.helloBaseUrl),
            payload,
            options
        );
    }
}

interface IOneInboxState {
    fetchInboxList: boolean;
}
