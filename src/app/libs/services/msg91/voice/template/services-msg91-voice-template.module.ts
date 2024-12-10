import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { BaseResponse, ProxyBaseUrls, fetchFirstErrorRecursively } from '@msg91/models/root-models';
import { IPaginationVoiceResponse } from '@msg91/models/voice-models';
import { map } from 'rxjs/operators';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { TemplatesUrls } from '@msg91/urls/client-voice';
import { catchError } from 'rxjs';

@NgModule({
    imports: [CommonModule],
})
export class ServicesMsg91VoiceTemplateModule {}

@Injectable({
    providedIn: ServicesMsg91VoiceTemplateModule,
})
export class TemplateService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.VoiceBaseURL) private baseUrl: any
    ) {}

    public getTemplates(request: any): Observable<BaseResponse<IPaginationVoiceResponse<any[]>, any>> {
        return this.http.get(TemplatesUrls.templates(this.baseUrl), request).pipe(
            map((res) => {
                const data: BaseResponse<IPaginationVoiceResponse<any[]>, any> = res;
                data.request = request;
                return data;
            })
        );
    }

    public addTemplates(request: any): Observable<BaseResponse<any, any>> {
        return this.http.post(TemplatesUrls.templates(this.baseUrl), request).pipe(
            map((res) => {
                const data: BaseResponse<any, any> = res;
                data.request = request;
                return data;
            })
        );
    }

    public updateTemplate(request: any, templateId: number): Observable<BaseResponse<any, any>> {
        return this.http
            .put(TemplatesUrls.updateTemplate(this.baseUrl).replace(':templateId', templateId.toString()), request)
            .pipe(
                map((res) => {
                    const data: BaseResponse<any, any> = res;
                    data.request = request;
                    return data;
                })
            );
    }

    public getVariableTypes(): Observable<BaseResponse<{ variables: string[] }, any>> {
        return this.http.get(TemplatesUrls.getVariableTypes(this.baseUrl));
    }

    public templateTestOnBrowser(request: any): Observable<BaseResponse<any, any>> {
        const option = {
            responseType: 'blob',
        };
        return this.http.post(TemplatesUrls.templateTestOnBrowser(this.baseUrl), request, option).pipe(
            map((res) => {
                const data: BaseResponse<any, any> = res;
                data.request = request;
                return data;
            }),
            catchError((err) => {
                return new Observable<BaseResponse<any, any>>((subscriber) => {
                    (err.errors as Blob).text().then((data) => {
                        let errorObj;
                        try {
                            errorObj = JSON.parse(data);
                        } catch (e) {
                            errorObj = null;
                        }
                        if (errorObj?.errors) {
                            errorObj.errors = fetchFirstErrorRecursively(errorObj.errors);
                        }
                        subscriber.error(errorObj);
                    });
                });
            })
        );
    }
}
