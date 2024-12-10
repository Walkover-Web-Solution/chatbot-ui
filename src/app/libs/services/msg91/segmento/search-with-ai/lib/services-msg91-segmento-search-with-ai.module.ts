import { NgModule, Injectable, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { BaseResponse, IPaginatedResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { Observable, of } from 'rxjs';
import { SearchWithAiUrls, SegmentUrls } from '@msg91/urls/segmento';
import {
    AddSegmentSearchByAiQueryReq,
    AllContactsSearchByAiQueryReq,
    IAllSegmentsResModel,
    IGetAllContactResModel,
    IGetAllContactsFilterReq,
    SearchByAiUserJourneyReq,
} from '@msg91/models/segmento-models';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class ServicesMsg91SegmentoSearchWithAiModule {}

@Injectable({
    providedIn: ServicesMsg91SegmentoSearchWithAiModule,
})
export class SearchWithAiService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.SegmentoV1BaseURL) private segmentoV1BaseUrl: any
    ) {}

    public getEventTypes(phoneBookId: number): Observable<BaseResponse<any, null>> {
        return this.http.get<BaseResponse<any, null>>(
            SearchWithAiUrls.getEventTypes(this.segmentoV1BaseUrl).replace(':phoneBookId', phoneBookId.toString())
        );
    }
    public getProducts(phoneBookId: number): Observable<BaseResponse<any, null>> {
        return this.http.get<BaseResponse<any, null>>(
            SearchWithAiUrls.getProducts(this.segmentoV1BaseUrl).replace(':phoneBookId', phoneBookId.toString())
        );
    }

    public getOperators(): Observable<BaseResponse<any, null>> {
        return this.http.get<BaseResponse<any, null>>(SearchWithAiUrls.getOperators(this.segmentoV1BaseUrl));
    }

    public getUserJourney(params: SearchByAiUserJourneyReq, phoneBookId: number) {
        return this.http.post<BaseResponse<any, SearchByAiUserJourneyReq>>(
            SearchWithAiUrls.getUserJourney(this.segmentoV1BaseUrl).replace(':phoneBookId', phoneBookId.toString()),
            params
        );
    }

    public getAllContactsSearchByAiQuery(request: AllContactsSearchByAiQueryReq, phoneBookId: number) {
        return this.http.post<
            BaseResponse<IPaginatedResponse<IGetAllContactResModel[]>, AllContactsSearchByAiQueryReq>
        >(
            SearchWithAiUrls.getAllContactsSearchByAiQuery(this.segmentoV1BaseUrl).replace(
                ':phoneBookId',
                phoneBookId.toString()
            ),
            request
        );
    }

    // need to pass is_ai_query for ai search segment
    public addSegment(
        request: AddSegmentSearchByAiQueryReq,
        phoneBookId: number
    ): Observable<BaseResponse<IAllSegmentsResModel, any>> {
        return this.http.post(
            SegmentUrls.addSegmentUrl(this.segmentoV1BaseUrl).replace(':phoneBookId', phoneBookId.toString()),
            request
        );
    }

    // need to pass is_ai_query for ai search segment
    public updateSegment(
        request: AddSegmentSearchByAiQueryReq,
        phoneBookId: number,
        segmentId: number
    ): Observable<BaseResponse<IAllSegmentsResModel, AddSegmentSearchByAiQueryReq>> {
        return this.http.patch<BaseResponse<IAllSegmentsResModel, AddSegmentSearchByAiQueryReq>>(
            SegmentUrls.updateSegmentUrl(this.segmentoV1BaseUrl)
                .replace(':phoneBookId', phoneBookId.toString())
                .replace(':segmentId', segmentId.toString()),
            request
        );
    }
}
