import { Component, Input, OnDestroy, OnInit, ViewEncapsulation, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { distinctUntilChanged, take, takeUntil } from 'rxjs/operators';
import { BaseComponent } from '@msg91/ui/base-component';
import { FAQ_SECTION, IArticle, IFAQ } from '../../../model';
import { select, Store } from '@ngrx/store';
import {
    currentFaq,
    currentFaqView,
    selectAllFaq,
    selectAllSearchedArticles,
    selectCurrentArticle,
    selectCurrentFolderArticles,
    selectFaqInProcess,
    selectFaqTitle,
    selectSearchFaqInProcess,
} from '../../../store/selectors/knowledgeBase/knowledge-base.selector';
import { IAppState } from '../../../store';
import * as actions from '../../../store/actions';
import { isEqual } from 'lodash-es';
import { environment } from '../../../../../environments/environment';
import { ArticlePopupService } from '../artible-pop/article-popup.service';
import { getWidgetTheme } from '../../../store/selectors';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'msg91-faq-view',
    templateUrl: './faq-view.component.html',
    styleUrls: ['./faq-view.component.scss', '../../../icon.css', '../../../css2.css'],
    encapsulation: ViewEncapsulation.ShadowDom,
    standalone: false
})
export class FAQViewComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input() public widgetToken: string;
    public currentFAQ$: Observable<IFAQ>;
    public faqsList$: Observable<IFAQ[]>;
    public currentView$: Observable<FAQ_SECTION>;
    public currentFolderArticleList$: Observable<IArticle[]>;
    public searchedArticleList$: Observable<IArticle[]>;
    public faqInProcess$: Observable<boolean>;
    public faqSearchInProcess$: Observable<boolean>;
    public selectedArticle$: Observable<IArticle>;
    public FAQTitle$: Observable<string>;
    public backgroundImage: any;
    public appurl: string = environment.appUrl;
    public textColor: string;
    public primaryColor: string;
    @Input() isMobileSDK: boolean;
    @Input() isBorderRadiusDisabled: boolean;

    constructor(
        private store: Store<IAppState>,
        private popService: ArticlePopupService,
        private sanitizer: DomSanitizer,
        private ngZone: NgZone
    ) {
        super();
    }

    ngOnInit() {
        this.currentFAQ$ = this.store.pipe(select(currentFaq), takeUntil(this.destroy$), distinctUntilChanged(isEqual));
        this.faqsList$ = this.store.pipe(select(selectAllFaq), takeUntil(this.destroy$), distinctUntilChanged(isEqual));
        this.currentView$ = this.store.pipe(
            select(currentFaqView),
            takeUntil(this.destroy$),
            distinctUntilChanged(isEqual)
        );
        this.currentFolderArticleList$ = this.store.pipe(
            select(selectCurrentFolderArticles),
            takeUntil(this.destroy$),
            distinctUntilChanged(isEqual)
        );
        this.searchedArticleList$ = this.store.pipe(
            select(selectAllSearchedArticles),
            takeUntil(this.destroy$),
            distinctUntilChanged(isEqual)
        );
        this.faqSearchInProcess$ = this.store.pipe(
            select(selectSearchFaqInProcess),
            takeUntil(this.destroy$),
            distinctUntilChanged(isEqual)
        );
        this.faqInProcess$ = this.store.pipe(
            select(selectFaqInProcess),
            takeUntil(this.destroy$),
            distinctUntilChanged(isEqual)
        );
        this.selectedArticle$ = this.store.pipe(
            select(selectCurrentArticle),
            takeUntil(this.destroy$),
            distinctUntilChanged(isEqual)
        );
        this.FAQTitle$ = this.store.pipe(
            select(selectFaqTitle),
            takeUntil(this.destroy$),
            distinctUntilChanged(isEqual)
        );
        this.faqsList$.pipe(take(1)).subscribe((res) => {
            if (!res || !res.length) {
                this.store.dispatch(actions.getFolders({ widgetToken: this.widgetToken }));
            }
        });

        this.store
            .pipe(select(getWidgetTheme), takeUntil(this.destroy$), distinctUntilChanged(isEqual))
            .subscribe((res) => {
                if (res) {
                    this.textColor = res.textColor;
                    this.backgroundImage = res.gradientHeader
                        ? this.transform(
                              `url( \'${this.appurl}assets/img/bg-branding.png\'), linear-gradient(211deg, ${res?.primaryColorDark} 44%, ${res?.primaryColorDark} 40.2%, ${res?.primaryColorLight} 116.5%, ${res?.primaryColorLight} 102.1%)`
                          )
                        : '';
                    this.primaryColor = res.primaryColor;
                }
            });
    }

    transform(style) {
        return this.sanitizer.bypassSecurityTrustStyle(style);
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    public selectFolder(id: string) {
        this.ngZone.run(() => {
            this.store.dispatch(actions.selectFolderId({ folderId: id, widgetToken: this.widgetToken }));
        });
    }

    public searchInFaqList(event: KeyboardEvent) {
        let faqId: string;
        this.currentFAQ$.pipe(take(1)).subscribe((res) => (faqId = res?.id || ''));
        this.store.dispatch(
            actions.getArticlesFromSearched({
                query: (event.currentTarget as any).value,
                widgetToken: this.widgetToken,
                folderId: faqId,
            })
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    backView() {
        let currentView: FAQ_SECTION;
        let targetedView: FAQ_SECTION;
        this.currentView$.pipe(take(1)).subscribe((x) => (currentView = x));
        // this.currentView$.pipe(take(2)).subscribe(x => targetedView = x);
        switch (currentView) {
            case FAQ_SECTION.searchResult: {
                let currentFolderID: string;
                this.currentFAQ$.pipe(take(1)).subscribe((res) => {
                    if (res?.id) {
                        currentFolderID = res.id;
                    }
                });
                if (currentFolderID) {
                    targetedView = FAQ_SECTION.articleList;
                } else {
                    targetedView = FAQ_SECTION.folderList;
                }
                break;
            }
            case FAQ_SECTION.articleList: {
                targetedView = FAQ_SECTION.folderList;
                break;
            }
            case FAQ_SECTION.miniViewArticle: {
                let searchedList: IArticle[];
                let currentArticle: IArticle;
                this.searchedArticleList$.pipe(take(1)).subscribe((res) => (searchedList = res));
                this.selectedArticle$.pipe(take(1)).subscribe((res) => (currentArticle = res));
                if (
                    searchedList?.length &&
                    currentArticle &&
                    searchedList?.findIndex((x) => x.folder_id === currentArticle.folder_id) > -1
                ) {
                    targetedView = FAQ_SECTION.searchResult;
                } else {
                    targetedView = FAQ_SECTION.articleList;
                }
            }
        }
        if (targetedView === FAQ_SECTION.folderList) {
            this.selectFolder(null);
        }
        this.ngZone.run(() => {
            if (!targetedView) {
                this.store.dispatch(actions.setActiveView({ activeView: 'Chat' }));
            } else {
                this.store.dispatch(actions.setCurrentView({ view: targetedView }));
            }
        });
    }

    selectArticle(event: string) {
        if (event) {
            this.store.dispatch(actions.selectArticle({ widgetToken: this.widgetToken, articleId: event }));
            this.store.dispatch(actions.setCurrentView({ view: FAQ_SECTION.miniViewArticle }));
        }
    }

    showFullArticle(article: IArticle) {
        this.popService.showAsElement(article?.title, {
            content: article?.html,
            horizontal_position: 'center',
            vertical_position: 'top',
            isNotification: false,
            width: null,
            height: null,
        });
    }
}
