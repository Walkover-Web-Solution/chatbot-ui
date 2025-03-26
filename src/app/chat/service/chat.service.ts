import { IdentityVerificationService } from './identity-verification.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URLS } from '../chat-widget/URLs';
import { map } from 'rxjs/operators';
import {
    AgentTeamResponse,
    IArticle,
    IChannel,
    IClassificationChannel,
    IClient,
    IClientChannel,
    IClientListResp,
    IClientParam,
    IFAQ,
    IInboundMessageModel,
    IPhoneValidation,
    IPostFeedback,
    IPubNubKeys,
    IWidgetInfo,
    Message,
    SendUnreadNotificationReq,
} from '../model';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { MicroserviceBaseResponse } from '@msg91/models/root-models';
import { getCookie } from '../utils';

@Injectable()
export class ChatService {
    public options = {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: '',
        },
        withCredentials: false,
        noNeedToAddProxy: true,
    };
    public apiUrl: string = environment.apiUrl;

    constructor(
        private http: HttpWrapperService,
        private httpClient: HttpClient,
        private identityVerificationService: IdentityVerificationService
    ) {}

    public getFolders(token: string, uuid: string = null): Observable<IFAQ[]> {
        this.options.headers.Authorization = uuid ? `${token}:${uuid}` : token;
        return this.http.get<IFAQ[]>(URLS.FAQS.GET_FODLERS.replace(':URL', this.apiUrl), '', this.options);
    }

    public getArticles(
        folderId: string = '',
        token: string,
        uuid: string = null,
        query: string = ''
    ): Observable<{ articles: IArticle[]; count: number }> {
        this.options.headers.Authorization = uuid ? `${token}:${uuid}` : token;
        return this.http.get<{ articles: IArticle[]; count: number }>(
            `${URLS.FAQS.GET_ARTICLES.replace(':URL', this.apiUrl)}?folder_id=${folderId}&q=${query}`,
            '',
            this.options
        );
    }

    // public createChannel(
    //     request: Partial<IClient>,
    //     token: string
    // ): Observable<{ request?: Partial<IClient>; response?: IClientChannel }> {
    //     this.options.headers.Authorization = token;
    //     return this.http.post(URLS.CHAT.CREATE_CHANNEL.replace(':URL', this.apiUrl), { ...request }, this.options).pipe(
    //         map((res) => {
    //             const data: { request?: Partial<IClient>; response?: IClientChannel } = {};
    //             data.request = request;
    //             data.response = {
    //                 ...res?.data,
    //             };
    //             return data;
    //         })
    //     );
    // }

    // Create channel with publish message
    public createChannel(
        message: IInboundMessageModel | Message,
        request: Partial<IClient>,
        token: string,
        uuid: string = null,
        otherParams: { [key: string]: any } = {}
    ): Observable<{ request?: Partial<IClient>; response?: IClientChannel }> {
        this.options.headers.Authorization = uuid ? `${token}:${uuid}` : token;
        return this.http
            .post<{ message: string; success: boolean }>(
                URLS.CHAT.SEND.replace(':URL', this.apiUrl),
                {
                    ...message,
                    channelDetail: request,
                    ...this.identityVerificationService.getUserData(),
                    ...otherParams,
                },
                this.options
            )
            .pipe(
                map((res) => {
                    const data: { request?: Partial<IClient>; response?: IClientChannel } = {};
                    data.request = request;
                    data.response = {
                        ...res?.data,
                    };
                    return data;
                })
            );
    }

    public updateChannel(
        request: IChannel,
        token: string
    ): Observable<{ request?: Partial<IClient>; response?: IClientChannel }> {
        this.options.headers.Authorization = token;
        return this.http
            .put(
                URLS.CHAT.CREATE_CHANNEL.replace(':URL', this.apiUrl),
                { ...request, ...this.identityVerificationService.getUserData() },
                this.options
            )
            .pipe(
                map((res) => {
                    const data: { request?: Partial<IClient>; response?: IClientChannel } = {};
                    data.request = request;
                    data.response = { ...res?.data };
                    return data;
                })
            );
    }

    public getChannelList(data: any, token: string, uuid: string = null): Observable<IClientListResp> {
        this.options.headers.Authorization = uuid ? `${token}:${uuid}` : token;
        return this.http.post<IClientListResp>(
            URLS.CHAT.CHANNEL_LIST.replace(':URL', this.apiUrl),
            {
                ...data,
                ...this.identityVerificationService.getUserData(),
                is_anon: Boolean(getCookie('hello-widget-anonymous-uuid')),
            },
            this.options
        );
    }

    public updateClient(data: Partial<IClient>, token: string): Observable<IClient> {
        this.options.headers.Authorization = token;
        return this.http
            .put(
                URLS.CHAT.CLIENTS.replace(':URL', this.apiUrl),
                {
                    ...data,
                    ...this.identityVerificationService.getUserData(),
                },
                this.options
            )
            .pipe(
                map((res) => {
                    const data: IClient = { ...res.data };
                    return data;
                })
            );
    }

    public getClientParams(token: string): Observable<IClientParam> {
        this.options.headers.Authorization = token;
        return this.http
            .post(
                URLS.CHAT.CLIENT_PARAM.replace(':URL', this.apiUrl),
                this.identityVerificationService.getUserData(),
                this.options
            )
            .pipe(
                map((res) => {
                    const data: IClientParam = res;
                    data.default_params = data.default_params.map((x) => {
                        x.isDefault = true;
                        return x;
                    });
                    data.standard_params = data.standard_params.map((x) => {
                        x.isDefault = false;
                        return x;
                    });
                    data.custom_params = data.custom_params.map((x) => {
                        x.isDefault = false;
                        return x;
                    });
                    return data;
                })
            );
    }

    // public getPubNubKey(token: string, uuid: string = null): Observable<IPubNubKeys> {
    //     this.options.headers.Authorization = uuid ? `${token}:${uuid}` : token;
    //     return this.http.get<IPubNubKeys>(URLS.CHAT.GET_KEYS.replace(':URL', this.apiUrl), '', this.options);
    // }

    public getWidgetInfo(token: string): Observable<IWidgetInfo> {
        this.options.headers.Authorization = token;
        console.log(this.apiUrl)
        return this.http.post<IWidgetInfo>(
            URLS.CHAT.WIDGET_INFO.replace(':URL', this.apiUrl),
            this.identityVerificationService.getUserData(),
            this.options
        );
    }

    public addDomainTracking(token: string, domain: string): Observable<any> {
        this.options.headers.Authorization = token;
        return this.http.put<any>(
            URLS.CHAT.ADD_DOMAIN.replace(':URL', this.apiUrl),
            {
                'dom': domain,
                ...this.identityVerificationService.getUserData(),
            },
            this.options
        );
    }

    public getAgentTeamList(token: string, uuid: string = null): Observable<AgentTeamResponse> {
        this.options.headers.Authorization = uuid ? `${token}:${uuid}` : token;
        return this.http.post<AgentTeamResponse>(
            URLS.CHAT.AGENT_TEAM_LIST.replace(':URL', this.apiUrl),
            this.identityVerificationService.getUserData(),
            this.options
        );
    }

    // public updateReadTime(
    //     channel: string,
    //     token: string,
    //     uuid: string = null
    // ): Observable<{ message: string; success: boolean }> {
    //     this.options.headers.Authorization = uuid ? `${token}:${uuid}` : token;
    //     return this.http.delete<{ message: string; success: boolean }>(
    //         URLS.CHAT.READ_RECEIPT.replace(':URL', this.apiUrl) + channel,
    //         '',
    //         { ...this.options, body: this.identityVerificationService.getUserData() }
    //     );
    // }

    public addUnReadCount(channel: string, token: string): Observable<{ message: string; success: boolean }> {
        this.options.headers.Authorization = token;
        return this.http.put<{ message: string; success: boolean }>(
            URLS.CHAT.READ_RECEIPT.replace(':URL', this.apiUrl) + channel,
            this.identityVerificationService.getUserData(),
            this.options
        );
    }

    public sendUnreadNotification(
        data: SendUnreadNotificationReq,
        token: string,
        uuid: string = null
    ): Observable<{ message: string; success: boolean }> {
        this.options.headers.Authorization = uuid ? `${token}:${uuid}` : token;
        return this.http.post<{ message: string; success: boolean }>(
            URLS.CHAT.UNREAD_NOTIFICATION.replace(':URL', this.apiUrl),
            {
                ...data,
                ...this.identityVerificationService.getUserData(),
            },
            this.options
        );
    }

    public deleteUnReadCount(channel: string, token: string): Observable<{ message: string; success: boolean }> {
        this.options.headers.Authorization = token;
        return this.http.delete<{ message: string; success: boolean }>(
            URLS.CHAT.READ_RECEIPT.replace(':URL', this.apiUrl) + channel,
            {},
            {
                ...this.options,
                body: {
                    ...this.identityVerificationService.getUserData(),
                },
            }
        );
    }

    // public getReadTime(token: string, uuid: string = null): Observable<{ message: string; success: boolean }> {
    //     this.options.headers.Authorization = uuid ? `${token}:${uuid}` : token;
    //     return this.http.get<{ message: string; success: boolean }>(
    //         URLS.CHAT.READ_RECEIPT.replace(':URL', this.apiUrl),
    //         '',
    //         this.options
    //     );
    // }

    public botConversation(data: { content: string; channel: string }, authToken: string): Observable<any> {
        this.options.headers.Authorization = authToken;
        return this.http.post<any>(
            URLS.CHAT.BOT_CONVERSATION.replace(':URL', this.apiUrl),
            {
                ...data,
                ...this.identityVerificationService.getUserData(),
            },
            this.options
        );
    }

    public classifyChannel(
        data: { content: string; pb_channel_id: number },
        authToken: string
    ): Observable<IClassificationChannel> {
        this.options.headers.Authorization = authToken;
        return this.http.put<IClassificationChannel>(
            URLS.CHAT.CLASSIFY_CHANNEL.replace(':URL', this.apiUrl),
            {
                ...data,
                ...this.identityVerificationService.getUserData(),
            },
            this.options
        );
    }

    public receiveFeedback(
        data: IPostFeedback,
        token: string
    ): Observable<{ data: IPostFeedback; message: string; success: boolean }> {
        this.options.headers.Authorization = token;
        return this.http.post<{ data: IPostFeedback; message: string; success: boolean }>(
            URLS.CHAT.RECEIVE_FEEDBACK.replace(':URL', this.apiUrl),
            {
                ...data,
                ...this.identityVerificationService.getUserData(),
            },
            this.options
        );
    }

    public uploadChatAttachment(file: File, authorization: string, inboxId: number): Observable<HttpEvent<any>> {
        const formdata = new FormData();
        formdata.append('attachment', file);
        // formdata.append('integration_type', 'chat');
        return this.httpClient.post(
            URLS.CHAT.ATTACHMENT_UPLOAD_V2.replace(':URL', this.apiUrl) + `?type=chat&inbox_id=${inboxId}`,
            formdata,
            {
                observe: 'events',
                reportProgress: true,
                headers: {
                    Authorization: authorization,
                },
                withCredentials: false,
            }
        );
    }

    // public validatePhoneNo(number: string): Observable<IPhoneValidation> {
    //     return this.http.post(URLS.VALIDATION.PHONE.replace(':URL', this.apiUrl), {
    //         number,
    //         ...this.identityVerificationService.getUserData(),
    //     });
    // }

    public sendMessage(
        data: IInboundMessageModel | Message,
        token: string,
        uuid: string = null,
        otherParams: { [key: string]: any } = {}
    ): Observable<{ message: string; success: boolean }> {
        this.options.headers.Authorization = uuid ? `${token}:${uuid}` : token;
        return this.http.post<{ message: string; success: boolean }>(
            URLS.CHAT.SEND.replace(':URL', this.apiUrl),
            {
                ...data,
                ...this.identityVerificationService.getUserData(),
                ...otherParams,
            },
            this.options
        );
    }

    public getGreetingData(company_id: string | any, bot_id: string | any, uuid: any, token: any, botType: string) {
        this.options.headers.Authorization = uuid ? `${token}:${uuid}` : token;
        const params = {
            company_id: company_id,
            bot_id: bot_id,
        };
        if (botType === 'lex') {
            return this.http.post<{ data: { greeting: { text: string; options: []; is_enabled: boolean } } }>(
                URLS.CHAT.LEX_GREETING.replace(':URL', this.apiUrl),
                { ...params, is_anon: Boolean(getCookie('hello-widget-anonymous-uuid')) },
                this.options
            );
        } else {
            return this.http.get<{ data: { greeting: { text: string; options: []; is_enabled: boolean } } }>(
                URLS.CHAT.GREETING.replace(':URL', this.apiUrl),
                { ...params, is_anon: Boolean(getCookie('hello-widget-anonymous-uuid')) },
                this.options
            );
        }
    }

    public getAnonymousClientId(
        token: string
    ): Observable<MicroserviceBaseResponse<{ uuid: string; contact_id: string }, void>> {
        this.options.headers.Authorization = token;
        return this.http.post<MicroserviceBaseResponse<{ uuid: string; contact_id: string }, void>>(
            URLS.CHAT.CREATE_ANONYMOUS_USER.replace(':URL', this.apiUrl),
            null,
            this.options
        );
    }
}
