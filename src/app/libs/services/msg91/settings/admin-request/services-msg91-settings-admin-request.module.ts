import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { BaseResponse, IPaginatedResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    AdminLoginRequestResModel,
    DeclinedAminLoginReqModel,
    ApproveAdminLoginReqModel,
} from '@msg91/models/setting-models';
import { AdminRequestUrls } from '@msg91/urls/settings/adminRequest';

@NgModule({
    imports: [CommonModule],
})
export class ServicesMsg91SettingsAdminRequestModule {}

@Injectable({
    providedIn: ServicesMsg91SettingsAdminRequestModule,
})
export class RequestService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.BaseURL) private baseUrl: any
    ) {}

    public getAllAdminLoginRequestsService(
        request: any
    ): Observable<BaseResponse<IPaginatedResponse<AdminLoginRequestResModel[]>, null>> {
        return this.http.get(AdminRequestUrls.getAllAdminLoginRequests(this.baseUrl), request).pipe(
            map((res) => {
                const data: BaseResponse<IPaginatedResponse<AdminLoginRequestResModel[]>, null> = res;
                return data;
            })
        );
    }

    public approveAdminLoginRequestService(request: any): Observable<BaseResponse<any, ApproveAdminLoginReqModel>> {
        return this.http.post(AdminRequestUrls.approveAdminLoginRequest(this.baseUrl), request).pipe(
            map((res) => {
                const data: BaseResponse<any, ApproveAdminLoginReqModel> = res;
                return data;
            })
        );
    }

    public declineAdminLoginRequestService(request: any): Observable<BaseResponse<any, DeclinedAminLoginReqModel>> {
        return this.http.post(AdminRequestUrls.declineAdminLoginRequest(this.baseUrl), request).pipe(
            map((res) => {
                const data: BaseResponse<any, DeclinedAminLoginReqModel> = res;
                return data;
            })
        );
    }
}
