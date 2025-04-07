import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ChatService } from '../../../service/chat.service';
import * as actions from './../../actions';
import { catchError, exhaustMap, take } from 'rxjs/operators';
import { of, zip } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { getCookie, removeCookie } from '../../../utils';
import { select, Store } from '@ngrx/store';
import { getAuthToken } from '../../selectors';

@Injectable()
export class WidgetInfoEffects {
    initWidget$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.initWidget),
            exhaustMap(({ config }) => {
                return zip(
                    this.service.getWidgetInfo(config.widgetToken),
                    this.service.getClientParams(config.widgetToken)
                ).pipe(
                    exhaustMap((res) => {
                        let otherConfigDetails = {};
                        for (let param of res[1].custom_params) {
                            if (param.name in config.additionalData) {
                                otherConfigDetails[param.name] = config.additionalData[param.name];
                            }
                        }
                        for (let param of res[1].standard_params) {
                            if (param.name in config.additionalData) {
                                otherConfigDetails[param.name] = config.additionalData[param.name];
                            }
                        }
                        const anonymousUuid = getCookie('hello-widget-anonymous-uuid-bak');
                        removeCookie('hello-widget-anonymous-uuid-bak')

                        /// if mail or unique_id are passed
                        if (config.mail || config.unique_id || config.number) {
                            // login case
                            // remove uuid from cookies
                            // remove anonymous_client_uuid from payload
                            return [
                                actions.setWidgetInfo({ widgetInfo: res[0] }),
                                actions.setClientParam({ clientParam: res[1] }),
                                actions.setTeams({ teams: res[0].teams }),
                                actions.resetChannelList(),
                                actions.resetClient(),
                                actions.getChannelList({
                                    widgetToken: config.widgetToken,
                                    data: {
                                        mail: config.mail,
                                        name: config.name,
                                        number: config.number,
                                        unique_id: config.unique_id,
                                        uuid: config.client_uuid,
                                        ...otherConfigDetails,
                                    },
                                    uuid: config.client_uuid,
                                }),
                                actions.setClient({
                                    client: {
                                        mail: config.mail,
                                        name: config.name,
                                        number: config.number,
                                        unique_id: config.unique_id,
                                        pseudo_name: !(config.name?.length > 0),
                                        ...otherConfigDetails,
                                    },
                                }),
                                actions.initWidgetSuccess(),
                                actions.GetAgentsTeamsData(),
                            ];
                        } else {
                            // anonymous user
                            if (config.client_uuid) {
                                /// widget already has session
                                return [
                                    actions.setWidgetInfo({ widgetInfo: res[0] }),
                                    actions.setClientParam({ clientParam: res[1] }),
                                    actions.setTeams({ teams: res[0].teams }),
                                    actions.resetChannelList(),
                                    actions.resetClient(),
                                    actions.getChannelList({
                                        widgetToken: config.widgetToken,
                                        data: { uuid: config.client_uuid, anonymous_client_uuid: anonymousUuid },
                                        uuid: config.client_uuid,
                                        ...otherConfigDetails,
                                    }),
                                    actions.setClient({
                                        client: {
                                            mail: config.mail,
                                            name: config.name,
                                            number: config.number,
                                            unique_id: config.unique_id,
                                            pseudo_name: !(config.name?.length > 0),
                                            uuid: config.client_uuid,
                                            ...otherConfigDetails,
                                        },
                                    }),
                                    actions.initWidgetSuccess(),
                                    actions.GetAgentsTeamsData(),
                                ];
                            } else {
                                /// No widget session
                                return [
                                    actions.getAnonymousClientId(),
                                    actions.setWidgetInfo({ widgetInfo: res[0] }),
                                    actions.setTeams({ teams: res[0].teams }),
                                    actions.setClientParam({ clientParam: res[1] }),
                                    actions.resetChannelList(),
                                    actions.resetClient(),
                                    actions.setClient({
                                        client: {
                                            mail: config.mail,
                                            name: config.name,
                                            number: config.number,
                                            unique_id: config.unique_id,
                                            pseudo_name: !(config.name?.length > 0),
                                            ...otherConfigDetails,
                                        },
                                    }),
                                    actions.initWidgetSuccess(),
                                    actions.GetAgentsTeamsData(),
                                ];
                            }
                        }
                    }),
                    catchError((err) => {
                        console.log(err);
                        if (err instanceof HttpErrorResponse) {
                            if (err.status === 401) {
                                removeCookie('hello-widget-uuid');
                                removeCookie('hello-widget-anonymous-uuid');
                                this.store.dispatch(actions.initWidget({ config }));
                            }
                        }
                        return of(actions.initWidgetFailed());
                    })
                );
            }),
            catchError((err) => {
                console.log(err);
                return of(actions.initWidgetFailed());
            })
        )
    );

    addDomainTracking$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.addDomainTracking),
            exhaustMap(({ domain }) => {
                let authToken;
                this.store.pipe(select(getAuthToken), take(1)).subscribe((res) => (authToken = res));
                return this.service.addDomainTracking(authToken, domain).pipe(
                    exhaustMap((res) => {
                        return of(actions.addDomainTrackingSuccess({ status: true }));
                    }),
                    catchError((err) => {
                        console.log(err);
                        return of(actions.addDomainTrackingError({ error: err }));
                    })
                );
            }),
            catchError((err) => {
                console.log(err);
                return of(actions.addDomainTrackingError({ error: err }));
            })
        )
    );

    // initWidgetWithLoginCase$ = createEffect(()=>this.actions$.pipe(ofType()))
    constructor(private actions$: Actions, private store: Store, private service: ChatService) {}
}
