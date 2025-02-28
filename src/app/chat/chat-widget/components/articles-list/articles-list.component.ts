import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { BaseComponent } from '@msg91/ui/base-component';
import { IArticle } from '../../../model';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../store';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'msg91-articles-list',
    templateUrl: './articles-list.component.html',
    styleUrls: ['./articles-list.component.scss'],
    standalone: false
})
export class ArticlesListComponent extends BaseComponent implements OnDestroy {
    @Input() public widgetToken: string;
    @Input() articlesList: IArticle[];
    @Output() selectedArticleId: EventEmitter<string> = new EventEmitter<string>();
    appurl: string = environment.appUrl;

    constructor(private store: Store<IAppState>) {
        super();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    public selectArticle(id: string) {
        this.selectedArticleId.emit(id);
    }
}
