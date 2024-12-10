import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProxyBaseUrls, BaseResponse, IPaginatedResponse } from '@msg91/models/root-models';
import {
    SendDemoOtpReqModel,
    VerifyDemoOtpReqModel,
    IOTPWidget,
    ICreateEditWidgetReq,
    ICreateEditWidgetRes,
    ISendOTPChannels,
    IOtpWidgetResponse,
    IOtpWidgetCountriesRes,
    IDemoIdentifiersResponse,
    IOTPWebhook,
} from '@msg91/models/otp-models';
import { IPaginationVoiceResponse } from '@msg91/models/voice-models';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { DemoUrls } from '@msg91/urls/otp';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@NgModule({
    imports: [CommonModule],
})
export class ServicesMsg91OtpDemoServiceModule {}

@Injectable({
    providedIn: ServicesMsg91OtpDemoServiceModule,
})
export class DemoService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.BaseURL) private baseURL: any
    ) {}

    public sendDemoOtp(postData: SendDemoOtpReqModel): Observable<BaseResponse<any, SendDemoOtpReqModel>> {
        return this.http.post<BaseResponse<any, SendDemoOtpReqModel>>(DemoUrls.sendDemoOtp(this.baseURL), postData);
    }

    public verifyDemoOtp(postData: VerifyDemoOtpReqModel): Observable<BaseResponse<any, VerifyDemoOtpReqModel>> {
        return this.http.post<BaseResponse<any, VerifyDemoOtpReqModel>>(DemoUrls.verifyDemoOtp(this.baseURL), postData);
    }

    public resendDemoOtpViaCall(postData: SendDemoOtpReqModel): Observable<BaseResponse<any, SendDemoOtpReqModel>> {
        return this.http.post<BaseResponse<any, SendDemoOtpReqModel>>(
            DemoUrls.resendDemoOtpViaCall(this.baseURL),
            postData
        );
    }

    public getAllWidgetIntegrations(request: any): Observable<BaseResponse<any, IOtpWidgetResponse>> {
        return this.http.get<BaseResponse<any, IOTPWidget[]>>(DemoUrls.getAllWidgetIntegrations(this.baseURL), request);
    }

    public addWidgetIntegraion(
        payload: ICreateEditWidgetReq
    ): Observable<BaseResponse<ICreateEditWidgetReq, ICreateEditWidgetRes>> {
        return this.http.post<BaseResponse<ICreateEditWidgetReq, ICreateEditWidgetRes>>(
            DemoUrls.addWidgetIntegraion(this.baseURL),
            payload
        );
    }

    public updateWidgetIntegraion(
        payload: ICreateEditWidgetReq
    ): Observable<BaseResponse<ICreateEditWidgetReq, ICreateEditWidgetRes>> {
        return this.http.put<BaseResponse<ICreateEditWidgetReq, ICreateEditWidgetRes>>(
            DemoUrls.updateWidgetIntegraion(this.baseURL).replace(':widgetId', payload.widget_id),
            payload
        );
    }

    public getChannels(params: any): Observable<BaseResponse<any, ISendOTPChannels>> {
        return this.http.get<BaseResponse<ICreateEditWidgetReq, ISendOTPChannels>>(
            DemoUrls.getChannels(this.baseURL),
            params
        );
    }

    public getWidgetProcess(id: string): Observable<BaseResponse<IOtpWidgetResponse, any>> {
        return this.http.get<BaseResponse<IOtpWidgetResponse, any>>(DemoUrls.getWidgetProcess(this.baseURL) + id);
    }

    public getEmailTemplate(params, keyword?: string): Observable<any> {
        return this.http.get(
            `${this.baseURL}/api/v5/email/templates?status_id=2${keyword ? '&keyword=' + keyword : ''}`,
            params
        );
    }

    public getSMSTemplate(request: any): Observable<any> {
        return this.http.post(`${this.baseURL}${'/api/v5/otp/getAllOtpTemplate'}`, request);
    }

    public getSMSTemplateDetails(id): Observable<any> {
        return this.http.post(`${this.baseURL}${'/api/v5/campaign/getTemplateDetails'}`, { id });
    }

    public getVoiceTemplates(request: any): Observable<BaseResponse<IPaginationVoiceResponse<any[]>, any>> {
        return this.http.get(`${this.baseURL}${'/api/v5/voice/templates/'}`, request).pipe(
            map((res) => {
                const data: BaseResponse<IPaginationVoiceResponse<any[]>, any> = res;
                data.request = request;
                return data;
            })
        );
    }

    public getAllTokensService(params: {
        [key: string]: any;
    }): Observable<BaseResponse<IPaginatedResponse<any[]>, null>> {
        return this.http.get<BaseResponse<any, null>>(`${this.baseURL}/api/v5/otp/getAllTokens`, params);
    }

    public widgetLogAction(status: number, widgetId: string): Observable<any> {
        return this.http.put(`${this.baseURL}/api/v5/otpwidget/api/enableDisableWidgetIntegration/${widgetId}`, {
            status,
        });
    }

    public getCountries(): Observable<BaseResponse<IOtpWidgetCountriesRes, void>> {
        return this.http.get<BaseResponse<IOtpWidgetCountriesRes, void>>(DemoUrls.getCountries(this.baseURL));
    }

    public getDemoIdentifiers(widgetId: string, params: { [key: string]: any }): Observable<any> {
        return this.http.get<BaseResponse<IDemoIdentifiersResponse, any>>(
            DemoUrls.demoIdentifiers(this.baseURL, widgetId),
            params
        );
    }

    public saveDemoIdentifiers(widgetId: string, payload: any): Observable<any> {
        return this.http.post<BaseResponse<IDemoIdentifiersResponse, any>>(
            DemoUrls.demoIdentifiers(this.baseURL, widgetId),
            payload
        );
    }
    public updateDemoIdentifiers(widgetId: string, payload: any): Observable<any> {
        return this.http.put<BaseResponse<IDemoIdentifiersResponse, any>>(
            DemoUrls.demoIdentifiers(this.baseURL, widgetId),
            payload
        );
    }
    public deleteDemoIdentifiers(widgetId: string, demoId: string): Observable<any> {
        return this.http.delete<BaseResponse<IDemoIdentifiersResponse, any>>(
            DemoUrls.deleteDemoIdentifiers(this.baseURL, widgetId, demoId)
        );
    }

    public getOTPWidgetWebhook(widgetId: string): Observable<any> {
        return this.http.get<BaseResponse<IOTPWebhook, any>>(DemoUrls.otpWebhook(this.baseURL, widgetId));
    }
    public saveOTPWidgetWebhook(widgetId: string, payload: any): Observable<any> {
        return this.http.post<BaseResponse<IOTPWebhook, any>>(DemoUrls.otpWebhook(this.baseURL, widgetId), payload);
    }
    public updateOTPWidgetWebhook(widgetId: string, webhookId: string, payload: any): Observable<any> {
        return this.http.put<BaseResponse<IOTPWebhook, any>>(
            DemoUrls.otpWebhook(this.baseURL, widgetId) + `/${webhookId}`,
            payload
        );
    }
    public deleteOTPWidgetWebhook(widgetId: string, webhookId: string): Observable<any> {
        return this.http.delete<BaseResponse<any, any>>(DemoUrls.deleteOTPWebhook(this.baseURL, widgetId, webhookId));
    }
}
