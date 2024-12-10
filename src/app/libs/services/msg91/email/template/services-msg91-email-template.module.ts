import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { BaseResponse, IPaginatedEmailResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    AllTagsResponseModel,
    AllThemesQueryParams,
    AllThemesResponseModel,
    IAddTemplateReqModel,
    IAddTemplateResModel,
    IAddTemplateVersionReqModel,
    IBlockKeywordsResModel,
    IGetAllTemplateResModel,
    isActive,
    IStripoSelectedTemplate,
    IStripoTemplateThemeModel,
    IStripoToken,
    ITemplateThemeResModel,
    updateTemplateVersionResModel,
} from '@msg91/models/email-models';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { TemplateUrls } from '@msg91/urls/email/template';
import { take } from 'rxjs/operators';
import { HttpEvent } from '@angular/common/http';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class ServicesMsg91EmailTemplateModule {}

@Injectable({
    providedIn: ServicesMsg91EmailTemplateModule,
})
export class TemplateService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.EmailProxy) private emailBaseUrl: any
    ) {}

    public getAllTemplateService(
        params: any
    ): Observable<BaseResponse<IPaginatedEmailResponse<IGetAllTemplateResModel[]>, any>> {
        return this.http.get<BaseResponse<IPaginatedEmailResponse<IGetAllTemplateResModel[]>, any>>(
            TemplateUrls.getAllTemplatesUrl(this.emailBaseUrl),
            params
        );
    }

    public addTemplateService(
        request: IAddTemplateReqModel
    ): Observable<BaseResponse<IAddTemplateResModel, IAddTemplateReqModel>> {
        return this.http.post<BaseResponse<IAddTemplateResModel, IAddTemplateReqModel>>(
            TemplateUrls.addTemplateUrl(this.emailBaseUrl),
            request
        );
    }

    public getTemplateByIdService(
        request: number,
        params = null
    ): Observable<BaseResponse<IGetAllTemplateResModel, number>> {
        return this.http.get<BaseResponse<IGetAllTemplateResModel, number>>(
            TemplateUrls.getTemplateByIdUrl(this.emailBaseUrl).replace(':templateId', request.toString()),
            params
        );
    }

    public updateTemplateService(
        request: IAddTemplateReqModel,
        templateId: number
    ): Observable<BaseResponse<IGetAllTemplateResModel, IAddTemplateReqModel>> {
        return this.http.put<BaseResponse<IGetAllTemplateResModel, IAddTemplateReqModel>>(
            TemplateUrls.TemplateUrl(this.emailBaseUrl).replace(':templateId', templateId.toString()),
            request
        );
    }

    public deleteTemplateService(templateId: number): Observable<BaseResponse<any, number>> {
        return this.http.delete<BaseResponse<any, number>>(
            TemplateUrls.TemplateUrl(this.emailBaseUrl).replace(':templateId', templateId.toString())
        );
    }

    public getAllTemplateTheme(): Observable<BaseResponse<IStripoTemplateThemeModel[], any>> {
        return this.http.get<BaseResponse<IStripoTemplateThemeModel[], any>>(
            TemplateUrls.getAllTemplateTheme(this.emailBaseUrl)
        );
    }

    public getSelectedTemplateData(id: number): Observable<BaseResponse<IStripoSelectedTemplate, number>> {
        return this.http.get<BaseResponse<IStripoSelectedTemplate, number>>(
            TemplateUrls.getAllTemplateTheme(this.emailBaseUrl) + `/${id}`
        );
    }

    public getTemplateTheme(request: number, params = null): Observable<BaseResponse<ITemplateThemeResModel, number>> {
        return this.http.get<BaseResponse<ITemplateThemeResModel, number>>(
            TemplateUrls.templateTheme(this.emailBaseUrl).replace(':themeId', request.toString()),
            params
        );
    }

    public getBlockKeywords(request: any): Observable<BaseResponse<IBlockKeywordsResModel[], null>> {
        return this.http.get<BaseResponse<IBlockKeywordsResModel[], null>>(
            TemplateUrls.getBlockKeywords(this.emailBaseUrl),
            request
        );
    }

    public getSpecifiedTemplateVersion(
        request: number,
        params = null
    ): Observable<BaseResponse<IGetAllTemplateResModel, number>> {
        return this.http.get<BaseResponse<IGetAllTemplateResModel, number>>(
            TemplateUrls.specifiedTemplateVersion(this.emailBaseUrl).replace(':tempVersId', request.toString()),
            { ...params, with: 'template' }
        );
    }

    public createTemplateVersion(
        request: IAddTemplateVersionReqModel
    ): Observable<BaseResponse<updateTemplateVersionResModel, IAddTemplateReqModel>> {
        return this.http.post<BaseResponse<updateTemplateVersionResModel, IAddTemplateVersionReqModel>>(
            TemplateUrls.updateTemplateVersion(this.emailBaseUrl),
            request
        );
    }

    public updateSpecifiedTemplateVersion(
        request: IAddTemplateReqModel | isActive,
        tempVersId: number
    ): Observable<BaseResponse<updateTemplateVersionResModel, IAddTemplateReqModel | isActive>> {
        return this.http.put<BaseResponse<updateTemplateVersionResModel, null>>(
            TemplateUrls.specifiedTemplateVersion(this.emailBaseUrl).replace(':tempVersId', tempVersId.toString()),
            request
        );
    }

    public deleteSpecifiedTemplateVersion(request: number, templateId: number): Observable<BaseResponse<string, any>> {
        return this.http
            .delete(
                TemplateUrls.specifiedTemplateVersion(this.emailBaseUrl).replace(':tempVersId', request.toString()),
                request
            )
            .pipe(
                map((res) => {
                    const data: BaseResponse<string, any> = res;
                    data.request = {
                        templateId: templateId,
                        templateVersionId: +request,
                    };
                    return data;
                })
            );
    }

    public testEmailTemplate(request: any): Observable<BaseResponse<string, any>> {
        return this.http.post<BaseResponse<string, any>>(TemplateUrls.testEmailTemplate(this.emailBaseUrl), request);
    }

    public sendEmail(request: any): Observable<BaseResponse<string, any>> {
        return this.http.post<BaseResponse<string, any>>(TemplateUrls.sendEmail(this.emailBaseUrl), request);
    }

    public uploadFile(file: File, url: string): Observable<HttpEvent<any>> {
        const formdata = new FormData();
        formdata.append('file', file);
        return this.http.post(url, formdata, {
            observe: 'events',
            reportProgress: true,
            headers: { noHeader: '' },
        });
    }

    public getStripoToken(): Observable<BaseResponse<IStripoToken, any>> {
        return this.http.get<BaseResponse<IStripoToken, any>>(TemplateUrls.getStripoToken(this.emailBaseUrl));
    }

    public getTags(): Observable<BaseResponse<IPaginatedEmailResponse<AllTagsResponseModel[]>, any>> {
        return this.http.get<BaseResponse<AllTagsResponseModel[], any>>(TemplateUrls.getTags(this.emailBaseUrl));
    }

    public getAllNewThemes(
        request: any
    ): Observable<BaseResponse<IPaginatedEmailResponse<AllThemesResponseModel[]>, any>> {
        return this.http.get<BaseResponse<AllTagsResponseModel[], any>>(
            TemplateUrls.getAllTemplateTheme(this.emailBaseUrl),
            request
        );
    }

    public getSingleThemeById(themeId: string): Observable<BaseResponse<AllThemesResponseModel, string>> {
        return this.http.get<BaseResponse<AllThemesResponseModel, string>>(
            TemplateUrls.templateTheme(this.emailBaseUrl).replace(':themeId', themeId)
        );
    }

    public getSnippetSendEmail(params: any): Observable<BaseResponse<AllThemesResponseModel, string>> {
        return this.http.get<BaseResponse<any, any>>(TemplateUrls.getSnippet(this.emailBaseUrl), params);
    }
}
