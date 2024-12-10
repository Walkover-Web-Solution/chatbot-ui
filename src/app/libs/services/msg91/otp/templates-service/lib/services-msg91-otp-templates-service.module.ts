import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProxyBaseUrls, BaseResponse } from '@msg91/models/root-models';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { TemplatesUrls } from '@msg91/urls/otp';
import { WebhookUrls } from '@msg91/urls/otp';
import { Observable } from 'rxjs';

@NgModule({
    imports: [CommonModule],
})
export class ServicesMsg91OtpTemplatesServiceModule {}

@Injectable({
    providedIn: ServicesMsg91OtpTemplatesServiceModule,
})
export class TemplatesService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.BaseURL) private baseUrl: any
    ) {}

    public getSenderIds(): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(TemplatesUrls.getSenderIds(this.baseUrl));
    }

    public getAllOtpTemplates(requestParam: any): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(TemplatesUrls.getAllOtpTemplate(this.baseUrl), requestParam);
    }

    public addOtpTemplates(postData: any): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, any>>(TemplatesUrls.addOtpTemplate(this.baseUrl), postData);
    }

    public updateOtpTemplates(postData: any): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, any>>(TemplatesUrls.updateOtpTemplate(this.baseUrl), postData);
    }

    public getWebhookUrl(): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(WebhookUrls.getWebhookUrl(this.baseUrl));
    }

    public getWebhookFormates(): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(WebhookUrls.getWebhookFormates(this.baseUrl));
    }

    public deleteWebhookUrl(): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, any>>(WebhookUrls.deleteWebhookUrl(this.baseUrl), {});
    }

    public addWebhookUrl(payload: any): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, any>>(WebhookUrls.addWebhookUrl(this.baseUrl), payload);
    }

    public getTemplateStatusWebhook(): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(WebhookUrls.getTemplateStatusWebhook(this.baseUrl));
    }

    public deleteTemplateStatusWebhook(): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, any>>(WebhookUrls.deleteTemplateStatusWebhook(this.baseUrl), {});
    }

    public addUpdateTemplateStatusWebhook(payload: any): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, any>>(
            WebhookUrls.addUpdateTemplateStatusWebhook(this.baseUrl),
            payload
        );
    }
}
