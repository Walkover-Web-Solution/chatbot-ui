import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProxyBaseUrls, BaseResponse } from '@msg91/models/root-models';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { SendSMSUrls } from '@msg91/urls/otp';
import { Observable } from 'rxjs';

@NgModule({
    imports: [CommonModule],
})
export class ServicesMsg91SendSmsModule {}

@Injectable({
    providedIn: ServicesMsg91SendSmsModule,
})
export class SendSmsService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.BaseURL) private baseUrl: any,
        @Inject(ProxyBaseUrls.SegmentoV1BaseURL) private segmentoUrl: any
    ) {}

    public getSenderIds(): Observable<BaseResponse<{ sender_id: string; entity_id: string }[], any>> {
        return this.http.get<BaseResponse<string[], any>>(SendSMSUrls.getSenderIdWithEntity(this.baseUrl));
    }

    public getSendSmsRoutes(): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(SendSMSUrls.getSendSmsRoutes(this.baseUrl));
    }

    public sendSms(payload: any): Observable<BaseResponse<string, any>> {
        return this.http.post<BaseResponse<string, any>>(SendSMSUrls.sendSms(this.baseUrl), payload);
    }

    public sendSMSViaSegmento(
        payload: any,
        phonebookId: number,
        segmetId: number
    ): Observable<BaseResponse<string, any>> {
        return this.http.post<BaseResponse<string, any>>(
            SendSMSUrls.sendSMSViaSegmento(this.segmentoUrl)
                .replace(':phonebookId', String(phonebookId))
                .replace(':segmentoURL:', segmetId ? `segments/${segmetId}/` : ''),
            payload
        );
    }

    public uploadFile(payload: any): Observable<BaseResponse<string, any>> {
        return this.http.post<BaseResponse<string, any>>(SendSMSUrls.uploadFile(this.baseUrl), payload);
    }
}
