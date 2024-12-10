import { Inject, Injectable } from '@angular/core';
import { VoiceLibServiceModule } from './voice.module';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { IVoicePricingCountry, IVoicePricingResponse } from './models/pricing.vm';
import { Observable } from 'rxjs';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { URLS } from './models/api-urls';

@Injectable({
    providedIn: VoiceLibServiceModule,
})
export class VoicePricingService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.VoiceBaseURL) private voiceBaseUrl: any
    ) {}

    getCountries(): Observable<Array<IVoicePricingCountry>> {
        return this.http.get(`${this.voiceBaseUrl}${URLS.PRICING.GET_COUNTRIES}`);
    }
    getDialPlans(req: any): Observable<BaseResponse<{ dialplan_id: number }, any>> {
        return this.http.get(`${this.voiceBaseUrl}${URLS.PRICING.GET_DIAL_PLANS}`, req);
    }
    getPricing(req: {
        cid: number;
        dialplan_id: number;
    }): Observable<BaseResponse<Array<IVoicePricingResponse>, { cid: number; dialplan_id: number }>> {
        return this.http.get(`${this.voiceBaseUrl}${URLS.PRICING.GET_PRICING}`, req);
    }
    getUrlObservable(req: {
        cid: number;
        dialplan_id: number;
        export: number;
    }): Observable<Array<IVoicePricingCountry>> {
        return this.http.get(`${this.voiceBaseUrl}${URLS.PRICING.GET_URL}`, req);
    }
}
