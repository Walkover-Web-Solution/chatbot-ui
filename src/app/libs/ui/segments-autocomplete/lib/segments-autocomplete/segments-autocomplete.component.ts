import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { FormControl, ValidatorFn } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { DEBOUNCE_TIME } from '@msg91/constant';
import { CustomValidators } from '@msg91/custom-validator';
import { IAllSegmentsResModel, IGetAllPhoneBookResModel } from '@msg91/models/segmento-models';
import { BaseFilterRequest, BaseResponse, IPaginatedResponse } from '@msg91/models/root-models';
import { ComposeService } from '@msg91/services/msg91/compose';
import { BaseComponent } from '@msg91/ui/base-component';
import { fromEvent, Observable, of } from 'rxjs';
import { debounceTime, take, takeUntil, tap } from 'rxjs/operators';
import { PrimeNgToastService } from '@msg91/ui/prime-ng-toast';
import { SegmentService } from '@msg91/services/msg91/segmento/segment';

@Component({
    selector: 'msg91-segments-autocomplete',
    templateUrl: './segments-autocomplete.component.html',
    styleUrls: ['./segments-autocomplete.component.scss'],
})
export class SegmentsAutocompleteComponent extends BaseComponent implements AfterViewInit, OnChanges {
    @Input() segmentForm: FormControl;
    @Input() selectedPhoneBook: IGetAllPhoneBookResModel;
    /** True, if Segmento list needs to be reloaded (required when new campaign are created) */
    @Input() reloadSegmento: boolean;
    @Input() readOnly: boolean;
    @Input() formFieldAppearance: string = 'fill';
    @Input() showRequired: boolean = false;
    @Input() hideCreateSegment: boolean = false;
    @Input() placeHolder: string = 'Segment';
    @Input() labelName: string = 'Segment';
    @Input() showApiCallLoader: boolean = false;
    /** Change Style Of Input */
    @Input() cssClass: string = 'w-100 default-form-field-fill';
    @Input() showAiSegment: boolean = true;
    @Input() showAiQuerySegment: boolean = false;
    @Input() showAllSegment: boolean = true;
    @Input() segmentId: number;
    @Input() showRefresh: boolean = false;

    @Output() segmentSelected: EventEmitter<boolean> = new EventEmitter();
    @Output() minimizeEvent: EventEmitter<boolean> = new EventEmitter();
    @Output() fullScreenMailCompose: EventEmitter<boolean> = new EventEmitter();
    @Output() fetchSegmentInProgressEmit: EventEmitter<Observable<boolean>> = new EventEmitter();
    @ViewChild('segmentInput') public segmentInput: ElementRef;
    public segments$: Observable<IAllSegmentsResModel[]> = of([]);
    public fetchPhonebookInProgress$: Observable<boolean> = of(false);
    // public showClose = false;
    public params: BaseFilterRequest = new BaseFilterRequest();
    public optionSelected = false;
    private elementExistsValidatorFunc: ValidatorFn;

    constructor(
        private composeService: ComposeService,
        private cdr: ChangeDetectorRef,
        private router: Router,
        private toast: PrimeNgToastService,
        private segmentService: SegmentService
    ) {
        super();
    }

    public segmentDisplayFunction(segment: IAllSegmentsResModel): string {
        return segment?.name;
    }

    ngAfterViewInit() {
        fromEvent(this.segmentInput.nativeElement, 'input')
            .pipe(
                // tap((event: any) => {
                //     if (event?.target?.value) {
                //         this.showClose = true;
                //     } else {
                //         this.showClose = false;
                //     }
                // }),
                debounceTime(DEBOUNCE_TIME),
                takeUntil(this.destroy$)
            )
            .subscribe((event: any) => {
                this.params.search = event?.target?.value;
                this.params.pageNo = 1;
                this.fetchSegment(this.params);
                if (this.optionSelected) {
                    this.segmentSelected.emit(false);
                    this.optionSelected = false;
                }
            });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes?.selectedPhoneBook && this.selectedPhoneBook?.id && !this.segmentForm?.value?.id) {
            this.clearSegment(false);
            this.segmentForm.markAsUntouched();
        }
        if (
            changes.reloadSegmento &&
            changes.reloadSegmento.previousValue !== changes.reloadSegmento.currentValue &&
            changes.reloadSegmento.currentValue
        ) {
            this.clearSegment();
        }
        if (changes.segmentForm?.currentValue?.value?.id) {
            this.optionSelected = true;
            // this.showClose = true;
        } else if (!changes.segmentForm?.currentValue) {
            // this.showClose = false;
        }
        if (this.showAiQuerySegment) {
            this.params = {
                ...this.params,
                is_ai_query: true,
            };
        }

        if (changes?.segmentId && this.segmentId) {
            this.segmentService.getSegmentDetails(+this.selectedPhoneBook?.id, this.segmentId).subscribe({
                next: (response) => {
                    this.segmentForm.setValue(response.data);
                },
                error: (errors: any) => {
                    this.segmentForm.setValue(null);
                },
            });
        }
    }

    public fetchNextSegmentPage(): void {
        this.segments$.pipe(take(1)).subscribe((res) => {
            if (res.length === this.params.itemsPerPage * this.params.pageNo) {
                this.params.pageNo += 1;
                this.fetchSegment(this.params, true);
            }
        });
    }

    public clearSegment(emitEvent: boolean = true): void {
        // this.showClose = false;
        this.segmentForm.setValue('');
        delete this.params.search;
        this.params.pageNo = 1;
        if (emitEvent) {
            this.segmentSelected.emit(false);
        }
        this.optionSelected = false;
        setTimeout(() => {
            this.fetchSegment(this.params);
        }, 0);
    }

    public fetchSegment(params: any, nextPage?: boolean): void {
        this.fetchSegmentInProgressEmit.emit(of(true));
        this.fetchPhonebookInProgress$ = of(true);
        this.composeService.getSegments(params, +this.selectedPhoneBook.id).subscribe(
            (response: BaseResponse<IPaginatedResponse<IAllSegmentsResModel[]>, BaseFilterRequest>) => {
                if (response.hasError) {
                    this.toast.error(response.errors as string);
                    this.fetchSegmentInProgressEmit.emit(of(false));
                    this.fetchPhonebookInProgress$ = of(false);
                    this.cdr.detectChanges();
                    return;
                }
                let segments;
                if (nextPage) {
                    this.segments$.pipe(take(1)).subscribe((seg) => {
                        seg.push(...response.data.data);
                        segments = seg;
                        this.segments$ = of(seg);
                    });
                } else {
                    this.segments$ = of(response.data.data);
                    segments = response.data.data;
                }
                if (this.elementExistsValidatorFunc) {
                    this.segmentForm.removeValidators(this.elementExistsValidatorFunc);
                }
                this.elementExistsValidatorFunc = CustomValidators.elementExistsInList(
                    segments.map((obj) => obj.id),
                    'id'
                );
                this.segmentForm.addValidators(this.elementExistsValidatorFunc);
                this.segmentForm.updateValueAndValidity();
                this.fetchSegmentInProgressEmit.emit(of(false));
                this.fetchPhonebookInProgress$ = of(false);
                this.cdr.detectChanges();
            },
            (errors: any) => {
                this.fetchSegmentInProgressEmit.emit(of(false));
                this.fetchPhonebookInProgress$ = of(false);
            }
        );
    }

    /**
     *  Navigate to segmento for create segment
     * @memberof SegmentsAutocompleteComponent
     */
    public navigateToCreateSegment(): void {
        this.router.navigate(
            [
                'm',
                'l',
                {
                    outlets: {
                        primary: ['segmento', 'book', this.selectedPhoneBook?.id, 'contacts'],
                        navigationRouter: ['segmento'],
                    },
                },
            ],
            {
                queryParams: {
                    phonebookChange: true,
                },
            }
        );
        this.minimizeEvent.emit(true);
        this.fullScreenMailCompose.emit(false);
    }

    /**
     * Segmento selction handler
     *
     * @param {MatAutocompleteSelectedEvent} event Selected Segmento
     * @memberof SegmentsAutocompleteComponent
     */
    public handleSegmentoSelection(event: MatAutocompleteSelectedEvent): void {
        const value = event.option.value;
        if (!value) {
            // this.showClose = false;
            this.navigateToCreateSegment();
        } else {
            this.segmentSelected.emit(true);
            this.optionSelected = true;
            // this.showClose = true;
        }
    }
}
