import { finalize, take, tap } from 'rxjs/operators';
import { NgModule, Inject, Injectable, ModuleWithProviders, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProxyBaseUrls } from '@msg91/models/root-models';
import { CookieService } from 'ngx-cookie-service';
import { ENVIRONMENT_TOKEN, ENVIRONMENT_TOKEN_NOT_PROVIDED_ERROR } from '@msg91/constant';

@NgModule({
    imports: [CommonModule],
})
export class ServicesHttpWrapperModule {
    public static forRoot(): ModuleWithProviders<ServicesHttpWrapperModule> {
        return {
            ngModule: ServicesHttpWrapperModule,
            providers: [HttpWrapperService],
        };
    }
}

@Injectable({
    providedIn: 'root',
})
export class HttpWrapperService {
    public isOneInboxViewActive = new BehaviorSubject<boolean>(false);
    public activeOneInboxId = new BehaviorSubject<number>(null);

    constructor(
        private http: HttpClient,
        @Inject(ProxyBaseUrls.ProxyURL) private proxyURL: any,
        @Inject(ProxyBaseUrls.Env) private environment: any,
        @Optional()
        @Inject(ProxyBaseUrls.EnableMsg91Proxy)
        private enableMsg91Proxy: any,
        @Optional()
        @Inject(ProxyBaseUrls.AddProxyAppHashInApiCall)
        private addProxyAppHashInApiCall: any,
        private cookieService: CookieService,
        @Optional() @Inject(ENVIRONMENT_TOKEN) private appEnvironment: any
    ) {
        if (!this.appEnvironment) {
            throw new Error(ENVIRONMENT_TOKEN_NOT_PROVIDED_ERROR);
        }
    }

    public froalaRequestHeader(helloRequest: boolean): any {
        return helloRequest
            ? {
                  MSID: this.localHelloToken(),
              }
            : {
                  PROXY_APP_HASH: this.localProxyAppHash(),
              };
    }

    public localHelloToken(): string {
        return this.environment === 'local'
            ? decodeURIComponent(this.appEnvironment.helloProxyHash)
            : this.cookieService.get('HELLO_APP_HASH');
    }

    public localProxyAppHash(): string {
        return this.environment === 'local'
            ? decodeURIComponent(this.appEnvironment.proxyAppHash)
            : this.cookieService.get('PROXY_APP_HASH');
    }

    public get<T>(url: string, params?: any, options?: any): Observable<any> {
        options = { withCredentials: true, ...options };
        options = this.prepareOptions(options, url);
        options.params = params;
        return this.http.get<T>(url.replace('/isHelloAPI', ''), options).pipe(
            tap((res) => {}),
            finalize(() => {})
        );
    }

    public post<T>(url: string, body: any, options?: any): Observable<any> {
        options = { withCredentials: true, ...options };
        options = this.prepareOptions(options, url);
        return this.http.post<T>(url.replace('/isHelloAPI', ''), body, options).pipe(
            tap((res) => {}),
            finalize(() => {})
        );
    }

    public put<T>(url: string, body: any, options?: any): Observable<any> {
        options = { withCredentials: true, ...options };
        options = this.prepareOptions(options, url);
        return this.http.put<T>(url.replace('/isHelloAPI', ''), body, options).pipe(
            tap((res) => {}),
            finalize(() => {})
        );
    }

    public delete<T>(url: string, params?: any, options?: any): Observable<any> {
        options = { withCredentials: true, ...options };
        options = this.prepareOptions(options, url);
        options.search = this.objectToParams(params);
        return this.http.delete<T>(url.replace('/isHelloAPI', ''), options).pipe(
            tap((res) => {}),
            finalize(() => {})
        );
    }

    public patch<T>(url: string, body: any, options?: any): Observable<any> {
        options = { withCredentials: true, ...options };
        options = this.prepareOptions(options, url);
        return this.http.patch<T>(url.replace('/isHelloAPI', ''), body, options).pipe(
            tap((res) => {}),
            finalize(() => {})
        );
    }

    public prepareOptions(options: any, url: string): any {
        let isActiveOneInbox = false;
        let activeInboxId = null;
        this.isOneInboxViewActive.pipe(take(1)).subscribe((res) => (isActiveOneInbox = res));
        this.activeOneInboxId.pipe(take(1)).subscribe((res) => (activeInboxId = res));
        const token = this.localProxyAppHash();
        options = options || {};

        if (!options.headers) {
            options.headers = {} as any;
        }
        if (options.headers.hasOwnProperty('noHeader')) {
            if (options.headers.hasOwnProperty('Content-Type')) {
                delete options.headers['Content-Type'];
            }
            delete options.headers['noHeader'];
        }
        if (options['withCredentials']) {
            options['withCredentials'] = true;
        } else {
            options['withCredentials'] = false;
        }
        if (url.includes('isHelloAPI')) {
            options.headers['MSID'] = this.localHelloToken();
            options['withCredentials'] = false;
        } else if (
            (!this.enableMsg91Proxy || this.addProxyAppHashInApiCall) &&
            token &&
            ((!options?.withCredentials && !options?.noNeedToAddProxy) || url.includes(this.proxyURL))
        ) {
            options.headers['PROXY_APP_HASH'] = token;
        }
        if (url.includes('isHelloAPI') && (isActiveOneInbox || (activeInboxId && !options.headers['One-Inbox']))) {
            options.headers['One-Inbox'] = options.headers['One-Inbox'] ?? String(activeInboxId || isActiveOneInbox);
        }

        options.headers = new HttpHeaders(options.headers);
        return options;
    }

    public isPrimitive(value) {
        return value == null || (typeof value !== 'function' && typeof value !== 'object');
    }

    public objectToParams(object = {}) {
        return Object.keys(object)
            .map((value) => {
                const objectValue = this.isPrimitive(object[value]) ? object[value] : JSON.stringify(object[value]);
                return `${value}=${objectValue}`;
            })
            .join('&');
    }
}
