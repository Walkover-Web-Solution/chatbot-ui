import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { CompanyUrls } from '@msg91/urls/settings/companies';

@NgModule({
    imports: [CommonModule],
})
export class ServicesMsg91SettingsCompaniesModule {}

@Injectable({
    providedIn: ServicesMsg91SettingsCompaniesModule,
})
export class CompanyService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.BaseURL) private baseUrl: any
    ) {}

    public getAllInvitations(request: any): Observable<BaseResponse<any, null>> {
        return this.http.get(CompanyUrls.getAllInvitations(this.baseUrl), request).pipe(
            map((res) => {
                const data: BaseResponse<any, null> = res;
                return data;
            })
        );
    }

    public memberInvitationAction(request: {
        [key: string]: any;
    }): Observable<BaseResponse<any, { [key: string]: any }>> {
        return this.http.post(CompanyUrls.memberInvitationAction(this.baseUrl), request).pipe(
            map((res) => {
                const data: BaseResponse<any, { [key: string]: any }> = res;
                return data;
            })
        );
    }

    public createNewCompany(request: {
        compName: string;
        compUniName: string;
    }): Observable<BaseResponse<any, { [key: string]: any }>> {
        return this.http.post(CompanyUrls.createNewCompany(this.baseUrl), request).pipe(
            map((res) => {
                const data: BaseResponse<any, { [key: string]: any }> = res;
                return data;
            })
        );
    }
}
