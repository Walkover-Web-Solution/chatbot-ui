import { Component, Input, OnDestroy } from '@angular/core';
import { BaseComponent } from '@msg91/ui/base-component';
import { IArticle } from '../../../model';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'msg91-articles-view',
    templateUrl: './articles-view.component.html',
    styleUrls: ['./articles-view.component.scss'],
    standalone: false
})
export class ArticlesViewComponent extends BaseComponent implements OnDestroy {
    @Input() currentArticle: IArticle;
    appurl: string = environment.appUrl;

    constructor() {
        super();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    public selectArticle(id: string) {
        // this.chatStore.selectFAQArticle(id);
        //
    }

    openAsElement(title, message) {
        // this.popup.showAsElement(title, message);
    }
}
