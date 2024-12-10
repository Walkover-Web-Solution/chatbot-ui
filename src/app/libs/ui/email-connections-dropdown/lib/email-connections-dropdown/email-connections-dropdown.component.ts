import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IConnection, PROVIDERS_ICON_PATH } from '@msg91/models/email-models';
import { errorResolver } from '@msg91/models/root-models';
import { ConnectionsService } from '@msg91/services/msg91/email/connections';
import { BaseComponent } from '@msg91/ui/base-component';
import { PrimeNgToastService } from '@msg91/ui/prime-ng-toast';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
    selector: 'msg91-email-connections-dropdown',
    templateUrl: './email-connections-dropdown.component.html',
})
export class EmailConnectionsDropdownComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input() connectionFormControl: FormControl<number>;
    @Input() label: string = 'Connection';
    @Input() formFieldClass: string = 'w-100';
    @Input() createConnectionURL: string;
    @Output() selectedConnection = new BehaviorSubject<IConnection>(null);
    @Output() isConnectionLoading = new BehaviorSubject<boolean>(false);

    public providersIconPath = PROVIDERS_ICON_PATH;

    public connections = new BehaviorSubject<IConnection[]>([]);
    public params = {
        page: 1,
        per_page: 1000,
    };

    constructor(
        private service: ConnectionsService,
        private toast: PrimeNgToastService
    ) {
        super();
    }

    ngOnInit(): void {
        this.getConnections();
        this.connectionFormControl?.valueChanges
            ?.pipe(distinctUntilChanged(isEqual), takeUntil(this.destroy$))
            ?.subscribe((value) => {
                this.selectConnection(value);
            });
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public getConnections(): void {
        this.isConnectionLoading.next(true);
        this.service.getConnections(this.params)?.subscribe({
            next: (res) => {
                this.isConnectionLoading.next(false);
                if (res?.hasError) {
                    this.toast.error(errorResolver(res?.errors)[0]);
                } else {
                    const connections = res?.data?.data;
                    this.connections.next(connections);
                    if (connections.length === 1 && !this.connectionFormControl.value) {
                        this.connectionFormControl?.setValue(connections[0].id);
                    }
                    this.selectConnection(this.connectionFormControl?.value);
                }
            },
            error: (err) => {
                this.isConnectionLoading.next(false);
                this.toast.error(errorResolver(err?.errors)[0]);
            },
        });
    }

    public selectConnection(value: number): void {
        if (value) {
            let valueFound;
            this.connections?.getValue()?.find((connection) => {
                if (connection.id === value) {
                    this.selectedConnection.next(connection);
                    valueFound = true;
                    return true;
                }
            });
            if (!valueFound && this.connections?.getValue()?.length) {
                this.connectionFormControl?.setValue(null);
                this.selectedConnection.next(null);
                this.connectionFormControl.markAsTouched();
                this.connectionFormControl.updateValueAndValidity();
            }
        }
    }
}
