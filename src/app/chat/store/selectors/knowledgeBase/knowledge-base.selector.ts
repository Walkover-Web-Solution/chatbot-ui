import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
    articlesSelectAll,
    articlesSelectEntities,
    faqSelectAll,
    faqSelectEntities,
    IKnowledgeBaseState,
} from '../../reducers/knowledgeBase';
import { FAQ_SECTION } from '../../../model';

export const knowledgeBaseStore = createFeatureSelector<IKnowledgeBaseState>('knowledgeBase');
export const faqSelecter = createSelector(knowledgeBaseStore, (s) => s.faqs);
export const selectAllFaqEntries = createSelector(faqSelecter, faqSelectEntities);
export const selectAllFaq = createSelector(faqSelecter, faqSelectAll);
export const currentFaqID = createSelector(knowledgeBaseStore, (s) => s.currentFolderId);
export const currentFaqView = createSelector(knowledgeBaseStore, (s) => s.currentView);
export const currentFaq = createSelector(selectAllFaqEntries, currentFaqID, (faqs, id) => faqs[id]);
export const selectFaqByFolderId = (id: string) =>
    createSelector(selectAllFaqEntries, (allFaq) => {
        return allFaq[id];
    });

export const articlesSelecter = createSelector(knowledgeBaseStore, (s) => s.articles);
export const searchedArticlesSelecter = createSelector(knowledgeBaseStore, (s) => s.searchedArticles);
export const currentArticleId = createSelector(knowledgeBaseStore, (s) => s.currentArticleId);
export const selectAllArticles = createSelector(articlesSelecter, articlesSelectAll);
export const selectAllSearchedArticles = createSelector(searchedArticlesSelecter, articlesSelectAll);
export const selectFolderArticlesEntries = createSelector(articlesSelecter, articlesSelectEntities);
export const selectSearchedArticlesEntries = createSelector(searchedArticlesSelecter, articlesSelectEntities);
export const selectAllEntries = createSelector(
    selectFolderArticlesEntries,
    selectSearchedArticlesEntries,
    (folders, searched) => ({ ...folders, ...searched })
);
export const selectFaqInProcess = createSelector(knowledgeBaseStore, (s) => s.faqInProcess);
export const selectSearchFaqInProcess = createSelector(knowledgeBaseStore, (s) => s.faqSearchInProcess);
export const selectCurrentFolderArticles = createSelector(selectAllArticles, currentFaqID, (allArticles, id) => {
    return allArticles.filter((f) => f.folder_id === id);
});

export const selectSearchedArticles = createSelector(selectAllArticles, currentFaqID, (allArticles, id) => {
    return allArticles.filter((f) => f.folder_id === id);
});

export const selectCurrentArticle = createSelector(selectAllEntries, currentArticleId, (allArticles, id) => {
    return allArticles[id];
});

export const selectFaqTitle = createSelector(
    currentFaqView,
    selectAllFaq,
    currentFaq,
    selectCurrentArticle,
    (view, faqList, faq, article) => {
        switch (view) {
            case FAQ_SECTION.folderList: {
                return 'Frequently Asked Questions';
            }
            case FAQ_SECTION.searchResult: {
                if (faq?.name) {
                    return `Searched Articles in ${faq?.name}`;
                }
                return 'Searched Articles';
            }
            case FAQ_SECTION.articleList: {
                if (faq?.name) {
                    return faq.name;
                }
                return 'Article List';
            }
            case FAQ_SECTION.fullViewArticle:
            case FAQ_SECTION.miniViewArticle: {
                if (article?.folder_id && faqList?.length) {
                    const currentFaqName = faqList.find((x) => x.id === article.folder_id)?.name || 'Article View';
                    return currentFaqName;
                }
                return 'Article View';
            }
        }
    }
);
