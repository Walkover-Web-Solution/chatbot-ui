import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { OneInboxService } from '@msg91/services/msg91/hello';
import { BaseComponent } from '@msg91/ui/base-component';
import { BehaviorSubject, filter, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AddOneInboxDialogComponent } from '../add-one-inbox-dialog/add-one-inbox-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@msg91/ui/confirm-dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { PrimeNgToastService } from '@msg91/ui/prime-ng-toast';

@Component({
    selector: 'msg91-hello-one-inbox-left-menu',
    templateUrl: './hello-one-inbox-left-menu.component.html',
    styleUrls: ['./hello-one-inbox-left-menu.component.scss'],
    providers: [OneInboxService],
})
export class HelloOneInboxLeftMenuComponent extends BaseComponent implements OnInit, OnDestroy, OnChanges {
    @Input() showTooltip: boolean = false;
    @Input() currentOneInboxID: any = null;
    @Input() refetchInboxList: boolean = false;
    @Output() oneInboxList = new EventEmitter<any>();
    @Output() goToOneInbox = new EventEmitter<any>();
    public agentOneInboxes = new BehaviorSubject<any>(null);
    constructor(
        private service: OneInboxService,
        private dialog: MatDialog,
        private router: Router,
        public iconRegistry: MatIconRegistry,
        public sanitizer: DomSanitizer,
        private toast: PrimeNgToastService
    ) {
        super();
        iconRegistry.addSvgIcon(
            'whatsapp-outline',
            sanitizer.bypassSecurityTrustResourceUrl('assets/images/icons/whatsapp-outline.svg')
        );
        iconRegistry.addSvgIcon(
            'telegram',
            sanitizer.bypassSecurityTrustResourceUrl('assets/images/microservice-icon/telegram.svg')
        );
        iconRegistry.addSvgIcon(
            'twitter',
            sanitizer.bypassSecurityTrustResourceUrl('assets/images/microservice-icon/twitter.svg')
        );
    }

    public ngOnInit(): void {
        this.getAgentInboxes();

        this.service.fetchInboxList$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((res) => {
            this.getAgentInboxes();
        });
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes?.refetchInboxList && this.refetchInboxList) {
            this.getAgentInboxes();
        }
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public getAgentInboxes(): void {
        this.service.getOneInboxList({ agent_inboxes: true }).subscribe((data) => {
            this.agentOneInboxes.next(data?.data?.inbox_list);
            this.oneInboxList.emit(data?.data);
        });
    }

    public addOneInbox(): void {
        this.service.setFetchInboxListStatus(false);
        const dialogRef = this.dialog.open(AddOneInboxDialogComponent, {
            panelClass: ['mat-dialog', 'mat-dialog-md'],
            maxHeight: 'calc(100vh - 64px)',
        });

        dialogRef.afterClosed().subscribe((res) => {
            if (res) {
                this.service.setFetchInboxListStatus(true);
            }
        });
    }

    public deleteOneInbox(id: number): void {
        const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent);
        const componentInstance = dialogRef.componentInstance;
        componentInstance.confirmationMessage = `Are you sure want to delete?`;
        componentInstance.confirmButtonText = 'Delete';
        componentInstance.confirmButtonColor = 'warn';
        dialogRef.afterClosed().subscribe((action) => {
            if (action === 'yes') {
                this.service.setFetchInboxListStatus(false);
                this.service.deleteOneInbox(id).subscribe(
                    (data) => {
                        this.toast.success(data?.message as string);
                        this.service.setFetchInboxListStatus(true);
                        if (+this.currentOneInboxID === +id) {
                            this.router.navigate(['/m', 'l', 'hello', 'one-inbox']);
                        }
                    },
                    (error) => {
                        this.toast.error(error?.errors as string);
                    }
                );
            }
        });
    }

    public redirectToInbox(inbox: any): void {
        if (+this.currentOneInboxID === +inbox?.id) {
            return;
        }
        this.router.navigate([
            '/m',
            'l',
            'hello',
            'one-inbox',
            inbox?.inbox_type === 'mail' ? 'mail' : 'chat',
            inbox?.id,
        ]);
        this.goToOneInbox.emit(inbox);
    }
}
