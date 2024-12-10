import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelloOneInboxLeftMenuComponent } from './hello-one-inbox-left-menu/hello-one-inbox-left-menu.component';
import { AddOneInboxDialogComponent } from './add-one-inbox-dialog/add-one-inbox-dialog.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { SkeletonLoaderDirectiveModule } from '@msg91/directives/skeleton-loader';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        MatCheckboxModule,
        FormsModule,
        MatIconModule,
        MatTooltipModule,
        MatListModule,
        MatButtonModule,
        SkeletonLoaderDirectiveModule,
    ],
    declarations: [HelloOneInboxLeftMenuComponent, AddOneInboxDialogComponent],
    exports: [HelloOneInboxLeftMenuComponent, AddOneInboxDialogComponent],
})
export class UiHelloOneInboxLeftMenuModule {}
