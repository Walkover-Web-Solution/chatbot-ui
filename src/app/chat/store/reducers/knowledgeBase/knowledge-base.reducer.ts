import { Action, createReducer, on } from '@ngrx/store';
import { FAQ_SECTION, IArticle, IFAQ } from '../../../model';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import * as actions from '../../actions';
import { MAT_ICON_LIST } from '@msg91/constant';

export interface IFAQState extends EntityState<IFAQ> {}

export interface IArticleState extends EntityState<IArticle> {}

export interface IKnowledgeBaseState {
    faqs: IFAQState;
    articles: IArticleState;
    searchedArticles: IArticleState;
    queryString: string;
    currentFolderId: string;
    currentArticleId: string;
    faqInProcess: boolean;
    faqSearchInProcess: boolean;
    currentView: FAQ_SECTION;
}

const faqAdapter: EntityAdapter<IFAQ> = createEntityAdapter({
    selectId: (faq) => faq.id,
});

const articlesAdapters: EntityAdapter<IArticle> = createEntityAdapter({
    selectId: (article) => article.id,
});
export const initialState: IKnowledgeBaseState = {
    faqs: faqAdapter.getInitialState(),
    articles: articlesAdapters.getInitialState(),
    searchedArticles: articlesAdapters.getInitialState(),
    queryString: null,
    currentFolderId: null,
    currentArticleId: null,
    faqInProcess: false,
    faqSearchInProcess: false,
    currentView: FAQ_SECTION.folderList,
};
export const index = createReducer(
    initialState,
    on(actions.getFolders, (state) => ({ ...state, faqInProcess: true })),
    on(actions.getFoldersComplete, (state, { faqs }) => ({
        ...state,
        faqInProcess: false,
        faqs: faqAdapter.upsertMany(
            faqs.map((e) => ({
                ...e,
                icon_url: checkIconExist(e.icon_url),
            })),
            state.faqs
        ),
    })),
    on(actions.selectFolderId, (state, { folderId }) => ({
        ...state,
        currentFolderId: folderId,
    })),
    on(actions.selectArticle, (state, { articleId }) => ({
        ...state,
        currentArticleId: articleId,
    })),
    on(actions.setCurrentView, (state, { view }) => ({
        ...state,
        currentView: view,
    })),
    on(actions.getArticlesForFolderId, (state, { folderId }) => ({
        ...state,
        faqInProcess: true,
    })),
    on(actions.getArticlesFromSearched, (state, { query }) => ({
        ...state,
        queryString: query,
        searchedArticles: articlesAdapters.getInitialState(),
        faqSearchInProcess: true,
    })),
    on(actions.getSearchedArticlesComplete, (state, { articles }) => {
        return {
            ...state,
            searchedArticles: articlesAdapters.upsertMany(formatArticleTitle(articles), state.searchedArticles),
            faqSearchInProcess: false,
        };
    }),
    on(actions.getFoldersArticlesComplete, (state, { articles }) => {
        return {
            ...state,
            faqInProcess: false,
            articles: articlesAdapters.upsertMany(formatArticleTitle(articles), state.articles),
        };
    }),
    on(actions.resetState, (state) => ({
        ...state,
        ...initialState,
    })),
    on(actions.logout, (state) => ({ ...state, ...initialState }))
);

export function reducer(state: IKnowledgeBaseState = initialState, action: Action) {
    return index(state, action);
}

export const faqSelectIds = faqAdapter.getSelectors().selectIds;
export const faqSelectEntities = faqAdapter.getSelectors().selectEntities;
export const faqSelectAll = faqAdapter.getSelectors().selectAll;
export const faqSelectTotal = faqAdapter.getSelectors().selectTotal;

export const articlesSelectIds = articlesAdapters.getSelectors().selectIds;
export const articlesSelectEntities = articlesAdapters.getSelectors().selectEntities;
export const articlesSelectAll = articlesAdapters.getSelectors().selectAll;
export const articlesSelectTotal = articlesAdapters.getSelectors().selectTotal;

function formatArticleTitle(articles: IArticle[]): IArticle[] {
    return [...articles].map((e) => ({ ...e, formattedTitle: e.title.replace(/(<([^>]+)>)/gi, '') }));
}

function checkIconExist(folderUrl): string {
    if (MAT_ICON_LIST.find((e) => e === folderUrl)) {
        return folderUrl;
    }
    return 'folder';
}
