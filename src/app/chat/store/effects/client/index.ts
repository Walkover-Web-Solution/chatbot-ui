import { Injectable } from '@angular/core';
import { ChatService } from '../../../service/chat.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
    chatInputSubmitted,
    updateClient,
    updateClientComplete,
    updateClientError,
    UpdateFormMessage,
} from '../../actions';
import { catchError, switchMap, take } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { IAppState } from '../../index';
import { getAuthToken, selectDefaultClientParams } from '../../selectors';
import { of } from 'rxjs';
import { IMessage, IParam, MessageTypes } from '../../../model';

@Injectable()
export class ClientEffects {
    updateClient$ = createEffect(() =>
        this.actions.pipe(
            ofType(updateClient),
            switchMap(({ client, channel }) => {
                let authToken;
                this.store.pipe(select(getAuthToken), take(1)).subscribe((token) => (authToken = token));
                return this.service.updateClient(client, authToken).pipe(
                    switchMap((res) => {
                        let client_params: IParam[];
                        this.store
                            .pipe(select(selectDefaultClientParams), take(1))
                            .subscribe((params) => (client_params = params));
                        if (client_params?.length) {
                            client_params.forEach((x) => {
                                if (Object.keys(res).findIndex((y) => y === x.name)) {
                                    res[x.name] = res[x.id];
                                }
                            });
                        }
                        return [updateClientComplete({ client: res, channel })];
                    }),
                    catchError((err) => {
                        return of(updateClientError({ error: err }));
                    })
                );
            })
        )
    );
    updateClientComplete$ = createEffect(() =>
        this.actions.pipe(
            ofType(updateClientComplete),
            switchMap(({ channel, client }) => {
                if (channel) {
                    const FormSubmitMsg: IMessage = {
                        message: {
                            id: new Date().getTime(),
                            formSubmitted: true,
                            type: MessageTypes.FORM_SUBMIT,
                            country_iso2: client.country_iso2,
                            channel: channel,
                        },
                        timetoken: new Date().getTime(),
                        channel: channel,
                    };
                    return [UpdateFormMessage({ response: { message: FormSubmitMsg, channel } }), chatInputSubmitted()];
                } else {
                    return of({ type: 'Nothing To Update' });
                }
            })
        )
    );

    constructor(private service: ChatService, private store: Store<IAppState>, private actions: Actions) {}
}
