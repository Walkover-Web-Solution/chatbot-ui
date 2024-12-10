import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { BaseFilterRequest, BaseResponse, IPaginatedResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { Observable } from 'rxjs';
import { AutomationUrls } from '@msg91/urls/segmento';

@NgModule({
    imports: [ServicesHttpWrapperModule],
})
export class ServicesMsg91SegmentoAutomationsModule {}

@Injectable({
    providedIn: ServicesMsg91SegmentoAutomationsModule,
})
export class AutomationsService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.SegmentoV1BaseURL) private segmentoV1BaseUrl: any
    ) {}

    public getAutomations({
        request,
        bookId,
        segmentId,
    }: {
        request: any;
        bookId: string;
        segmentId?: string;
    }): Observable<BaseResponse<IPaginatedResponse<any[]>, BaseFilterRequest>> {
        let payload = request;
        if (segmentId) {
            payload = {
                ...payload,
                segments: [+segmentId],
            };
        }
        return this.http.post<BaseResponse<IPaginatedResponse<any[]>, BaseFilterRequest>>(
            AutomationUrls.getAutomationsUrl(this.segmentoV1BaseUrl).replace(':phonebookId', bookId),
            payload
        );
    }
}
