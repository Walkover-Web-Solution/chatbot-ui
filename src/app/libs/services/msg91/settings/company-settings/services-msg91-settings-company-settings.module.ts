import { CommonModule } from '@angular/common';
import { Inject, Injectable, NgModule, Optional } from '@angular/core';
import { ENVIRONMENT_TOKEN, ENVIRONMENT_TOKEN_NOT_PROVIDED_ERROR } from '@msg91/constant';
import { BaseResponse, errorResolver, IIdNameModel, ProxyBaseUrls } from '@msg91/models/root-models';
import { ISegmentoRegisterData } from '@msg91/models/segmento-models';
import {
    IChangePasswordModel,
    ICompanySetting,
    IForgotPasswordReqModel,
    IForgotPasswordResModel,
    IRcsStatus,
    ITimezone,
    IUserInfo,
    IVerifyUserNameModel,
} from '@msg91/models/setting-models';
import { IWhatsappStatusResponse } from '@msg91/models/whatsapp-models';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { CompanySettingUrls } from '@msg91/urls/settings/companySettings';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@NgModule({
    imports: [CommonModule],
})
export class ServicesMsg91SettingsCompanySettingsModule {}

@Injectable({
    providedIn: ServicesMsg91SettingsCompanySettingsModule,
})
export class CompanySettingService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.BaseURL) private baseUrl: any,
        @Inject(ProxyBaseUrls.SegmentoMsg91BasePath)
        private segmentoMsg91BasePath: any,
        @Inject(ProxyBaseUrls.VoiceBaseURL) private voiceProxy: any,
        @Optional() @Inject(ENVIRONMENT_TOKEN) private environment: any
    ) {
        if (!this.environment) {
            throw new Error(ENVIRONMENT_TOKEN_NOT_PROVIDED_ERROR);
        }
    }

    public getUserInfoService(): Observable<BaseResponse<IUserInfo, null>> {
        return this.http.get(CompanySettingUrls.getUserInfo(this.baseUrl)).pipe(
            map((res) => {
                const data: BaseResponse<IUserInfo, null> = res;
                return data;
            })
        );
    }

    public getCompanySettingService(): Observable<BaseResponse<ICompanySetting, null>> {
        return this.http.get(CompanySettingUrls.getCompanySettingUrl(this.baseUrl)).pipe(
            map((res) => {
                const data: BaseResponse<ICompanySetting, null> = res;
                return data;
            })
        );
    }

    public createCompanySettingService(
        request: ICompanySetting
    ): Observable<BaseResponse<ICompanySetting, ICompanySetting>> {
        return this.http.post(CompanySettingUrls.createCompanySettingUrl(this.baseUrl), request).pipe(
            map((res) => {
                const data: BaseResponse<ICompanySetting, ICompanySetting> = res;
                return data;
            })
        );
    }

    public getAllCountriesService(): Observable<BaseResponse<IIdNameModel[], null>> {
        return this.http.get(CompanySettingUrls.getAllCountriesUrl(this.baseUrl)).pipe(
            map((res) => {
                const data: BaseResponse<IIdNameModel[], null> = res;
                return data;
            })
        );
    }

    public getStatesByCountryIdService(request: number): Observable<BaseResponse<IIdNameModel[], number>> {
        return this.http
            .get(CompanySettingUrls.getStatesByCountryIdUrl(this.baseUrl).replace(':countryId', request.toString()))
            .pipe(
                map((res) => {
                    const data: BaseResponse<IIdNameModel[], number> = res;
                    return data;
                })
            );
    }

    public checkUsernameAvailabilityService(
        request: IVerifyUserNameModel
    ): Observable<BaseResponse<boolean, IVerifyUserNameModel>> {
        return this.http.post(CompanySettingUrls.checkUsernameAvailabilityUrl(this.baseUrl), request).pipe(
            map((res) => {
                const data: BaseResponse<boolean, IVerifyUserNameModel> = res;
                return data;
            })
        );
    }

    public changeUserPasswordService(
        request: IChangePasswordModel
    ): Observable<BaseResponse<boolean, IChangePasswordModel>> {
        return this.http.post(CompanySettingUrls.changeUserPasswordUrl(this.baseUrl), request).pipe(
            map((res) => {
                const data: BaseResponse<boolean, IChangePasswordModel> = res;
                return data;
            })
        );
    }

    public getAllIndustriesService(searchKey: string): Observable<BaseResponse<IIdNameModel[], string>> {
        return this.http
            .get(CompanySettingUrls.getAllIndustriesUrl(this.baseUrl).replace(':searchKey', searchKey))
            .pipe(
                map((res) => {
                    const data: BaseResponse<IIdNameModel[], string> = res;
                    return data;
                })
            );
    }

    public getAllTimezoneService(): Observable<BaseResponse<ITimezone[], null>> {
        return this.http.get<BaseResponse<ITimezone[], null>>(CompanySettingUrls.getAllTimezoneUrl(this.baseUrl));
    }

    public forgetPasswordService(
        request: IForgotPasswordReqModel
    ): Observable<BaseResponse<IForgotPasswordResModel, IForgotPasswordReqModel>> {
        return this.http.post(CompanySettingUrls.forgotCompanyPassword(this.baseUrl), request).pipe(
            map((res) => {
                const data: BaseResponse<IForgotPasswordResModel, IForgotPasswordReqModel> = res;
                return data;
            })
        );
    }

    public campaignRegisterUser(request: any): Observable<BaseResponse<any, any>> {
        return this.http.post(CompanySettingUrls.campaignRegisterUser(this.baseUrl), request).pipe(
            map((res) => {
                const data: BaseResponse<any, null> = res;
                return data;
            })
        );
    }

    public rcsUserActivationCheckService(): Observable<BaseResponse<IRcsStatus, null>> {
        return this.http
            .get(CompanySettingUrls.rcsUserActive(this.environment.proxyServer + '' + this.environment.rcsProxy))
            .pipe(
                map((res) => {
                    const data: BaseResponse<IRcsStatus, null> = res;
                    return data;
                }),
                catchError((error) => {
                    const newData: BaseResponse<IRcsStatus, null> = {
                        data: null,
                        errors: errorResolver(error.errors),
                        hasError: true,
                        status: 'fail',
                    };
                    return of(newData);
                })
            );
    }

    public whatsAppActivationCheckService(): Observable<BaseResponse<IWhatsappStatusResponse, null>> {
        return this.http
            .get(
                CompanySettingUrls.whatsAppUserActive(
                    this.environment.proxyServer + '' + this.environment.whatsappProxy
                )
            )
            .pipe(
                map((res) => {
                    const data: BaseResponse<IWhatsappStatusResponse, null> = res;
                    return data;
                }),
                catchError((error) => {
                    const newData: BaseResponse<IWhatsappStatusResponse, null> = {
                        data: null,
                        errors: errorResolver(error.errors),
                        hasError: true,
                        status: 'fail',
                    };
                    return of(newData);
                })
            );
    }

    public segmentoRegisterUser(request: any): Observable<BaseResponse<ISegmentoRegisterData, any>> {
        return this.http.post<BaseResponse<ISegmentoRegisterData, any>>(
            CompanySettingUrls.segmentoRegisterUser(this.segmentoMsg91BasePath),
            request
        );
    }

    public getIntegratedGateways(): Observable<BaseResponse<any, null>> {
        return this.http.get(CompanySettingUrls.getIntegratedGateways(this.baseUrl)).pipe(
            map((res) => {
                const data: BaseResponse<any, null> = res;
                return data;
            })
        );
    }

    public getCitiesByStateIdService(request: number): Observable<BaseResponse<IIdNameModel[], number>> {
        return this.http
            .get(CompanySettingUrls.getCityByStateIdUrl(this.baseUrl).replace(':stateId', request.toString()))
            .pipe(
                map((res) => {
                    const data: BaseResponse<IIdNameModel[], number> = res;
                    return data;
                })
            );
    }

    public changeCompanyUserNameService(request): Observable<BaseResponse<boolean, void>> {
        return this.http.post<BaseResponse<boolean, void>>(
            CompanySettingUrls.changeCompanyUserName(this.baseUrl),
            request
        );
    }
    public voiceRegisterUser(request: any): Observable<BaseResponse<any, any>> {
        return this.http.post(CompanySettingUrls.VoiceUserRegister(this.voiceProxy), request);
    }

    /**
     * Gets form validations by form type
     *
     * @param {*} params
     * @return {*}  {Observable<BaseResponse<any, any>>}
     * @memberof CompanySettingService
     */
    public getFormValidations(params: any): Observable<BaseResponse<any, any>> {
        return this.http.get(CompanySettingUrls.getFormValidations(this.baseUrl), params).pipe(
            map((res) => {
                const data: BaseResponse<any, any> = res;
                return data;
            })
        );
    }
}
