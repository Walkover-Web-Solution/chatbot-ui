import { FormControl } from '@angular/forms';
import { BaseComponent } from '@msg91/ui/base-component';
import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    Output,
    ChangeDetectorRef,
    OnChanges,
    SimpleChanges,
    OnInit,
    ElementRef,
    ViewChild,
} from '@angular/core';
import { IWhatsAppClientTemplatesRespModel } from '@msg91/models/whatsapp-models';
import {
    Observable,
    of,
    BehaviorSubject,
    distinctUntilChanged,
    debounceTime,
    fromEvent,
    takeUntil,
    combineLatest,
} from 'rxjs';
import { FlowService } from '@msg91/service';
import { PrimeNgToastService } from '@msg91/ui/prime-ng-toast';
import { SubscriptionBasedServices } from '@msg91/constant';
import { OneInboxService } from '@msg91/services/msg91/hello';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { DEBOUNCE_TIME } from '@msg91/constant';
import { isEqual } from 'lodash-es';

@Component({
    selector: 'msg91-whatsapp-template-dropdown',
    templateUrl: './whatsapp-template-dropdown.component.html',
})
export class WhatsappTemplateDropDownComponent extends BaseComponent implements OnInit, OnChanges, AfterViewInit {
    @Input() templateForm: FormControl;
    @Input() appearance = 'outline';
    @Input() fetchTemplates: { integratedNumber: string; URL: string; fetchSyncData: boolean; oneInboxId?: string };
    @Input() allCompanyTemplates: boolean = false;
    @Input() selectWhatsappTemplateEvent: BehaviorSubject<string>;
    /** If true, will check for subscription before calling API */
    @Input() checkForSubscription: boolean;
    /** Emits the 'noSubscription' event eagerly, when there is no subscription */
    @Input() emitNoSubscriptionEagerly: boolean;
    @Input() showCreateTemplate: boolean;
    @Input() matFormFieldClass = 'w-100';
    @Input() fetchTemplatesByHelloAPI = false;

    @Output() clearTemplate: EventEmitter<any> = new EventEmitter();
    @Output() templateSelected: EventEmitter<any> = new EventEmitter();
    @Output() fetchTemplateInProgressEmit: EventEmitter<any> = new EventEmitter();
    @Output() templatesListEmit: EventEmitter<any> = new EventEmitter();
    @Output() getSelectedTemplate = new BehaviorSubject<any>(null);
    /** Emits to the parent when no active subscription is found */
    @Output() noSubscription: EventEmitter<number> = new EventEmitter();
    /** Emits the status of number integration, true when at least single number is integrated */
    @Output() isNumberIntegrated: EventEmitter<boolean> = new EventEmitter();
    @Output() createTemplateClicked = new EventEmitter<void>();
    @Output() clearSelectedTemplate = new EventEmitter<boolean>();

    @ViewChild('whatsAppTemplateInput') public whatsAppTemplateInput: ElementRef;
    @ViewChild(MatAutocompleteTrigger) autoComplete: MatAutocompleteTrigger;

    public templates$: Observable<IWhatsAppClientTemplatesRespModel[]> = of([]);
    public apiInProgress: boolean = false;
    public apiInProgress$ = of(false);
    /** True, if there are no current subscription */
    public showPurchasePlanText$ = of(false);
    public subscriptionBasedServices = SubscriptionBasedServices;
    public showClearTemplateIcon = false;
    public localFullTemplate: IWhatsAppClientTemplatesRespModel[] = [];
    public subscription: any;
    public templateFormSubscription: any;

    constructor(
        private flowService: FlowService,
        private cdr: ChangeDetectorRef,
        private toast: PrimeNgToastService,
        private oneInboxService: OneInboxService
    ) {
        super();
    }

    ngOnInit(): void {
        // this.selectWhatsappTemplateEvent
        //     ?.pipe(takeUntil(this.destroy$))
        //     ?.subscribe((res) => res && this.selectTemplate(res));
        if (this.selectWhatsappTemplateEvent) {
            combineLatest([this.selectWhatsappTemplateEvent, this.templates$])
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: ([selectedTemplate, templates]) => {
                        if (selectedTemplate && templates.length) {
                            this.selectTemplate(selectedTemplate);
                        }
                    },
                });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (
            changes?.allCompanyTemplates?.currentValue ||
            (changes?.fetchTemplates && this.fetchTemplates?.integratedNumber) ||
            changes?.fetchTemplatesByHelloAPI
        ) {
            this.fetchTemplateInProgressEmit.emit(of(true));
            this.apiInProgress$ = of(true);
            this.fetchTemplate();
        }
        if (changes?.templateForm?.currentValue?.value?.length) {
            this.showClearTemplateIcon = true;
        }
    }

    public ngAfterViewInit(): void {
        fromEvent(this.whatsAppTemplateInput.nativeElement, 'input')
            .pipe(distinctUntilChanged(isEqual), debounceTime(DEBOUNCE_TIME), takeUntil(this.destroy$))
            .subscribe((event) => {
                this.onKeyUp(event?.target?.value);
            });
    }

    public fetchTemplate(queryParam: any = null, clearTemplate = false): void {
        // if (this.apiInProgress) {
        //     return;
        // }
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        this.apiInProgress = true;
        this.subscription = (
            this.allCompanyTemplates
                ? queryParam?.name
                    ? this.searchTemplates(queryParam)
                    : this.flowService.getAllCompanyTemplates()
                : this.fetchTemplatesByHelloAPI
                  ? this.oneInboxService.getWhatsAppTemplateDetails(
                        this.fetchTemplates.integratedNumber,
                        this.fetchTemplates.oneInboxId,
                        {
                            ...queryParam,
                            page_num: 1,
                            page_size: 500,
                        }
                    )
                  : this.flowService.getTemplateDetails(this.fetchTemplates.URL, this.fetchTemplates.integratedNumber, {
                        ...queryParam,
                        page_num: 1,
                        page_size: 500,
                    })
        ).subscribe({
            next: (response) => {
                this.showPurchasePlanText$ = of(false);
                this.isNumberIntegrated.emit(true);
                this.localFullTemplate = this.filterDataByStatus(response.data);
                this.templates$ = this.handleTemplatesResponse(response.data);
                this.fetchTemplateInProgressEmit.emit(of(false));
                this.apiInProgress$ = of(false);
                this.templatesListEmit.emit(this.templates$);
                this.templateSelected.emit(false);
                this.selectTemplate(this.selectWhatsappTemplateEvent?.getValue());
                if (clearTemplate) {
                    this.clearTemplate.emit(true);
                    setTimeout(() => {
                        this.clearTemplate.emit(false);
                    }, 500);
                }
                this.apiInProgress = false;
                this.cdr.detectChanges();
            },
            error: (error: any) => {
                this.fetchTemplateInProgressEmit.emit(of(false));
                this.apiInProgress$ = of(false);
                this.localFullTemplate = [];
                this.templates$ = of([]);
                this.templatesListEmit.emit(this.templates$);
                this.toast.error(error?.errors);
                this.apiInProgress = false;
                if (this.checkForSubscription && error?.error?.sub_error_code === 400) {
                    if (this.emitNoSubscriptionEagerly) {
                        this.noSubscription.emit(this.subscriptionBasedServices.WhatsApp);
                    }
                    this.showPurchasePlanText$ = of(true);
                    this.isNumberIntegrated.emit(false);
                    this.templateForm.markAsTouched();
                }
            },
        });
        if (this.fetchTemplates?.fetchSyncData) {
            setTimeout(() => {
                this.flowService.fetchSyncData(this.fetchTemplates.integratedNumber).subscribe({
                    next: (response) => {
                        this.localFullTemplate = this.filterDataByStatus(response.data);
                        this.templates$ = this.handleTemplatesResponse(response.data);
                        this.templatesListEmit.emit(this.templates$);
                        this.cdr.detectChanges();
                    },
                    error: (error: any) => {
                        this.localFullTemplate = [];
                        this.templates$ = of([]);
                        this.templatesListEmit.emit(this.templates$);
                        this.toast.error(error?.errors);
                    },
                });
            });
        }
    }

    public selectTemplate(name?: string): void {
        if (name) {
            const templates: IWhatsAppClientTemplatesRespModel[] = this.getValueFromObservable(this.templates$);
            const selectedTemplate = templates?.find((template) => template.name === name) ?? null;
            this.templateForm.setValue(selectedTemplate ? name : null);
            this.getSelectedTemplate.next(selectedTemplate ?? null);
            this.showClearTemplateIcon = true;
        }
    }

    public handleTemplatesResponse(
        data: IWhatsAppClientTemplatesRespModel[]
    ): Observable<IWhatsAppClientTemplatesRespModel[]> {
        // return of(data.filter((res) => res.languages.some((lang) => lang.status?.toLowerCase() === 'approved')));
        return of(this.filterDataByStatus(data));
    }

    public filterDataByStatus(data: IWhatsAppClientTemplatesRespModel[], status: string = 'approved') {
        return data.filter((res) => res.languages.some((lang) => lang.status?.toLowerCase() === status));
    }

    public clearNumber() {
        this.selectWhatsappTemplateEvent?.next(null);
        this.getSelectedTemplate.next(null);
        this.whatsAppTemplateInput.nativeElement.value = '';
        this.templateForm.setValue(null);
        this.onKeyUp('', true);
    }

    public onEnter(value: string) {
        if (value) {
            this.showClearTemplateIcon = true;
            this.fetchTemplate({
                template_name: value,
            });
        } else {
            this.showClearTemplateIcon = false;
            this.fetchTemplate();
        }
    }

    public onKeyUp(value: string, clearTemplate = false) {
        if (value.length) {
            this.showClearTemplateIcon = true;
            // this.templates$ = of(this.localFullTemplate.filter((f) => f.name.includes(value)));
            // this.fetchTemplate({ name: value });
        } else {
            this.showClearTemplateIcon = false;
            // this.templates$ = of(this.localFullTemplate);
        }
        this.fetchTemplate({ name: value }, clearTemplate);
    }

    /**
     * Searches list of templates
     *
     * @private
     * @param {*} queryParam
     * @return {*}  {*}
     * @memberof WhatsappTemplateDropDownComponent
     */
    private searchTemplates(queryParam: any): any {
        let response = { data: null };
        response.data = this.localFullTemplate.filter((f) => f.name.includes(queryParam?.name));
        return of(response);
    }
}
