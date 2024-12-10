import { NgModule, Inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ProxyBaseUrls } from '@msg91/models/root-models';
import { PrimeNgToastService } from '@msg91/ui/prime-ng-toast';
import { CookieService } from 'ngx-cookie-service';
import { INCLUDES_PUBLIC_ROUTES } from '@msg91/constant';
import { CommonService } from 'apps/msg91/src/app/services/common/common.service';

@NgModule({
    imports: [CommonModule],
})
export class ServicesErrorInterceptorModule {}

@Injectable({
    providedIn: ServicesErrorInterceptorModule,
})
export class ErrorInterceptor implements HttpInterceptor {
    private routesFor400RequestHandle = ['/m/l/whatsapp/number', '/m/l/whatsapp/templates', '/m/l/rcs/templates'];

    constructor(
        private router: Router,
        @Inject(ProxyBaseUrls.BaseServer) private baseServerUrl: any,
        private toast: PrimeNgToastService,
        private cookieService: CookieService,
        private commonService: CommonService
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const isBotRequest = request.headers.get('botReq');
        const isHelloAssetUrl = request.url.includes('hello-assets');
        if (isBotRequest) {
            /*
                When bot request, the user can test the third party API by making a HTTP request,
                we don't need to handle the error codes of third party APIs instead we will
                just show an error toast.
            */
            request = request.clone({ headers: request.headers.delete('botReq') });
        }
        if (isHelloAssetUrl) {
            request = request.clone({ url: `${request.url}?timetoken=${new Date().getTime()}` });
        }
        return next.handle(request).pipe(
            tap((resp: HttpResponse<any>) => {
                if (
                    resp.type &&
                    resp.body &&
                    resp.body['errors'] &&
                    resp.body['errors'].length &&
                    resp.body['errors'][0] &&
                    resp.body['errors'][0].title === '503'
                ) {
                    //  this.router.navigate(['under-maintenance']);
                }
            }),
            catchError((err) => {
                if (err) {
                    this.commonService.setRemoveLoader(true);
                }
                // Error should be standard HTTP error response and should not be a bot request
                if (err instanceof HttpErrorResponse && !isBotRequest) {
                    if (err.status === 401) {
                        if (!INCLUDES_PUBLIC_ROUTES(this.router.url)) {
                            this.cookieService.delete('cs_msg91', '/');
                            this.cookieService.delete('us_msg91', '/');
                            location.href = this.baseServerUrl + '/logout.php';
                            return throwError({
                                errors: 'Session has expired. Logging out. . . . . .',
                                hasError: true,
                            });
                        }
                    }
                    const error: string[] = [];
                    error.push('Error  ' + err.status.toString() + ': ' + err.message);
                    // this.toastr.error(err.message);
                    if (err.status === 422) {
                        return throwError(err.error);
                    }
                    if (err.status === 500) {
                        return throwError({
                            errors: err.error?.errors?.length ? err?.error.errors : 'Internal server error',
                            error: err?.error,
                            hasError: true,
                        });
                    }
                    if (err.status === 429) {
                        return throwError({
                            errors: err.error?.errors,
                            error: err?.error,
                            hasError: true,
                            errorCode: err.status,
                        });
                    }
                    if (err.status === 403) {
                        if (
                            this.router.url.includes('m/l/email') &&
                            !this.router.url.includes('subscription') &&
                            !this.router.url.includes('validations')
                        ) {
                            this.router.navigate(['/m', 'l', 'email', 'dashboard'], {
                                queryParamsHandling: 'merge',
                            });
                            return throwError({
                                data: err.error?.data,
                                errors: err.error?.errors,
                                error: err?.error,
                                hasError: true,
                            });
                        }
                        if (this.router.url.includes('subscription')) {
                            return throwError({
                                data: err.error?.data,
                                errors: err.error?.errors,
                                error: err?.error,
                                hasError: true,
                            });
                        }
                        return throwError({
                            data: err.error?.data,
                            errors: err.error?.errors,
                            error: err?.error,
                            hasError: true,
                        });
                    }

                    if ((err.status === 400 || err.status === 404) && this.router.url.includes('/m/l/knowledgebase')) {
                        return throwError({
                            errors: err.error?.message,
                            hasError: true,
                            data: err.error?.data,
                            status: err.error?.status,
                        });
                    }

                    if (err.status === 400 && this.routesFor400RequestHandle.find((e) => e === this.router.url)) {
                        if (typeof err.error === 'string' || err.error instanceof String) {
                            return throwError({
                                errors: err.error?.length ? err?.error : 'Internal server error',
                                hasError: true,
                            });
                        } else if (typeof err.error === 'object' || err.error instanceof Object) {
                            return throwError({
                                errors: err.error?.errors,
                                error: err?.error,
                                hasError: true,
                                data: err.error?.data,
                                status: err.error?.status,
                            });
                        }
                        return throwError({ ...err.error, hasError: true });
                    }

                    if (err.status === 404) {
                        if (typeof err.error === 'string' || err.error instanceof String) {
                            return throwError({
                                errors: err.error?.length ? err?.error : 'Internal server error',
                                hasError: true,
                            });
                        } else if (typeof err.error === 'object' || err.error instanceof Object) {
                            return throwError({
                                errors: err.error?.errors ?? err.error,
                                error: err?.error,
                                hasError: true,
                                data: err.error?.data,
                                status: err.error?.status,
                                statusCode: err.status,
                            });
                        }
                        return throwError({ ...err.error, hasError: true });
                    }
                    if (
                        (err.status === 413 || err.status === 0) &&
                        (this.router.url.includes('contacts/import-contact') ||
                            this.router.url.includes('m/l/email/validations/bulk'))
                    ) {
                        return throwError({
                            errors: 'File size too large.',
                            hasError: true,
                            data: err.error?.data,
                            status: err.error?.status,
                        });
                    }
                    return throwError({
                        data: err.error?.data,
                        errors: err.error?.errors ?? err.error,
                        error: err?.error,
                        hasError: true,
                    });
                } else {
                    return throwError({
                        data: err,
                        errors: err,
                        error: err,
                        hasError: true,
                    });
                }
            })
        );
    }
}
