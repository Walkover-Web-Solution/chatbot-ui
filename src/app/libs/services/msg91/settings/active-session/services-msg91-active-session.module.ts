import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { BaseFilterRequest, BaseResponse, IPaginatedResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { Observable } from 'rxjs';
import { ActiveSessionUrls } from '@msg91/urls/settings/activeSession';
import { IActiveSession } from '@msg91/models/setting-models';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class ServicesMsg91ActiveSessionModule {}

@Injectable({
    providedIn: ServicesMsg91ActiveSessionModule,
})
export class ActiveSessionService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.BaseURL) private baseUrl: any
    ) {}

    public getAllActiveSessionService(
        request: BaseFilterRequest
    ): Observable<BaseResponse<IPaginatedResponse<IActiveSession[]>, BaseFilterRequest>> {
        return this.http.post<BaseResponse<IPaginatedResponse<IActiveSession[]>, BaseFilterRequest>>(
            ActiveSessionUrls.getAllActiveSessionUrl(this.baseUrl),
            request
        );
    }

    public logoutSelectedSessionsService(request: {
        sessionId: number[];
    }): Observable<BaseResponse<number[], { sessionId: number[] }>> {
        return this.http.post<BaseResponse<number[], { sessionId: number[] }>>(
            ActiveSessionUrls.logoutSelectedSessionsUrl(this.baseUrl),
            request
        );
    }
}
