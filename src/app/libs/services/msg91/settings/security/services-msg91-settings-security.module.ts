import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    IAppPermissionStatus,
    IBlockUnblockCountryReqModel,
    IRule,
    IRuleRes,
    ISaveBlockedByPriceReqModel,
    IUserInfo,
    IUserLoginHistory,
    IUserChangeStatusReq,
    ISecurityUser,
    IInviteUserReq,
    ISecurityUserUpdateReq,
    ISecurityIP,
    ISecurityNotAddedIP,
    ICountriesResModel,
    IGenerateOtpReq,
    IVerifyOtp,
} from '@msg91/models/setting-models';
import { BaseResponse, IPaginatedResponse, BaseFilterRequest, ProxyBaseUrls } from '@msg91/models/root-models';
import { map } from 'rxjs/operators';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
// import { URLS } from 'apps/msg91/src/app/hello/services/apiUrls';
import { Observable } from 'rxjs';
import { SecurityUrls } from '@msg91/urls/settings/security';
import { renameKeyRecursively } from '@msg91/utils';
import { IAddAlertRequest, IAlertContacts } from '@msg91/models/setting-models';
import { MICRO_SERVICE_MAPPING_KEYS } from '@msg91/constant';
import { ServicesHelloModule, HelloApiUrlService } from '@msg91/services/hello';
import { AgentTeamResponse } from '@msg91/models/hello-models';

@NgModule({
    imports: [CommonModule, ServicesHelloModule],
})
export class ServicesMsg91SettingsSecurityModule {}

@Injectable({
    providedIn: ServicesMsg91SettingsSecurityModule,
})
export class SecurityService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.BaseURL) private baseUrl: any,
        private helloApiUrlService: HelloApiUrlService
    ) {}

    public getCountryListService(): Observable<BaseResponse<ICountriesResModel[], null>> {
        return this.http.get(SecurityUrls.getCountryListUrl(this.baseUrl)).pipe(
            map((res) => {
                const data: BaseResponse<ICountriesResModel[], null> = res;
                return data;
            })
        );
    }

    public blockUnblockCountryService(
        request: IBlockUnblockCountryReqModel
    ): Observable<BaseResponse<any, IBlockUnblockCountryReqModel>> {
        return this.http.get(SecurityUrls.blockUnblockCountryUrl(this.baseUrl), request).pipe(
            map((res) => {
                const data: BaseResponse<any, IBlockUnblockCountryReqModel> = res;
                return data;
            })
        );
    }

    public setCountryLimit(
        request: IBlockUnblockCountryReqModel
    ): Observable<BaseResponse<any, IBlockUnblockCountryReqModel>> {
        return this.http.get(SecurityUrls.setCountryLimit(this.baseUrl), request).pipe(
            map((res) => {
                const data: BaseResponse<any, IBlockUnblockCountryReqModel> = res;
                return data;
            })
        );
    }

    public getBlockedByPriceService(): Observable<BaseResponse<any, null>> {
        return this.http.get(SecurityUrls.getBlockedByPriceUrl(this.baseUrl)).pipe(
            map((res) => {
                const data: BaseResponse<IUserInfo, null> = res;
                return data;
            })
        );
    }

    public saveBlockedByPriceService(
        request: ISaveBlockedByPriceReqModel
    ): Observable<BaseResponse<any, ISaveBlockedByPriceReqModel>> {
        return this.http.get(SecurityUrls.saveBlockedByPriceUrl(this.baseUrl), request).pipe(
            map((res) => {
                const data: BaseResponse<any, ISaveBlockedByPriceReqModel> = res;
                return data;
            })
        );
    }

    public getCompanyRulesService(): Observable<BaseResponse<IRule[], null>> {
        return this.http.get(SecurityUrls.getCompanyRulesUrl(this.baseUrl)).pipe(
            map((res) => {
                const data: BaseResponse<IRule[], null> = res;
                return data;
            })
        );
    }

    public getAllPermissionsStatus(): Observable<BaseResponse<IAppPermissionStatus[], null>> {
        return this.http.get(SecurityUrls.getAllPermissionsStatus(this.baseUrl)).pipe(
            map((res: BaseResponse<IAppPermissionStatus[], null>) => {
                const data: BaseResponse<IAppPermissionStatus[], null> = {
                    ...res,
                    ...(res.data &&
                        Object.keys(res.data) && {
                            data: renameKeyRecursively(res.data, MICRO_SERVICE_MAPPING_KEYS),
                        }),
                };
                return data;
            })
        );
    }

    public getRuleById(id): Observable<BaseResponse<IRuleRes, null>> {
        return this.http.post(SecurityUrls.getRuleById(this.baseUrl), { ruleId: +id }).pipe(
            map((res: BaseResponse<IRuleRes, null>) => {
                const data: BaseResponse<IRuleRes, null> = {
                    ...res,
                    ...(res.data &&
                        Object.keys(res.data) && {
                            data: renameKeyRecursively(res.data, MICRO_SERVICE_MAPPING_KEYS),
                        }),
                };
                return data;
            })
        );
    }

    public addCompanyRulesService(req: IRuleRes): Observable<BaseResponse<any, null>> {
        return this.http.post(SecurityUrls.addCompanyRulesUrl(this.baseUrl), req).pipe(
            map((res) => {
                const data: BaseResponse<any, null> = res;
                return data;
            })
        );
    }

    public deleteRuleById(id): Observable<BaseResponse<any, null>> {
        return this.http.post(SecurityUrls.getRuleById(this.baseUrl), { ruleId: +id }).pipe(
            map((res) => {
                const data: BaseResponse<any, null> = res;
                return data;
            })
        );
    }

    public getLoginHistory(req): Observable<BaseResponse<IPaginatedResponse<IUserLoginHistory[]>, null>> {
        return this.http.post(SecurityUrls.getLoginHistory(this.baseUrl), req).pipe(
            map((res) => {
                const data: BaseResponse<IPaginatedResponse<IUserLoginHistory[]>, null> = res;
                return data;
            })
        );
    }

    public changeUserStatus(payload: IUserChangeStatusReq): Observable<BaseResponse<any, null>> {
        return this.http.post(SecurityUrls.changeUserStatus(this.baseUrl), payload).pipe(
            map((res) => {
                const data: BaseResponse<any, null> = res;
                return data;
            })
        );
    }

    public deleteUser(payload: IUserChangeStatusReq): Observable<BaseResponse<any, null>> {
        return this.http.post(SecurityUrls.deleteUser(this.baseUrl), payload).pipe(
            map((res) => {
                const data: BaseResponse<any, null> = res;
                return data;
            })
        );
    }

    public getUsersList(
        payload: BaseFilterRequest
    ): Observable<BaseResponse<IPaginatedResponse<ISecurityUser[]>, null>> {
        return this.http.post(SecurityUrls.getUsersList(this.baseUrl), payload).pipe(
            map((res) => {
                const data: BaseResponse<IPaginatedResponse<ISecurityUser[]>, null> = res;
                return data;
            })
        );
    }

    public inviteUser(payload: IInviteUserReq): Observable<BaseResponse<any, null>> {
        return this.http.post(SecurityUrls.inviteUser(this.baseUrl), payload).pipe(
            map((res) => {
                const data: BaseResponse<any, null> = res;
                return data;
            })
        );
    }

    public generateOtp(payload: IGenerateOtpReq): Observable<BaseResponse<any, null>> {
        return this.http.post(SecurityUrls.generateOtp(this.baseUrl), payload).pipe(
            map((res) => {
                const data: BaseResponse<any, null> = res;
                return data;
            })
        );
    }

    public verifyOtp(payload: IVerifyOtp): Observable<BaseResponse<any, null>> {
        return this.http.post(SecurityUrls.verifyOtp(this.baseUrl), payload).pipe(
            map((res) => {
                const data: BaseResponse<any, null> = res;
                return data;
            })
        );
    }

    public updateUser(payload: ISecurityUserUpdateReq): Observable<BaseResponse<any, null>> {
        return this.http.post(SecurityUrls.editUser(this.baseUrl), payload).pipe(
            map((res) => {
                const data: BaseResponse<any, null> = res;
                return data;
            })
        );
    }

    public getAddedIp(payload: BaseFilterRequest): Observable<BaseResponse<IPaginatedResponse<ISecurityIP[]>, null>> {
        return this.http.post(SecurityUrls.getAddedIp(this.baseUrl), payload).pipe(
            map((res) => {
                const data: BaseResponse<IPaginatedResponse<ISecurityIP[]>, null> = res;
                return data;
            })
        );
    }

    public getNotAddedIp(
        payload: BaseFilterRequest
    ): Observable<BaseResponse<IPaginatedResponse<ISecurityNotAddedIP[]>, null>> {
        return this.http.post(SecurityUrls.getNotAddedIp(this.baseUrl), payload).pipe(
            map((res) => {
                const data: BaseResponse<IPaginatedResponse<ISecurityNotAddedIP[]>, null> = res;
                return data;
            })
        );
    }

    public getUserIps(payload: string): Observable<BaseResponse<any, null>> {
        return this.http
            .post(SecurityUrls.whiteListedIps(this.baseUrl), {
                userId: payload,
            })
            .pipe(
                map((res) => {
                    const data: BaseResponse<any, null> = res;
                    return data;
                })
            );
    }

    public getAgentTeam(): Observable<AgentTeamResponse> {
        const { URLS } = this.helloApiUrlService.getApiUrls();
        return this.http.get(URLS.ASSIGNEMPLOYEE.ASSIGN_EMPLOYEE_LIST);
    }

    public getAgentDetails(id: number): Observable<any> {
        const { URLS } = this.helloApiUrlService.getApiUrls();
        return this.http.get(URLS.AGENT.GET_AGENT.replace(':id', id.toString()));
    }

    public blockUnblockAllCountries(payload: string): Observable<BaseResponse<ICountriesResModel[], string>> {
        return this.http.post(SecurityUrls.blockUnblockAllCountries(this.baseUrl) + `?allBlock=${payload}`, {}).pipe(
            map((res) => {
                const data: BaseResponse<ICountriesResModel[], string> = res;
                return data;
            })
        );
    }

    public getAlertDepartments(): Observable<BaseResponse<{ [key: string]: string }[], void>> {
        return this.http.get(SecurityUrls.getAlertDepartments(this.baseUrl));
    }

    public getAlertDetails(): Observable<BaseResponse<IAlertContacts, void>> {
        return this.http.get(SecurityUrls.getAlertDetails(this.baseUrl));
    }

    public addAlertDetails(payload: IAddAlertRequest): Observable<BaseResponse<any, IAddAlertRequest>> {
        return this.http.post(SecurityUrls.addAlertDetails(this.baseUrl), payload);
    }

    public deleteAlertDetails(id: string): Observable<BaseResponse<any, string>> {
        return this.http.delete(SecurityUrls.deleteAlertDetails(this.baseUrl), {}, { body: { id } });
    }
}
