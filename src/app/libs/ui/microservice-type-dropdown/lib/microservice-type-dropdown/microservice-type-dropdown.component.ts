import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { BaseComponent } from '@msg91/ui/base-component';
import { MicroServiceTypeDropdownComponentStore } from './microservice-type-dropdown.store';
import { MicroServiceTypeDropdownService } from './microservice-type-dropdown.services';
import { Observable } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { IMicroserviceType } from '@msg91/models/subscription-models';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
    selector: 'msg91-microservice-type-dropdown',
    templateUrl: './microservice-type-dropdown.component.html',
    styleUrls: ['./microservice-type-dropdown.component.scss'],
    providers: [MicroServiceTypeDropdownComponentStore, MicroServiceTypeDropdownService],
})
export class MicroServiceTypeDropdownComponent extends BaseComponent implements OnInit, OnDestroy, OnChanges {
    @Input() public selectedMicroServiceId: string | number | number[] = '';
    @Input() public displaySMS = false;
    @Input() public allowMultipleSelection: boolean = false;
    @Input() public matFormFieldClass: string = '';
    /** Show microservices except this microservice ID */
    @Input() public filterMicroserviceId: number;
    @Output() public microserviceSelected = new EventEmitter<string | number | number[]>();
    @Output() public microservices = new EventEmitter<IMicroserviceType[]>();
    @Output() public microserviceTypeList = new EventEmitter<IMicroserviceType[]>();
    @Output() public checkSelectFieldsState = new EventEmitter<boolean>();
    public microServiceType$: Observable<IMicroserviceType[]> = this.componentStore.microServiceType$;
    public selectedName: string = 'All';
    public imagePath: string;

    constructor(private componentStore: MicroServiceTypeDropdownComponentStore) {
        super();
    }

    public ngOnInit(): void {
        this.componentStore.getMicroServiceType({ displaySMS: this.displaySMS });
        this.microServiceType$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            this.microserviceTypeList.emit(res);
            if (res) {
                if (this.allowMultipleSelection) {
                    this.selectedMicroServiceId = res.map((e) => e.id);
                } else {
                    this.makeSelectedMicroservice();
                }
                this.microservices.emit(res);
            }
        });
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['selectedMicroServiceId']) {
            this.makeSelectedMicroservice();
        }
    }

    public makeSelectedMicroservice(): void {
        this.microServiceType$.pipe(take(1)).subscribe((res) => {
            if (res && res.length) {
                this.selectedName =
                    this.selectedMicroServiceId === ''
                        ? 'All'
                        : res?.find((e) => e.id === +this.selectedMicroServiceId)?.name;
                this.imagePath =
                    'assets/images/microservice-icon/' + this.selectedName?.toLowerCase().split(' ').join('') + '.svg';
            }
        });
    }

    public toggleSelectStatusAll(checkbox: MatCheckboxChange): void {
        if (checkbox.checked) {
            this.selectedMicroServiceId = this.getValueFromObservable(this.microServiceType$)?.map((e) => e.id);
            this.microserviceSelected.emit(this.selectedMicroServiceId);
        } else {
            this.selectedMicroServiceId = '';
            this.microserviceSelected.emit(this.selectedMicroServiceId);
        }
    }

    public onSelectValue(): void {
        if (this.allowMultipleSelection) {
            this.microserviceSelected.emit(this.selectedMicroServiceId);
        } else {
            this.makeSelectedMicroservice();
            this.microserviceSelected.emit(this.selectedMicroServiceId as string | number);
        }
    }
}
