import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProxyBaseUrls, BaseResponse } from '@msg91/models/root-models';
import {
    IGetAllAnalyticsResponse,
    ISMSFailedLogRequestBody,
    ISMSFailedLogs,
    ISMSFailedLogsCount,
    IWidgetLogsRes,
} from '@msg91/models/otp-models';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { LogsUrls } from '@msg91/urls/otp';
import { Observable } from 'rxjs';
import { IEmailLogsReportResponse } from '@msg91/models/report-models';

@NgModule({
    imports: [CommonModule],
})
export class ServicesMsg91OtpLogServiceModule {}

@Injectable({
    providedIn: ServicesMsg91OtpLogServiceModule,
})
export class LogsService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.BaseURL) private baseUrl: any,
        @Inject(ProxyBaseUrls.ReportsUrl) private reportsBaseUrl: any
    ) {}

    public getDeliveryLogs(params: any, selectActiveMicroService: string): Observable<IEmailLogsReportResponse<any>> {
        return this.http.post<IEmailLogsReportResponse<any>>(
            LogsUrls.getDeliveryLogs(this.reportsBaseUrl).replace(':microservice', selectActiveMicroService),
            params
        );
    }

    public exportDeliveryLogs(params: any, selectActiveMicroService: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(
            LogsUrls.exportDeliveryLogs(this.reportsBaseUrl).replace(':microservice', selectActiveMicroService) +
                '?' +
                this.http.objectToParams(params),
            null
        );
    }

    public deliveryDetails(params: any): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, any>>(LogsUrls.deliveryDetails(this.baseUrl), params);
    }

    public deliveryDetailsCount(params: any): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(LogsUrls.deliveryDetailsCount(this.baseUrl), params);
    }

    public resendSmsFromUser(params: any): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(LogsUrls.resendSmsFromUser(this.baseUrl), params);
    }

    public playPauseRequest(params: any): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(LogsUrls.playPauseRequest(this.baseUrl), params);
    }

    public cancelScheduledSms(params: any): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(LogsUrls.cancelScheduledSms(this.baseUrl), params);
    }

    public getAllCampaigns(): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(LogsUrls.getAllCampaigns(this.baseUrl));
    }

    public getSmsRoutes(): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(LogsUrls.getSmsRoutes(this.baseUrl));
    }

    public getFailedLogsStatus(): Observable<BaseResponse<string[], any>> {
        return this.http.get<BaseResponse<string[], any>>(LogsUrls.getFailedLogsStatus(this.baseUrl));
    }

    public getFailedLogs(
        payload: ISMSFailedLogRequestBody
    ): Observable<BaseResponse<ISMSFailedLogs, ISMSFailedLogRequestBody>> {
        return this.http.post<BaseResponse<ISMSFailedLogs, ISMSFailedLogRequestBody>>(
            LogsUrls.getFailedLogs(this.baseUrl),
            payload
        );
    }

    public exportFailedLogs(payload: { codes: number[] }): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, any>>(LogsUrls.exportFailedLogs(this.baseUrl), payload);
    }

    public getAllFailedLogs(): Observable<BaseResponse<ISMSFailedLogsCount[], any>> {
        return this.http.get<BaseResponse<ISMSFailedLogsCount[], any>>(LogsUrls.getFailedApis(this.baseUrl));
    }

    public getOtpWidgetAnalytics(request: any): Observable<IGetAllAnalyticsResponse> {
        return this.http.get<BaseResponse<IGetAllAnalyticsResponse[], any>>(
            LogsUrls.getOtpWidgetAnalytics(this.reportsBaseUrl),
            request
        );
    }

    public exportWidgetLogs(request: any): Observable<{ message: string; status: string }> {
        return this.http.post<BaseResponse<IGetAllAnalyticsResponse[], any>>(
            `${LogsUrls.exportWidgetLogs(this.reportsBaseUrl)}?${this.http.objectToParams(request)}`,
            null
        );
    }

    public exportWidgetAnalytics(request: any): Observable<{ message: string; status: string }> {
        return this.http.post<BaseResponse<IGetAllAnalyticsResponse[], any>>(
            `${LogsUrls.exportWidgetAnalytics(this.reportsBaseUrl)}?${this.http.objectToParams(request)}`,
            null
        );
    }

    public getWidgetLogs(param): Observable<IWidgetLogsRes> {
        return this.http.get<IWidgetLogsRes>(LogsUrls.getWidgetLogs(this.reportsBaseUrl), param);
    }

    public getWidgetName(): Observable<BaseResponse<{ [key: string]: string }, void>> {
        return this.http.get<BaseResponse<{ [key: string]: string }, void>>(LogsUrls.getOtpWidgetNames(this.baseUrl));
    }

    public playSingle301(param: { [key: string]: any }): Observable<any> {
        return this.http.get<any>(LogsUrls.playSingle301(this.baseUrl), param);
    }

    public playAll301(param: { [key: string]: any }): Observable<any> {
        return this.http.get<any>(LogsUrls.playAll301(this.baseUrl), param);
    }
}
