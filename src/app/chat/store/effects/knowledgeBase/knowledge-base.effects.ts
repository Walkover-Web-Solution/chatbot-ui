import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ChatService } from '../../../service/chat.service';
import * as actions from '../../actions';
import { catchError, exhaustMap, map, switchMap, take } from 'rxjs/operators';
import { FAQ_SECTION, IFAQ } from '../../../model';
import { EMPTY, of } from 'rxjs';
import { IAppState } from '../../index';
import { select, Store } from '@ngrx/store';
import { currentFaqID } from '../../selectors/knowledgeBase/knowledge-base.selector';

@Injectable()
export class KnowledgeBaseEffect {
    getAllFaqs = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.getFolders),
            exhaustMap(({ widgetToken }) => {
                return this.service.getFolders(widgetToken).pipe(
                    switchMap((faqs: IFAQ[]) => {
                        return [
                            actions.getFoldersComplete({ faqs }),
                            actions.setCurrentView({ view: FAQ_SECTION.folderList }),
                        ];
                    })
                );
            }),
            catchError((err) => {
                return of(actions.getFoldersComplete({ faqs: [] }));
            })
        )
    );

    setFolderId = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.selectFolderId),
            switchMap(({ folderId, widgetToken }) => {
                if (folderId !== null) {
                    return [
                        actions.getArticlesForFolderId({ folderId, widgetToken }),
                        actions.setCurrentView({ view: FAQ_SECTION.articleList }),
                    ];
                } else {
                    return EMPTY;
                }
            })
            // ,
            // catchError((err) => {
            //   // return of(actions.getFoldersArticlesComplete({ articles: [] }));
            // })
        )
    );

    getAllArticles = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.getArticlesForFolderId),
            exhaustMap(({ folderId, widgetToken }) => {
                return this.service.getArticles(folderId, widgetToken, null).pipe(
                    map(({ articles, count }) => {
                        return actions.getFoldersArticlesComplete({ articles });
                    })
                );
            }),
            catchError((err) => {
                return of(actions.getFoldersArticlesComplete({ articles: [] }));
            })
        )
    );

    searchArticles = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.getArticlesFromSearched),
            switchMap(({ folderId, query, widgetToken }) => {
                let currentFaq;
                this.store.pipe(select(currentFaqID), take(1)).subscribe((res) => (currentFaq = res));
                if (!!query || query !== '') {
                    return this.service.getArticles(folderId, widgetToken, null, query).pipe(
                        switchMap(({ articles, count }) => {
                            return [
                                actions.getSearchedArticlesComplete({ articles }),
                                actions.setCurrentView({ view: FAQ_SECTION.searchResult }),
                            ];
                        }),
                        catchError((err) => {
                            return of(actions.getSearchedArticlesComplete({ articles: [] }));
                        })
                    );
                } else if (currentFaq) {
                    return of('').pipe(
                        switchMap(() => {
                            return [
                                actions.setCurrentView({ view: FAQ_SECTION.articleList }),
                                actions.getSearchedArticlesComplete({ articles: [] }),
                            ];
                        })
                    );
                }
                return of('').pipe(
                    switchMap(() => {
                        return [
                            actions.setCurrentView({ view: FAQ_SECTION.folderList }),
                            actions.getSearchedArticlesComplete({ articles: [] }),
                        ];
                    })
                );
            })
        )
    );

    constructor(private actions$: Actions, private store: Store<IAppState>, private service: ChatService) {}
}
