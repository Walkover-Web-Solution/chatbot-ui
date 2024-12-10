import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { IAppState } from '../../index';
import { ChatService } from '../../../service/chat.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { setMessageBoxState, uploadFile, uploadFileComplete, uploadFileError, uploadFileProgress } from '../../actions';
import { catchError, distinctUntilChanged, exhaustMap, switchMap, take, tap } from 'rxjs/operators';
import {
    getAuthToken,
    getUnSendContent,
    selectPresenceChannel,
    selectTypingChannel,
    selectWidgetInfo,
} from '../../selectors';
import { EMPTY, of } from 'rxjs';
import { HttpEventType } from '@angular/common/http';
import { IFileResponse } from '../../../model';
import { SocketService } from '../../../service/socket.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class BehaviourEffects {
    onMessageBoxStateChange = createEffect(
        () =>
            this.actions.pipe(
                ofType(setMessageBoxState),
                distinctUntilChanged((x, y) => x.activeState === y.activeState),
                switchMap((action) => {
                    // return EMPTY;
                    let presenceChannel;
                    let isPubNubInitialized;
                    let content;
                    let typingChannel;
                    this.store.pipe(select(selectPresenceChannel), take(1)).subscribe((res) => (presenceChannel = res));
                    this.store.pipe(select(getUnSendContent), take(1)).subscribe((res) => (content = res));
                    this.store
                        .pipe(
                            select((p) => p.pubnub.isPubNubInitialized),
                            take(1)
                        )
                        .subscribe((res) => (isPubNubInitialized = res));
                    this.store.pipe(select(selectTypingChannel), take(1)).subscribe((res) => (typingChannel = res));
                    const selectedTypingChannel = environment.enableHelloNewSocketSubscription
                        ? typingChannel
                        : presenceChannel;
                    if (selectedTypingChannel && isPubNubInitialized) {
                        if (action.activeState === 'Typing' && action.channel) {
                            return this.socketService.setTypingClient(
                                {
                                    action: 'typing',
                                    channel: action.channel,
                                },
                                selectedTypingChannel
                            );
                        } else if (
                            (action.channel && action.activeState === 'Not-Empty') ||
                            (!content &&
                                (action.activeState === 'Empty' ||
                                    action.activeState === 'Blurred' ||
                                    action.activeState === 'Focused'))
                        ) {
                            return this.socketService.setNotTypingClient(
                                {
                                    action: 'not-typing',
                                    channel: action.channel,
                                },
                                selectedTypingChannel
                            );
                        } else {
                            return EMPTY;
                        }
                    } else {
                        return EMPTY;
                    }
                }),
                catchError((err) => {
                    console.log(err);
                    return of(err);
                })
            ),
        { dispatch: false }
    );

    uploadingFile = createEffect(() =>
        this.actions.pipe(
            ofType(uploadFile),
            exhaustMap((action) => {
                let auth, widgetInfo;
                this.store.pipe(select(getAuthToken), take(1)).subscribe((res) => (auth = res));
                this.store.pipe(select(selectWidgetInfo), take(1)).subscribe((res) => (widgetInfo = res));
                return this.service.uploadChatAttachment(action.file, auth, widgetInfo?.inbox_id).pipe(
                    switchMap((res) => {
                        switch (res.type) {
                            case HttpEventType.UploadProgress: {
                                const percentage = res.total ? (100 * res.loaded) / res.total : 0;
                                return [uploadFileProgress({ progress: percentage })];
                            }
                            case HttpEventType.Response: {
                                return [
                                    uploadFileProgress({ progress: 100 }),
                                    uploadFileComplete({ response: res.body as IFileResponse }),
                                ];
                            }
                            default: {
                                return [{ type: 'Unknown upload Action' }];
                            }
                        }
                    }),
                    catchError((err) => {
                        return of(uploadFileError({ error: err }));
                    })
                );
            })
        )
    );

    constructor(
        private store: Store<IAppState>,
        private socketService: SocketService,
        private service: ChatService,
        private actions: Actions
    ) {}
}
