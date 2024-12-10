import { Inject, Injectable, NgModule } from '@angular/core';
import { MicroserviceBaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { InteractiveMessageRequest } from '@msg91/ui/interactive-message';
import { HelloUrls } from '@msg91/urls/hello';
import { Observable } from 'rxjs';

@NgModule({})
export class ServicesMsg91HelloModule {}

@Injectable({
    providedIn: ServicesMsg91HelloModule,
})
export class HelloService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.HelloBaseURL) private helloBaseUrl: string
    ) {}

    public createInteractiveMessage(
        request: InteractiveMessageRequest
    ): Observable<MicroserviceBaseResponse<any, InteractiveMessageRequest>> {
        return this.http.post(HelloUrls.createInteractiveMessage(this.helloBaseUrl), { ...request });
    }

    public updateInteractiveMessage(
        request: InteractiveMessageRequest
    ): Observable<MicroserviceBaseResponse<any, InteractiveMessageRequest>> {
        return this.http.put(HelloUrls.updateInteractiveMessage(this.helloBaseUrl), { ...request });
    }
}
