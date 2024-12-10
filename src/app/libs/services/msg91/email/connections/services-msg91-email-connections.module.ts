import { Injectable, NgModule, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { BaseResponse, IPaginatedEmailResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { Observable } from 'rxjs';
import { ConnectionsUrls } from '@msg91/urls/email/connections';
import { IConnection, ICreateConnection } from '@msg91/models/email-models';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class ServicesMsg91EmailConnectionsModule {}

@Injectable({
    providedIn: ServicesMsg91EmailConnectionsModule,
})
export class ConnectionsService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.EmailProxy) private emailBaseUrl: any
    ) {}

    public getConnections(
        params: { [key: string]: any } = {}
    ): Observable<BaseResponse<IPaginatedEmailResponse<IConnection[]>, any>> {
        return this.http.get<BaseResponse<IPaginatedEmailResponse<IConnection[]>, any>>(
            ConnectionsUrls.getConnections(this.emailBaseUrl),
            params
        );
    }

    public addConnection(payload: ICreateConnection): Observable<BaseResponse<IConnection, any>> {
        return this.http.post<BaseResponse<IConnection, any>>(
            ConnectionsUrls.getConnections(this.emailBaseUrl),
            payload
        );
    }

    public deleteConnection(request: { id: number }): Observable<BaseResponse<IConnection, any>> {
        return this.http.delete<BaseResponse<IConnection, any>>(
            `${ConnectionsUrls.getConnections(this.emailBaseUrl)}${request?.id}`
        );
    }
}
