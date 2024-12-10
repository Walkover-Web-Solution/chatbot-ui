import { CommonModule } from '@angular/common';
import { Inject, Injectable, NgModule, Optional } from '@angular/core';
import { ENVIRONMENT_TOKEN, ENVIRONMENT_TOKEN_NOT_PROVIDED_ERROR, HELLO_API_URL } from '@msg91/constant';
import { PreviewType } from '@msg91/models/campaign-models';
import { BaseFilterRequest, BaseResponse, IPaginatedResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    IAllSegmentsResModel,
    IGetAllContactResModel,
    IGetAllContactsFilterReq,
    IGetAllInboxResModel,
    IGetAllPhoneBookResModel,
    IGetCustomAttributeResModel,
    ISegmentGetAllCampaignReqModel,
} from '@msg91/models/segmento-models';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { SegmentoUrls } from '@msg91/urls/compose';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@NgModule({
    imports: [CommonModule],
})
export class ServicesMsg91ComposeModule {}

@Injectable({ providedIn: ServicesMsg91ComposeModule })
export class ComposeService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.BaseURL) private baseUrl: any,
        @Inject(ProxyBaseUrls.BaseServer) private baseServerUrl: any,
        @Inject(ProxyBaseUrls.CampaignProxy) private campaignsBaseUrl: any,
        @Inject(ProxyBaseUrls.SegmentoBaseURL) private segmentoBaseUrl: any,
        @Inject(ProxyBaseUrls.SegmentoV1BaseURL) private segmentoV1BaseUrl: any,
        @Inject(ProxyBaseUrls.SegmentoMsg91BasePath) private segmentoMsg91BasePath: any,
        @Inject(ProxyBaseUrls.EmailProxy) private emailBaseUrl: any,
        @Inject(ProxyBaseUrls.WhatsAppProxy) private whatsappBaseUrl: any,
        @Optional() @Inject(ENVIRONMENT_TOKEN) private environment: any
    ) {
        if (!this.environment) {
            throw new Error(ENVIRONMENT_TOKEN_NOT_PROVIDED_ERROR);
        }
    }

    public getAllPhoneBook(request: any): Observable<BaseResponse<IGetAllPhoneBookResModel[], null>> {
        return this.http.get(SegmentoUrls.getAllPhoneBooksUrl(this.segmentoBaseUrl), request).pipe(
            map((res) => {
                const data: BaseResponse<IGetAllPhoneBookResModel[], null> = res;
                data.request = request;
                return data;
            })
        );
    }

    public getSegments(
        request: BaseFilterRequest,
        phoneBookId: number
    ): Observable<BaseResponse<IPaginatedResponse<IAllSegmentsResModel[]>, BaseFilterRequest>> {
        return this.http.get<BaseResponse<IPaginatedResponse<IAllSegmentsResModel[]>, BaseFilterRequest>>(
            SegmentoUrls.getSegmentsUrl(this.segmentoV1BaseUrl).replace(':phoneBookId', phoneBookId.toString()),
            { ...request, ui_view: 1 }
        );
    }

    public getAllInboxes(request: any): Observable<BaseResponse<IGetAllInboxResModel, null>> {
        return this.http.get(SegmentoUrls.getAllInboxesUrl(HELLO_API_URL(this.environment)), request).pipe(
            map((res) => {
                const data: BaseResponse<IGetAllInboxResModel, null> = res;
                data.request = request;
                return data;
            })
        );
    }

    public getCampaigns(
        request: any
    ): Observable<BaseResponse<IPaginatedResponse<ISegmentGetAllCampaignReqModel[]>, null>> {
        return this.http.get<BaseResponse<IPaginatedResponse<ISegmentGetAllCampaignReqModel[]>, null>>(
            SegmentoUrls.getSegmentoCampaignListsUrl(this.campaignsBaseUrl),
            request
        );
    }

    public getFields(request: number): Observable<BaseResponse<IGetCustomAttributeResModel[], number>> {
        return this.http.get<BaseResponse<IGetCustomAttributeResModel[], number>>(
            SegmentoUrls.getCustomAttributesUrl(this.segmentoBaseUrl).replace(':phoneBookId', request.toString())
        );
    }

    public getAllContacts(
        params: IGetAllContactsFilterReq,
        phoneBookId: number
    ): Observable<BaseResponse<IPaginatedResponse<IGetAllContactResModel[]>, IGetAllContactsFilterReq>> {
        return this.http.post<BaseResponse<IPaginatedResponse<IGetAllContactResModel[]>, IGetAllContactsFilterReq>>(
            SegmentoUrls.getAllContactsUrl(this.segmentoV1BaseUrl).replace(':phoneBookId', phoneBookId.toString()),
            { ...params, ui_view: true }
        );
    }

    public getCampaignFields(request: { slug: string; sync?: boolean }): Observable<BaseResponse<any, string>> {
        const params = request.sync !== undefined ? { sync: request.sync, source: 'launchCampaign' } : undefined;
        return this.http.get<BaseResponse<any, string>>(
            SegmentoUrls.getCampaignFieldsUrl(this.campaignsBaseUrl).replace(':slug', request.slug),
            params
        );
    }

    public getCampaignNodeTemplateIds(request: { slug: string }): Observable<BaseResponse<any, string>> {
        return this.http.get(SegmentoUrls.getCampaignTemplates(this.campaignsBaseUrl).replace(':slug', request.slug));
    }

    public getTemplateDetails(requestObj: {
        previewType: PreviewType;
        template_id: string;
        language?: string;
        integrated_number?: string;
    }): Observable<BaseResponse<any, any>> {
        switch (requestObj.previewType) {
            case PreviewType.Email:
                return this.http.get(SegmentoUrls.getEmailTemplateDetails(this.emailBaseUrl), {
                    with: 'activeVersion',
                    keyword: requestObj.template_id,
                });
            case PreviewType.Sms:
                return this.http.post(SegmentoUrls.getSmsTemplateDetails(this.baseUrl), {
                    search: requestObj.template_id,
                });
            case PreviewType.Whatsapp:
                return this.http.get(
                    SegmentoUrls.getWhatsappTemplateDetails(this.whatsappBaseUrl).replace(
                        ':number',
                        requestObj.integrated_number
                    ),
                    {
                        template_name: requestObj.template_id,
                        template_language: requestObj.language,
                    }
                );
            default:
                break;
        }
    }

    public runCampaign(
        payload: any,
        phoneBookId: string,
        segmentId: string,
        queryParams: { [key: string]: any }
    ): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, any>>(
            `${SegmentoUrls.runCampaignUrl(this.segmentoV1BaseUrl, phoneBookId, segmentId)}?${this.http.objectToParams(
                queryParams
            )}`,
            payload
        );
    }

    /**
     * Runs the campaign for a CSV
     *
     * @param {FormData} formData Form data
     * @param {string} campaignSlug Slug of the campaign to be run
     * @return {Observable<BaseResponse<any, any>>} Observable to carry out further operation
     * @memberof ComposeService
     */
    public runCampaignWithCsv(
        formData: FormData,
        campaignSlug: string,
        queryParams: { [key: string]: any }
    ): Observable<BaseResponse<any, any>> {
        let url = this.baseServerUrl + '/api/v5/campaign/api';
        return this.http.post(
            `${SegmentoUrls.runCampaignWithCsv(url).replace(':slug', campaignSlug)}?${this.http.objectToParams(
                queryParams
            )}`,
            formData
        );
    }

    public dryRunCampaign(slug: string, payload: any): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, any>>(
            SegmentoUrls.dryRunCampaignUrl(this.campaignsBaseUrl).replace(':slug', slug),
            payload
        );
    }

    public segmentoRegisterUser(): Observable<BaseResponse<any, any>> {
        return this.http.post(SegmentoUrls.segmentoRegisterUser(this.segmentoMsg91BasePath), {
            request: { 'service': 'segmento' },
        });
    }

    public getTwitterIntegrationDetails(): Observable<BaseResponse<any, any>> {
        return this.http.get(SegmentoUrls.getTwitterIntegrationDetails(HELLO_API_URL(this.environment)));
    }

    public getTwitterUsersData(payload: any): Observable<BaseResponse<any, any>> {
        return this.http.get(SegmentoUrls.getTwitterUsersData(HELLO_API_URL(this.environment)), payload);
    }

    public getLongcodeNumberIntegrationDetails(): Observable<BaseResponse<any, any>> {
        return this.http.get(SegmentoUrls.getLongCodeNumberIntegrationDetails(HELLO_API_URL(this.environment)));
    }
}
