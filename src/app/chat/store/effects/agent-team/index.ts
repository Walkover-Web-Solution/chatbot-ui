import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, skip, switchMap, take } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { getAuthToken, selectClient, selectWidgetCompanyId, selectWidgetToken } from '../../selectors';
import { EMPTY, of } from 'rxjs';
import { ChatService } from '../../../service/chat.service';
import {
    GetAgentsTeamsData,
    GetAgentsTeamsDataComplete,
    GetAgentsTeamsDataError,
    InitPubNubObject,
    SubscribeChannels,
    getAnonymousClientId,
    setChannels,
    setClient,
    setWidgetClientUuid,
} from '../../actions';
import { IAppState } from '../../index';
import { getCookie, setCookie } from '../../../utils';
import { environment } from 'src/environments/environment';

@Injectable()
export class AgentsTeamEffects {
    getAgentsTeams$ = createEffect(() =>
        this.actions.pipe(
            ofType(GetAgentsTeamsData),
            switchMap((action) => {
                let authToken;
                this.store.pipe(select(getAuthToken), take(1)).subscribe((res) => (authToken = res));
                return this.service.getAgentTeamList(authToken).pipe(
                    map((response) => {
                        return GetAgentsTeamsDataComplete(response);
                    }),
                    catchError((err) => {
                        return of(GetAgentsTeamsDataError(err));
                    })
                );
            })
        )
    );

    getAnonymousClientId$ = createEffect(() =>
        this.actions.pipe(
            ofType(getAnonymousClientId),
            switchMap(() => {
                let authorization;
                this.store.pipe(select(getAuthToken), take(1)).subscribe((res) => (authorization = res));
                if (!getCookie('hello-widget-uuid')) {
                    // Only get anonymous ID when UUID is not present in cookie
                    return this.service.getAnonymousClientId(authorization).pipe(
                        switchMap((response) => {
                            if (response.success) {
                                let client;
                                this.store.pipe(select(selectClient), take(1)).subscribe((res) => (client = res));
                                let widgetToken;
                                this.store.pipe(select(selectWidgetToken), take(1)).subscribe((res) => {
                                    widgetToken = res;
                                });
                                let companyId;
                                this.store.pipe(select(selectWidgetCompanyId), take(1)).subscribe((res) => {
                                    companyId = res;
                                });
                                // response.data.uuid = '653a633a7f1da52e80ecef17';
                                // response.data.contact_id = '8147c7eab320467eaae7e3f1e8c7f8fa';
                                let isPubNubInitialized;
                                this.store
                                    .pipe(
                                        select((p) => p.pubnub.isPubNubInitialized),
                                        skip(1),
                                        take(1)
                                    )
                                    .subscribe((res) => {
                                        isPubNubInitialized = res;
                                    });
                                setCookie(
                                    'hello-widget-anonymous-uuid',
                                    response.data?.uuid,
                                    environment.anonymousUuidExpiryInDays
                                );
                                return [
                                    setClient({
                                        client: {
                                            ...client,
                                            /*
                                                Setting both unique_id and uuid in case of anonymous user.
                                                unique_id: Contains the value of field set as contact_id at Segmento
                                                uuid: Contains the value of Segmento Mongo object ID
                                            */
                                            unique_id: response.data?.contact_id,
                                            uuid: response.data?.uuid,
                                        },
                                    }),
                                    setWidgetClientUuid({ client_uuid: response.data?.uuid }),
                                    InitPubNubObject({
                                        request: {
                                            uuid: response.data?.uuid,
                                            widgetToken: widgetToken || '',
                                        },
                                        reconnection: false,
                                    }),
                                ];
                            }
                        }),
                        catchError(() => {
                            return EMPTY;
                        })
                    );
                } else {
                    return EMPTY;
                }
            })
        )
    );

    constructor(private service: ChatService, private store: Store<IAppState>, private actions: Actions) {}
}
