import { Injectable, NgModule, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { BaseResponse, IPaginatedEmailResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { Observable } from 'rxjs';
import { dmarcUrls } from '@msg91/urls/email/dmarc';
import {
    IDMARCDomain,
    IDMARCDomainUpdateReq,
    IDMARCFilterData,
    IVolumeDistributionData,
} from '@msg91/models/email-models';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class ServicesMsg91EmailDMARCModule {}

@Injectable({
    providedIn: ServicesMsg91EmailDMARCModule,
})
export class DMARCService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.EmailProxy) private emailBaseUrl: any
    ) {}

    public getDMARCDomainUrl(payload: any): Observable<BaseResponse<IPaginatedEmailResponse<IDMARCDomain[]>, any>> {
        return this.http.get<BaseResponse<IPaginatedEmailResponse<IDMARCDomain[]>, any>>(
            dmarcUrls.getDMARCDomainUrl(this.emailBaseUrl),
            payload
        );
    }

    public createDMARCDomainUrl(paylaod: {
        domain: string;
    }): Observable<BaseResponse<IDMARCDomain, { domain: string }>> {
        return this.http.post<BaseResponse<IDMARCDomain, { domain: string }>>(
            dmarcUrls.createDMARCDomainUrl(this.emailBaseUrl),
            paylaod
        );
    }

    public updateDMARCDomainUrl(
        payload: IDMARCDomainUpdateReq,
        id: number
    ): Observable<BaseResponse<void, IDMARCDomainUpdateReq>> {
        return this.http.put<BaseResponse<void, IDMARCDomainUpdateReq>>(
            dmarcUrls.updateDMARCDomainUrl(this.emailBaseUrl).replace(':id', String(id)),
            payload
        );
    }

    public getDMARCAnalyticsUrl(payload: any): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, any>>(dmarcUrls.getDMARCAnalyticsUrl(this.emailBaseUrl), payload);
    }

    public getDMARCVolumeDistributionUrl(payload: any): Observable<BaseResponse<IVolumeDistributionData[], any>> {
        return this.http.post<BaseResponse<IVolumeDistributionData[], any>>(
            dmarcUrls.getDMARCVolumeDistributionUrl(this.emailBaseUrl),
            payload
        );
    }

    public verifyDMARCDomain(payload: { domain: string }): Observable<BaseResponse<IDMARCDomain, { domain: string }>> {
        return this.http.post<BaseResponse<IDMARCDomain, { domain: string }>>(
            dmarcUrls.verifyDMARCDomainUrl(this.emailBaseUrl),
            payload
        );
    }

    public fetchDMARCFilterData(payload: {
        dmarc_domain_id: number;
    }): Observable<BaseResponse<IDMARCFilterData, { dmarc_domain_id: number }>> {
        return this.http.get<BaseResponse<IDMARCFilterData, { dmarc_domain_id: number }>>(
            dmarcUrls.fetchDMARCFilterDataUrl(this.emailBaseUrl),
            payload
        );
    }
}
