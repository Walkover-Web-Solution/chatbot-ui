import { NgModule, Injectable, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseResponse, INumberSettingsData, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    IWhatsAppNumberResModel,
    IWhatsAppClientTemplatesRespModel,
    IWhatsAppTemplateRequestBody,
    IWhatsAppTemplateJsonCodeResp,
    IWhatsappProfileResModel,
    IClientNumberDropdown,
    IClientLogDropdown,
    ICreateEditWhatsAppTemplateRequestBody,
    AssignFreePlanReq,
    ButtonUrlResponse,
} from '@msg91/models/whatsapp-models';
import { ILogReqModel, ILogRespModel, IReportPercentageRespModel, IReportReqModel } from '@msg91/models/rcs-models';
import { Observable } from 'rxjs';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { CookieService } from 'ngx-cookie-service';
// import { environment } from 'apps/msg91/src/environments/environment';
import { HttpParams } from '@angular/common/http';
import { WhatsAppUrls } from '@msg91/urls/client-whatsapp';
import * as dayjs from 'dayjs';
import { ENVIRONMENT_TOKEN, ENVIRONMENT_TOKEN_NOT_PROVIDED_ERROR, ReportMicroServiceTypeEnums } from '@msg91/constant';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class ServicesMsg91WhatsappModule {}

@Injectable({
    providedIn: ServicesMsg91WhatsappModule,
})
export class WhatsAppService {
    // public token: string;
    constructor(
        private _http: HttpWrapperService,
        @Inject(ProxyBaseUrls.WhatsAppProxy) private whatsAppBaseUrl: string,
        @Inject(ProxyBaseUrls.ReportsUrl) private reportsUrl: string,
        private cookie: CookieService,
        @Inject(ProxyBaseUrls.SubscriptionURLProxy)
        private subscriptionBaseURL: any,
        @Optional() @Inject(ENVIRONMENT_TOKEN) private environment: any
    ) {
        if (!this.environment) {
            throw new Error(ENVIRONMENT_TOKEN_NOT_PROVIDED_ERROR);
        }
        // this.token =
        //     this.environment.env === 'local'
        //         ? 'dzlZL2crbHgrWHdyN05HMnU3bmFsc3VsRkxyUStreVVwd3NRWVpybCtWUT0%3D'
        //         : this.cookie.get('HELLO_APP_HASH');
    }

    generateParam(request: ILogReqModel) {
        let params = new HttpParams();
        if (request.receiver?.length) {
            params = params.append('receiver', request.receiver.toString());
        }
        if (request?.from_date) {
            params = params.append('from_date', parseInt((request.from_date.getTime() / 1000).toString()).toString());
        }
        if (request?.to_date) {
            params = params.append('to_date', parseInt((request.to_date.getTime() / 1000).toString()).toString());
        }
        if (request.failure_reason) {
            params = params.append('failure_reason', request.failure_reason);
        }
        if (request.status) {
            params = params.append('status', request.status);
        }
        if (request.page_number) {
            params = params.append('page_number', request.page_number.toString());
        }
        if (request.page_size) {
            params = params.append('page_size', request.page_size.toString());
        }
        if (+request.direction <= 1) {
            params = params.append('direction', request.direction.toString());
        }
        if (request.receiver) {
            params = params.append('customer_number', request.receiver.toString());
        }
        if (request.whatsapp_number) {
            params = params.append('whatsapp_number', request.whatsapp_number.toString());
        }
        if (request.order_by) {
            params = params.append('orderBy', request.order_by);
        }
        if (request.order_type) {
            params = params.append('orderType', request.order_type);
        }
        if (request.time_zone) {
            params = params.append('time_zone', request.time_zone);
        }
        if (request.usage_type) {
            params = params.append('usage_type', request.usage_type);
        }
        if (request?.customerNumber) {
            params = params.append('customerNumber', request.customerNumber);
        }
        if (request?.requestId) {
            params = params.append('requestId', request.requestId);
        }
        if (request?.limit) {
            params = params.append('limit', request?.limit);
        }
        if (request?.offset >= 0) {
            params = params.append('offset', request?.offset);
        }
        if (request?.paginationToken) {
            params = params.append('paginationToken', request.paginationToken);
        }
        if (request?.startDate) {
            params = params.append('startDate', dayjs(request?.startDate).format('YYYY-MM-DD'));
        }
        if (request?.endDate) {
            params = params.append('endDate', dayjs(request?.endDate).format('YYYY-MM-DD'));
        }
        if (request?.integratedNumber) {
            params = params.append('integratedNumber', request?.integratedNumber);
        }
        if (request?.timeZone) {
            params = params.append('timeZone', request?.timeZone);
        }
        if (request?.campaignName) {
            params = params.append('campaignName', request?.campaignName);
        }

        return params;
    }

    getWhatsAppLog(request: ILogReqModel): Observable<BaseResponse<ILogRespModel, ILogReqModel>> {
        return this._http.get<BaseResponse<ILogRespModel, ILogReqModel>>(
            WhatsAppUrls.getWhatsAppLog(this.reportsUrl),
            this.generateParam(request)
        );
    }

    getWhatsAppPercentageReport(
        request: IReportReqModel
    ): Observable<BaseResponse<IReportPercentageRespModel, IReportReqModel>> {
        const from_date = parseInt((request.from_date.getTime() / 1000).toString()).toString();
        const to_date = parseInt((request.to_date.getTime() / 1000).toString()).toString();
        const newUrl = WhatsAppUrls.getWhatsAppPercentageReport(this.whatsAppBaseUrl)
            .replace(':fromDate', from_date)
            .replace(':toDate', to_date);
        return this._http.post<BaseResponse<IReportPercentageRespModel, IReportReqModel>>(newUrl, {});
    }

    getWhatsAppNumbers(request: any): Observable<BaseResponse<IWhatsAppNumberResModel[], any>> {
        return this._http.get<BaseResponse<IWhatsAppNumberResModel[], any>>(
            WhatsAppUrls.getWhatsAppNumbers(this.whatsAppBaseUrl),
            request
        );
    }

    updateNumberRetryStatus(request: { id: number; outbound_retry: 1 | 0 }): Observable<BaseResponse<any, any>> {
        return this._http.patch<BaseResponse<any, any>>(
            WhatsAppUrls.getWhatsAppNumbers(this.whatsAppBaseUrl) + request?.id,
            {
                outbound_retry: request.outbound_retry,
            }
        );
    }

    getWebhookDisplayData(): Observable<BaseResponse<any, any>> {
        return this._http.get<BaseResponse<any, any>>(WhatsAppUrls.getWebhookDisplayData(this.whatsAppBaseUrl));
    }

    updateWhatsAppNumber(request: any, id): Observable<BaseResponse<IWhatsAppNumberResModel, any>> {
        return this._http.put<BaseResponse<IWhatsAppNumberResModel, any>>(
            WhatsAppUrls.updateWhatsAppNumbersSetting(this.whatsAppBaseUrl).replace(':id', id),
            request
        );
    }

    createWhatsAppNumber(request: any): Observable<BaseResponse<IWhatsAppNumberResModel, any>> {
        return this._http.post<BaseResponse<IWhatsAppNumberResModel, any>>(
            WhatsAppUrls.createWhatsAppNumbers(this.whatsAppBaseUrl),
            request
        );
    }

    getAllWhatsAppNumbers(): Observable<BaseResponse<string[], any>> {
        return this._http.get<BaseResponse<string[], any>>(WhatsAppUrls.getAllWhatsAppNumbers(this.whatsAppBaseUrl));
    }

    syncTemplateWithFB(phoneNumber: string): Observable<BaseResponse<IWhatsAppClientTemplatesRespModel[], string>> {
        return this._http.get<BaseResponse<IWhatsAppClientTemplatesRespModel[], string>>(
            WhatsAppUrls.syncTemplateWithFB(this.whatsAppBaseUrl).replace(':phoneNumber', phoneNumber)
        );
    }

    syncTemplate(phoneNumber: string): Observable<BaseResponse<IWhatsAppClientTemplatesRespModel[], string>> {
        return this._http.get<BaseResponse<IWhatsAppClientTemplatesRespModel[], string>>(
            WhatsAppUrls.syncTemplate(this.whatsAppBaseUrl).replace(':phoneNumber', phoneNumber)
        );
    }

    getTemplateDetails(phoneNumber: string): Observable<BaseResponse<IWhatsAppClientTemplatesRespModel[], string>> {
        return this._http.get<BaseResponse<IWhatsAppClientTemplatesRespModel[], string>>(
            WhatsAppUrls.getTemplateDetails(this.whatsAppBaseUrl).replace(':phoneNumber', phoneNumber)
        );
    }

    getTemplateAnalyticsData(phoneNumber: string): Observable<BaseResponse<any, string>> {
        return this._http.get<BaseResponse<any, string>>(WhatsAppUrls.getTemplateAnalyticsData(this.reportsUrl));
    }

    getTemplateJsonDetails(
        payload: IWhatsAppTemplateRequestBody
    ): Observable<BaseResponse<IWhatsAppTemplateJsonCodeResp, any>> {
        return this._http.post<BaseResponse<IWhatsAppTemplateJsonCodeResp, any>>(
            WhatsAppUrls.getTemplateJsonDetails(this.whatsAppBaseUrl),
            payload
        );
    }

    getCatalogueData(payload: {
        integrated_number: string;
    }): Observable<BaseResponse<IWhatsAppTemplateJsonCodeResp, any>> {
        return this._http.get<BaseResponse<IWhatsAppTemplateJsonCodeResp, any>>(
            WhatsAppUrls.getCatalogueData(this.whatsAppBaseUrl),
            payload
        );
    }

    getTemplateBulkJsonDetails(
        payload: IWhatsAppTemplateRequestBody
    ): Observable<BaseResponse<IWhatsAppTemplateJsonCodeResp, any>> {
        return this._http.post<BaseResponse<IWhatsAppTemplateJsonCodeResp, any>>(
            WhatsAppUrls.getTemplateBulkJsonDetails(this.whatsAppBaseUrl),
            payload
        );
    }

    exportLog(request: ILogReqModel): Observable<BaseResponse<string, ILogReqModel>> {
        const convertToQueryParam = this._http.objectToParams(request);
        const url =
            WhatsAppUrls.exportLogs(this.reportsUrl).replace(':serviceType', ReportMicroServiceTypeEnums.Whatsapp) +
            '?' +
            convertToQueryParam;
        return this._http.post(url, null);
    }

    exportFailedLogs(params: any): Observable<any> {
        const convertToQueryParam = this._http.objectToParams(params);
        const url =
            WhatsAppUrls.exportLogs(this.reportsUrl).replace(':serviceType', ReportMicroServiceTypeEnums.Whatsapp) +
            '?' +
            convertToQueryParam;
        return this._http.post(url, null);
    }

    getWhatsAppProfile(request: any): Observable<BaseResponse<IWhatsappProfileResModel, any>> {
        return this._http.get<BaseResponse<IWhatsappProfileResModel, any>>(
            WhatsAppUrls.whatsAppProfileSetting(this.whatsAppBaseUrl).replace(':integratedNumber', request?.number)
        );
    }

    getWhatsappLogTimezone(): Observable<BaseResponse<string[], any>> {
        return this._http.get<BaseResponse<string[], any>>(WhatsAppUrls.getWhatsappLogTimezone(this.whatsAppBaseUrl));
    }

    updateWhatsAppProfile(payload: any, id: string): Observable<BaseResponse<IWhatsappProfileResModel, any>> {
        return this._http.post<BaseResponse<IWhatsappProfileResModel, any>>(
            WhatsAppUrls.whatsAppProfileSetting(this.whatsAppBaseUrl).replace(':integratedNumber', id),
            payload
        );
    }

    getUsageType(): Observable<BaseResponse<string[], any>> {
        return this._http.get<BaseResponse<string[], any>>(WhatsAppUrls.getUsageType(this.whatsAppBaseUrl));
    }

    getLogDropDownData(): Observable<BaseResponse<IClientLogDropdown, any>> {
        return this._http.get<BaseResponse<IClientLogDropdown, any>>(
            WhatsAppUrls.getLogDropDownData(this.whatsAppBaseUrl)
        );
    }

    getNumberDropDownData(): Observable<BaseResponse<IClientNumberDropdown, any>> {
        return this._http.get<BaseResponse<IClientNumberDropdown, any>>(
            WhatsAppUrls.getNumberDropDownData(this.whatsAppBaseUrl)
        );
    }

    getFailedLogs(params: any): Observable<BaseResponse<ILogRespModel, ILogReqModel>> {
        return this._http.get<BaseResponse<ILogRespModel, ILogReqModel>>(
            WhatsAppUrls.getFailedLogs(this.reportsUrl),
            params
        );
    }

    getWhatsAppSystemUserAccessToken(payload: any): Observable<BaseResponse<string, any>> {
        return this._http.get<BaseResponse<string, any>>(
            WhatsAppUrls.getWhatsAppSystemUserAccessToken(this.whatsAppBaseUrl),
            payload
        );
    }

    getWhatsAppStatus(): Observable<
        BaseResponse<
            {
                has_whatsapp_integration: boolean;
                integrated_360_numbers: string[];
                integrated_fb_cloud_numbers: string[];
                integrated_numbers_with_templates: string[];
            },
            any
        >
    > {
        return this._http.get(WhatsAppUrls.getWhatsAppStatus(this.whatsAppBaseUrl));
    }

    getLanguageList(): Observable<BaseResponse<{ [key: string]: string }, any>> {
        return this._http.get<BaseResponse<{ [key: string]: string }, any>>(
            WhatsAppUrls.getLanguageList(this.whatsAppBaseUrl)
        );
    }

    buttonUrlData(params: { [key: string]: string } = {}): Observable<BaseResponse<ButtonUrlResponse, any>> {
        return this._http.get<BaseResponse<ButtonUrlResponse, any>>(
            WhatsAppUrls.buttonUrlData(this.whatsAppBaseUrl),
            params
        );
    }

    getWhatsappCategories(): Observable<BaseResponse<Array<string>, void>> {
        return this._http.get<BaseResponse<Array<string>, void>>(
            WhatsAppUrls.getWhatsappCategories(this.whatsAppBaseUrl)
        );
    }

    createTemplate(request: ICreateEditWhatsAppTemplateRequestBody): Observable<BaseResponse<any, any>> {
        return this._http.post<BaseResponse<any, any>>(WhatsAppUrls.createTemplate(this.whatsAppBaseUrl), request);
    }

    editTemplate(
        templateId: string,
        request: ICreateEditWhatsAppTemplateRequestBody
    ): Observable<BaseResponse<any, any>> {
        return this._http.put<BaseResponse<any, any>>(
            WhatsAppUrls.editTemplate(this.whatsAppBaseUrl).replace(':templateId', templateId),
            request
        );
    }

    deleteTemplate(params: {
        integrated_number: string;
        template_name: string;
        template_id?: string;
    }): Observable<BaseResponse<any, any>> {
        return this._http.delete<Observable<BaseResponse<any, any>>>(
            WhatsAppUrls.createTemplate(this.whatsAppBaseUrl) + `?${this._http.objectToParams(params)}`
        );
    }
    /**
     * Subscribes to the plan
     *
     * @param {AssignFreePlanReq} payload Plan related details
     * @return {Observable<any>} Observable to carry out further operations
     * @memberof WhatsAppService
     */
    public assignFreePlan(payload: AssignFreePlanReq): Observable<any> {
        return this._http.post<any>(WhatsAppUrls.assignFreePlan(this.subscriptionBaseURL), payload);
    }

    public uploadWhatsappTemplateMedia(payload: FormData): Observable<BaseResponse<{ url: string }, any>> {
        return this._http.post<BaseResponse<{ url: string }, any>>(
            WhatsAppUrls.uploadWhatsappTemplateMedia(this.whatsAppBaseUrl),
            payload
        );
    }

    public connectCatalogue(payload: any): Observable<any> {
        return this._http.post<any>(WhatsAppUrls.connectCatalogue(this.whatsAppBaseUrl), payload);
    }

    public sendWhatsApp(payload: { [key: string]: any }): Observable<BaseResponse<string, any>> {
        return this._http.post<BaseResponse<string, any>>(WhatsAppUrls.whatsappBulkSend(this.whatsAppBaseUrl), payload);
    }

    public getCatalogDetails(params: { [key: string]: any }): Observable<BaseResponse<any, any>> {
        return this._http.get<BaseResponse<any, any>>(WhatsAppUrls.getCatalogDetails(this.whatsAppBaseUrl), params);
    }

    public getNumbersSettings(
        number: string,
        params: { [key: string]: any } = {}
    ): Observable<BaseResponse<INumberSettingsData, any>> {
        return this._http.get<BaseResponse<INumberSettingsData, any>>(
            `${WhatsAppUrls.getNumbersSettings(this.whatsAppBaseUrl)}${number}/`,
            params
        );
    }

    public setNumbersSettings(
        number: string,
        payload: INumberSettingsData
    ): Observable<BaseResponse<INumberSettingsData, any>> {
        return this._http.post<BaseResponse<INumberSettingsData, any>>(
            `${WhatsAppUrls.getNumbersSettings(this.whatsAppBaseUrl)}${number}/`,
            payload
        );
    }
}
