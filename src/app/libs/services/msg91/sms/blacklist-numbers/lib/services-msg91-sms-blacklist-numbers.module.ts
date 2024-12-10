import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlacklistNumbersUrls, MessageDecodingUrls } from '@msg91/urls/sms';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { Observable } from 'rxjs';
import {
    IAddBlacklistNumbersRequest,
    IBlacklistNumbers,
    IDeleteBlacklistNumbersRequest,
} from '@msg91/models/sms-models';

@NgModule({
    imports: [CommonModule],
})
export class ServicesMsg91SmsBlacklistNumbersModule {}

@Injectable({
    providedIn: ServicesMsg91SmsBlacklistNumbersModule,
})
export class BlacklistNumbersServices {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.BaseURL) private baseAPIURl: string
    ) {}

    public getBlockedNumbers(params: { [key: string]: any }): Observable<BaseResponse<IBlacklistNumbers, any>> {
        return this.http.post(BlacklistNumbersUrls.getBlockedNumbers(this.baseAPIURl), params);
    }

    public addBlockedNumbers(body: IAddBlacklistNumbersRequest): Observable<BaseResponse<{ msg: string }, any>> {
        return this.http.post(BlacklistNumbersUrls.addBlockedNumbers(this.baseAPIURl), body);
    }

    public deleteBlockedNumbers(body: IDeleteBlacklistNumbersRequest): Observable<BaseResponse<{ msg: string }, any>> {
        return this.http.post(BlacklistNumbersUrls.deleteBlockedNumbers(this.baseAPIURl), body);
    }

    public exportBlockedNumbers(params: { [key: string]: any } = {}): Observable<any> {
        return this.http.get(BlacklistNumbersUrls.exportBlockedNumbers(this.baseAPIURl), params, {
            responseType: 'text',
        });
    }

    public getMessageDecodingStatus(): Observable<BaseResponse<{ status: 1 | 0 }, void>> {
        return this.http.get(MessageDecodingUrls.messageDecodingStatus(this.baseAPIURl));
    }

    public updateMessageDecodingStatus(payload: {
        status: 1 | 0;
    }): Observable<BaseResponse<{ status: 1 | 0 }, { status: 1 | 0 }>> {
        return this.http.post(MessageDecodingUrls.messageDecodingStatus(this.baseAPIURl), payload);
    }
}
