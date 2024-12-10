import { Inject, Injectable, NgModule, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { lastValueFrom, Observable } from 'rxjs';
import { BaseResponse, IPaginatedResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    IAccount,
    IBalanceRoute,
    IPaymentRoute,
    IBlockedIp,
    ICurrentAccount,
    IUnBlockedIpReq,
    IUnBlockedIpResp,
    IPermissionGroup,
    IUserRulePermission,
    IUserSetting,
    IUserSideMenuModel,
    IUpdateUserMobileReq,
    IUpdateUserMobileResp,
    IGetUserLoginHistoryReqModel,
    IGetUserLoginHistoryRespModel,
} from '@msg91/models/setting-models';
import { map } from 'rxjs/operators';
import { UserSettingUrls } from '@msg91/urls/settings/userSetting';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
// import { URLS } from 'apps/msg91/src/app/hello/services/apiUrls';
// import { environment } from 'apps/msg91/src/environments/environment';
// import { ManageGroupUrls } from 'apps/msg91/src/app/services/urls/manage-group-urls';
import { renameKeyRecursively } from '@msg91/utils';
import { MICRO_SERVICE_MAPPING_KEYS, ENVIRONMENT_TOKEN, ENVIRONMENT_TOKEN_NOT_PROVIDED_ERROR } from '@msg91/constant';
import { ServicesHelloModule, HelloApiUrlService } from '@msg91/services/hello';
import { ManageGroupUrls } from '@msg91/urls/sms';

@NgModule({
    imports: [CommonModule, ServicesHelloModule],
})
export class ServicesMsg91SettingsUserSettingModule {}

@Injectable({
    providedIn: ServicesMsg91SettingsUserSettingModule,
})
export class UserSettingService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.BaseURL) private baseUrl: any,
        private helloApiUrlService: HelloApiUrlService,
        @Optional() @Inject(ENVIRONMENT_TOKEN) private environment: any
    ) {
        if (!this.environment) {
            throw new Error(ENVIRONMENT_TOKEN_NOT_PROVIDED_ERROR);
        }
    }

    public getUserSettingsService(): Observable<BaseResponse<IUserSetting, number>> {
        return this.http.get(UserSettingUrls.getUserSettingsUrl(this.baseUrl)).pipe(
            map((res) => {
                const data: BaseResponse<IUserSetting, number> = res;
                return data;
            })
        );
    }

    public getUserBalanceService(): Observable<BaseResponse<IBalanceRoute[], number>> {
        return this.http.get(UserSettingUrls.getUserBalanceUrl(this.baseUrl)).pipe(
            map((res) => {
                const data: BaseResponse<IBalanceRoute[], number> = res;
                return data;
            })
        );
    }

    public getPaymentRouteData(): Observable<BaseResponse<IPaymentRoute, number>> {
        return this.http.get(UserSettingUrls.getPaymentRouteData(this.baseUrl)).pipe(
            map((res) => {
                const data: BaseResponse<IPaymentRoute, number> = res;
                return data;
            })
        );
    }

    public updateUserSettingService(request: IUserSetting): Observable<BaseResponse<IUserSetting, IUserSetting>> {
        return this.http.post(UserSettingUrls.updateUserSettingUrl(this.baseUrl), request).pipe(
            map((res) => {
                const data: BaseResponse<IUserSetting, IUserSetting> = res;
                return data;
            })
        );
    }

    public updateUserMobileService(
        request: IUpdateUserMobileReq
    ): Observable<BaseResponse<IUpdateUserMobileResp, IUpdateUserMobileReq>> {
        return this.http.post(UserSettingUrls.updateUserMobileUrl(this.baseUrl), request).pipe(
            map((res) => {
                const data: BaseResponse<IUpdateUserMobileResp, IUpdateUserMobileReq> = res;
                return data;
            })
        );
    }

    public getUserLoginHistoryPaginatedService(
        request: IGetUserLoginHistoryReqModel
    ): Observable<BaseResponse<IPaginatedResponse<IGetUserLoginHistoryRespModel[]>, IGetUserLoginHistoryReqModel>> {
        return this.http.post(UserSettingUrls.getUserLoginHistoryPaginatedUrl(this.baseUrl), request).pipe(
            map((res) => {
                const data: BaseResponse<
                    IPaginatedResponse<IGetUserLoginHistoryRespModel[]>,
                    IGetUserLoginHistoryReqModel
                > = res;
                return data;
            })
        );
    }

    public getAllBlockedIpsService(): Observable<BaseResponse<IPaginatedResponse<IBlockedIp[]>, string>> {
        return this.http.get(UserSettingUrls.getAllBlockedIpsUrl(this.baseUrl)).pipe(
            map((res) => {
                const data: BaseResponse<IPaginatedResponse<IBlockedIp[]>, string> = res;
                return data;
            })
        );
    }

    public markLoginAsSuspiciousService(request: number): Observable<BaseResponse<boolean, number>> {
        return this.http
            .post(UserSettingUrls.markLoginAsSuspiciousUrl(this.baseUrl), {
                loginId: request,
            })
            .pipe(
                map((res) => {
                    const data: BaseResponse<boolean, number> = res;
                    return data;
                })
            );
    }

    public unBlockIp(request: IUnBlockedIpReq): Observable<BaseResponse<IUnBlockedIpResp, IUnBlockedIpReq>> {
        return this.http.post(UserSettingUrls.unBlockIpUrl(this.baseUrl), request).pipe(
            map((res) => {
                const data: BaseResponse<IUnBlockedIpResp, IUnBlockedIpReq> = res;
                data['request'] = request;
                return data;
            })
        );
    }

    public getUserSideMenuService(): Observable<BaseResponse<IUserSideMenuModel[], null>> {
        return this.http.get(UserSettingUrls.getUserSideMenuUrl(this.baseUrl)).pipe(
            map((res) => {
                const data: BaseResponse<IUserSideMenuModel[], null> = res;
                return data;
            })
        );
    }

    public getCurrentAccountService(): Observable<BaseResponse<ICurrentAccount, null>> {
        return this.http.get(UserSettingUrls.getCurrentAccountUrl(this.baseUrl)).pipe(
            map((res) => {
                const data: BaseResponse<ICurrentAccount, null> = res;
                return data;
            })
        );
    }

    public getAllAccountService(): Observable<BaseResponse<IAccount[], null>> {
        return this.http.get(UserSettingUrls.getAllAccountUrl(this.baseUrl)).pipe(
            map((res) => {
                const data: BaseResponse<IAccount[], null> = res;
                return data;
            })
        );
    }

    public switchAccountService(accountId: string): Observable<BaseResponse<any, string>> {
        return this.http
            .post(UserSettingUrls.switchAccountUrl(this.baseUrl), {
                id: accountId,
            })
            .pipe(
                map((res) => {
                    const data: BaseResponse<any, string> = res;
                    return data;
                })
            );
    }

    public updateFCMToken(token: string): Promise<any> {
        const { URLS } = this.helloApiUrlService.getApiUrls();
        return lastValueFrom(
            this.http.put(URLS.USERS.FCM_TOKEN, {
                fcm_token: token ?? undefined,
                event: 'switch_company',
            })
        );
    }

    public reloadFun(): void {
        // const locationWithQueryParam = location.href.split('?').length >= 2 ? true : false;
        // if (location.href.includes('contact-center') || location.href.includes('hello/mail')) {
        //     const url =
        //         window.location.protocol +
        //         '//' +
        //         window.location.host +
        //         (environment.env !== 'local' && environment.env !== 'prod'
        //             ? '/hello-new'
        //             : environment.env === 'prod'
        //             ? '/app/'
        //             : '/m/l/hello/');
        //     window.location.href = url;
        // } else if (location.href.includes('m/l/segmento/') || locationWithQueryParam) {
        //     const url =
        //         window.location.protocol +
        //         '//' +
        //         window.location.host +
        //         (environment.env === 'local' ? '/' : environment.env !== 'prod' ? '/hello-new/' : '/app/');
        //     window.location.href = url;
        // } else {
        //     window.location.reload();
        // }
        const url =
            window.location.protocol +
            '//' +
            window.location.host +
            (this.environment.env === 'local' ? '/' : this.environment.env !== 'prod' ? '/hello-new/' : '/app/');
        window.location.href = url;
    }

    public getLoggedInUserPermissionsService(
        request: number
    ): Observable<BaseResponse<{ permissionGroups: IPermissionGroup[] }, number>> {
        return this.http
            .get(ManageGroupUrls.getMemberPermissionsByIdUrl(this.baseUrl).replace(':id', request.toString()))
            .pipe(
                map((res) => {
                    const data: BaseResponse<{ permissionGroups: IPermissionGroup[] }, number> = res;
                    return data;
                })
            );
    }

    // public getUserPermissionMappingById(request: number): Observable<BaseResponse<IUserRulePermission, number>> {
    //     return this.http.post(ManageGroupUrls.getUserPermissionMappingById(this.baseUrl), { userId: +request }).pipe(
    //         map((res) => {
    //             const data: BaseResponse<IUserRulePermission, number> = res;
    //             return data;
    //         })
    //     );
    // }

    public getUserPermissionMappingById(request: number): Observable<BaseResponse<IUserRulePermission, number>> {
        return this.http
            .post(ManageGroupUrls.getUserPermissionMappingById(this.baseUrl), {
                userId: +request,
            })
            .pipe(
                map((res: BaseResponse<IUserRulePermission, number>) => {
                    const data: BaseResponse<IUserRulePermission, number> = {
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
}
