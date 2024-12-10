import { FormControl } from '@angular/forms';
import { BaseComponent } from '@msg91/ui/base-component';
import { Component, EventEmitter, Input, Output, ChangeDetectorRef, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { FlowService } from '@msg91/service';
import { PrimeNgToastService } from '@msg91/ui/prime-ng-toast';
import { IFlowCallerIDModel } from '@msg91/models/voice-models';

@Component({
    selector: 'msg91-voice-caller-id-dropdown',
    templateUrl: './voice-caller-id-dropdown.component.html',
})
export class VoiceCallerIdDropdownComponent extends BaseComponent implements OnInit {
    @Input() callerIdControl: FormControl;
    @Input() appearance = 'outline';
    @Input() setKeyInValue: string = null;
    @Input() matFormFieldClass = 'w-100';

    @Output() optionSelected: EventEmitter<any> = new EventEmitter();
    @Output() fetchCallerIdInProgressEmit: EventEmitter<any> = new EventEmitter();
    @Output() callerIdEmit: EventEmitter<any> = new EventEmitter();
    @Output() selectedCallerIdData: EventEmitter<any> = new EventEmitter();
    public callerIdList$ = new BehaviorSubject<IFlowCallerIDModel[]>([]);
    public showNoCallerId = false;
    public params = {
        page_num: 1,
        page_size: 100,
    };

    constructor(
        private flowService: FlowService,
        private toast: PrimeNgToastService
    ) {
        super();
    }

    ngOnInit(): void {
        this.fetchCallerIdInProgressEmit.emit(of(true));
        this.fetchCallerId();
    }

    public fetchCallerId(): void {
        this.flowService.getVoiceFlowCallerIDList('/numbers/', this.params).subscribe({
            next: (response) => {
                this.callerIdList$.next(response.data.data);
                this.fetchCallerIdInProgressEmit.emit(of(false));
                this.callerIdEmit.emit(response.data.data);
                this.optionSelected.emit(false);
                if (!this.setKeyInValue && this.callerIdControl.value?.id) {
                    this.callerIdControl.setValue(
                        response?.data?.data?.find((value) => value.id === this.callerIdControl.value?.id)
                    );
                    this.callerIdControl.updateValueAndValidity();
                }
                this.selectCallerId();
            },
            error: (error: any) => {
                this.fetchCallerIdInProgressEmit.emit(of(false));
                this.callerIdList$.next([]);
                this.callerIdEmit.emit([]);
                this.toast.error(error?.errors);
            },
        });
    }

    public selectCallerId(): void {
        if (this.setKeyInValue) {
            const callerIds: IFlowCallerIDModel[] = this.getValueFromObservable(this.callerIdList$);
            const selectedCallerId =
                callerIds?.find((callerId) => callerId?.[this.setKeyInValue] === this.callerIdControl.value) ?? null;
            this.selectedCallerIdData.emit(selectedCallerId);
        }
    }
}
