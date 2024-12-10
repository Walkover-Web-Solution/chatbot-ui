import { createAction, props } from '@ngrx/store';
import { FAQ_SECTION, IArticle, IFAQ } from '../../../model';

export const getFolders = createAction('[FAQ] get all folders', props<{ widgetToken: string }>());
export const getFoldersComplete = createAction('[FAQ] get all folders Complete', props<{ faqs: IFAQ[] }>());

export const selectFolderId = createAction('[FAQ] select folderId', props<{ folderId: string; widgetToken: string }>());

export const getArticlesForFolderId = createAction(
    '[FAQ] get Articles for folderId',
    props<{ folderId: string; query?: string; widgetToken: string }>()
);
export const getFoldersArticlesComplete = createAction(
    '[FAQ] get all folders articles Complete',
    props<{ articles: IArticle[] }>()
);

export const getArticlesFromSearched = createAction(
    '[FAQ] get Articles From Searched',
    props<{ folderId?: string; query: string; widgetToken: string }>()
);
export const getSearchedArticlesComplete = createAction(
    '[FAQ] get searched articles Complete',
    props<{ articles: IArticle[] }>()
);

export const setCurrentView = createAction('[FAQ] Set Current View', props<{ view: FAQ_SECTION }>());

export const selectArticle = createAction(
    '[FAQ] select article folderId',
    props<{ articleId: string; widgetToken: string }>()
);
