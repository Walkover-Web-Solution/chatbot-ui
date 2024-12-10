import { Component, OnDestroy, OnInit } from '@angular/core';
import { OneInboxService } from '@msg91/services/msg91/hello';
import { BaseComponent } from '@msg91/ui/base-component';
import { BehaviorSubject } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { PrimeNgToastService } from '@msg91/ui/prime-ng-toast';

@Component({
    selector: 'msg91-add-one-inbox-dialog',
    templateUrl: './add-one-inbox-dialog.component.html',
})
export class AddOneInboxDialogComponent extends BaseComponent implements OnInit, OnDestroy {
    public agentAllInboxes = new BehaviorSubject<any>(null);
    public agentOneInboxes = new BehaviorSubject<any>(null);
    public isLoading: boolean = false;
    public allInboxIsLoading: boolean = false;
    public selectedInboxes = {};
    constructor(
        private service: OneInboxService,
        public dialogRef: MatDialogRef<AddOneInboxDialogComponent>,
        private toast: PrimeNgToastService
    ) {
        super();
    }

    public ngOnInit(): void {
        this.allInboxIsLoading = true;
        this.service.getOneInboxList().subscribe((data) => {
            this.agentAllInboxes.next(data?.data);
            this.allInboxIsLoading = false;
        });
        this.getAgentInboxes();
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public getAgentInboxes(): void {
        this.isLoading = true;
        this.service.getOneInboxList({ agent_inboxes: true }).subscribe((data) => {
            this.agentOneInboxes.next(data?.data);
            for (let company in data?.data.inbox_list) {
                for (let inbox of data?.data.inbox_list[company]?.inboxes) {
                    this.selectedInboxes[inbox.inbox_id + '-' + inbox?.inbox_type] = true;
                }
            }
            this.isLoading = false;
        });
    }

    public closeDialog(status: boolean = false): void {
        this.dialogRef.close(status);
    }

    public addInbox(): void {
        let results = [];
        for (let key in this.selectedInboxes) {
            if (this.selectedInboxes[key]) {
                results.push(key);
            }
        }
        let payload = {
            // whatsapp_inboxes: results.filter((e) => e?.includes('whatsapp')).map((e) => +e?.split('-')[0]),
            // mail_inboxes: results.filter((e) => e?.includes('mail')).map((e) => +e?.split('-')[0]),
            // fb_inboxes: results.filter((e) => e?.includes('fb')).map((e) => +e?.split('-')[0]),
            // chat_inboxes: results.filter((e) => e?.includes('chat')).map((e) => +e?.split('-')[0]),
            // number_inboxes: results.filter((e) => e?.includes('number')).map((e) => +e?.split('-')[0]),
            // twitter_inboxes: results.filter((e) => e?.includes('twitter')).map((e) => +e?.split('-')[0]),
            // telegram_inboxes: results.filter((e) => e?.includes('telegram')).map((e) => +e?.split('-')[0]),
            // google_business_inboxes: results
            //     .filter((e) => e?.includes('google_business'))
            //     .map((e) => +e?.split('-')[0]),
            // insta_inboxes: results.filter((e) => e?.includes('instagram')).map((e) => +e?.split('-')[0]),

            cc_inboxes: results.filter((e) => !e?.includes('mail')).map((e) => +e?.split('-')[0]),
            mail_inboxes: results.filter((e) => e?.includes('mail')).map((e) => +e?.split('-')[0]),
        };
        this.service.setFetchInboxListStatus(false);
        this.service.addOneInbox({ inboxes: payload }).subscribe(
            (data) => {
                this.toast.success(data?.message as string);
                this.service.setFetchInboxListStatus(true);
                this.closeDialog(true);
            },
            (error) => {
                this.toast.error(error?.errors as string);
            }
        );
    }
}
