import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
    Optional,
    OnDestroy,
} from '@angular/core';
import { FormControl, ValidatorFn } from '@angular/forms';
import { PrimeNgToastService } from '@msg91/ui/prime-ng-toast';
import { BehaviorSubject, fromEvent, Subject, of } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';
import { BaseComponent } from '@msg91/ui/base-component';
import { ProxyBaseUrls } from '@msg91/models/root-models';
import { SharedService } from '@msg91/services/shared';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { CustomValidators } from '@msg91/custom-validator';
import { ICurrentAccount } from '@msg91/models/setting-models';
import { Observable } from 'rxjs';
import { SubscriptionBasedServices } from '@msg91/constant';

@Component({
    selector: 'msg91-email-template-autocomplete',
    templateUrl: './email-template-autocomplete.component.html',
    styleUrls: ['./email-template-autocomplete.component.scss'],
})
export class EmailTemplateAutocompleteComponent
    extends BaseComponent
    implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
    @Input() emailTemplateFormControl: FormControl;
    @Input() createTemplateURL: string;
    @Input() fromAdminPanel: boolean = false;
    @Input() fromCampaign: boolean = false;
    @Input() adminAuthToken: any;
    @Input() clearFilter: boolean;
    @Input() fetchVerifiedTemplate: boolean = false;
    @Input() selectEmailTemplateEvent: BehaviorSubject<string>;
    @Input() reloadAutoCompleteForm: Subject<void>;
    @Input() selectBySlug: boolean = false;
    @Input() selectedUser: number;
    @Input() checkTemplateWithNoVariable: boolean = false;
    @Input() disableAutoSelectDirective: boolean = false;
    @Input() formFieldAppearance: string = 'outline';
    @Input() fetchTemplateByStatus: string = '2'; // For Approved Templates
    /** If true, will check for subscription before calling API */
    @Input() checkForSubscription: boolean;
    /** Current account details to fetch subscription details */
    @Input() selectCurrentAccount$: Observable<ICurrentAccount>;
    /** Emits the 'noSubscription' event eagerly, when there is no subscription */
    @Input() emitNoSubscriptionEagerly: boolean;
    @Input() matFormFieldClass = 'w-100 position-relative';
    /** True, if user has subscribed successfully */
    @Input() public userSubscriptionComplete: boolean;

    @Output() fetchTemplateListInprogress: EventEmitter<any> = new EventEmitter();
    @Output() getSelectedTemplate: EventEmitter<any> = new EventEmitter();
    @Output() returnTemplateList: EventEmitter<any> = new EventEmitter();
    /** Emits to the parent when no active subscription is found */
    @Output() noSubscription: EventEmitter<number> = new EventEmitter();

    @ViewChild('emailTemplateInput') public emailTemplateInput: ElementRef;
    @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
    public templates: { template_id: number; name: string; variables: string[]; slug: string; active_version: any }[] =
        [];
    public selectedTemplateVariable: string[];
    public showCloseTemplate: boolean = false;
    public existInListValidatorFn: ValidatorFn;
    /** True, if there are no current subscription */
    public showPurchasePlanText$ = of(false);
    public subscriptionBasedServices = SubscriptionBasedServices;

    private emailTemplateParams = {
        page: 1,
        last_page: 1,
        keyword: '',
    };
    public apiInProgress$ = of(false);

    constructor(
        private sharedService: SharedService,
        private cdr: ChangeDetectorRef,
        private toast: PrimeNgToastService,
        @Inject(ProxyBaseUrls.EmailProxy) private emailUrl: any,
        @Optional() @Inject(ProxyBaseUrls.SubscriptionURLProxy) private subscriptionUrl: any
    ) {
        super();
    }
    ngAfterViewInit() {
        fromEvent(this.emailTemplateInput.nativeElement, 'input')
            .pipe(
                tap((event: any) => {
                    if (event?.target?.value) {
                        this.showCloseTemplate = true;
                    } else {
                        this.showCloseTemplate = false;
                    }
                }),
                debounceTime(700),
                takeUntil(this.destroy$)
            )
            .subscribe((event: any) => {
                this.emailTemplateParams.keyword = event?.target?.value;
                this.emailTemplateParams.page = 1;
                this.selectEmailTemplateEvent?.next(null);
                this.fetchEmailTemplates(this.emailTemplateParams.keyword);
            });
    }

    ngOnInit(): void {
        this.selectEmailTemplateEvent
            ?.pipe(takeUntil(this.destroy$))
            ?.subscribe((res) => res && this.fetchEmailTemplates(res));
        if (!this.selectEmailTemplateEvent?.getValue()) {
            if (this.checkForSubscription) {
                this.fetchEmailSubscriptions();
            } else {
                this.fetchEmailTemplates(this.emailTemplateFormControl.value?.slug);
            }
        }
        this.reloadAutoCompleteForm?.pipe(takeUntil(this.destroy$))?.subscribe(() => {
            this.fetchEmailTemplates(this.emailTemplateFormControl.value?.slug);
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes) {
            if (this.clearFilter) {
                this.clearTemplate();
            }
        }
        if (changes?.selectedUser && this.fromAdminPanel) {
            this.fetchEmailTemplates(this.emailTemplateFormControl.value?.slug);
        }
        if (
            changes?.userSubscriptionComplete?.currentValue &&
            changes.userSubscriptionComplete?.currentValue !== changes.userSubscriptionComplete?.previousValue
        ) {
            this.showPurchasePlanText$ = of(false);
            this.cdr.detectChanges();
        }
    }

    ngOnDestroy(): void {
        if (this.existInListValidatorFn) {
            this.emailTemplateFormControl.removeValidators(this.existInListValidatorFn);
        }
        super.ngOnDestroy();
    }

    /**
     * Fetches next template page
     *
     * @memberof CampaignEmailFormComponent
     */
    public fetchNextTemplatePage(): void {
        if (this.emailTemplateParams.page < this.emailTemplateParams.last_page) {
            this.emailTemplateParams = {
                ...this.emailTemplateParams,
                page: this.emailTemplateParams.page + 1,
            };
            this.fetchEmailTemplates(this.emailTemplateParams?.keyword ?? null, true);
        }
    }

    /**
     * Select Template
     */
    public selectTemplate(template_id?: string): void {
        if (template_id ?? this.emailTemplateFormControl.value?.template_id) {
            this.showCloseTemplate = true;
        }
        const selectedTemplate = this.templates.find((e) =>
            this.selectBySlug
                ? e.slug === (template_id ?? this.emailTemplateFormControl.value?.slug)
                : e.template_id === (template_id ?? this.emailTemplateFormControl.value?.template_id)
        );
        if (selectedTemplate) {
            this.emailTemplateFormControl.setValue(selectedTemplate);
            this.emailTemplateFormControl.updateValueAndValidity();
            this.getSelectedTemplate.emit(selectedTemplate);
        }
        if (this.checkTemplateWithNoVariable && selectedTemplate?.template_id && !selectedTemplate?.variables?.length) {
            this.emailTemplateFormControl.setErrors({
                ...this.emailTemplateFormControl.errors,
                noVariableFound: 'Template should contain atleast one variable',
            });
        }
    }

    public templateDisplayFunction(template: {
        template_id: string;
        name: string;
        variables: string[];
        slug: string;
        templateName: string;
    }): string {
        return template?.templateName ?? template?.slug;
    }

    public refreshTemplate(): void {
        this.templates = [];
        this.emailTemplateParams = {
            page: 1,
            last_page: 1,
            keyword: this.emailTemplateFormControl.value?.slug,
        };
        this.fetchEmailTemplates(this.emailTemplateFormControl.value?.slug);
    }

    public clearTemplate(): void {
        this.templates = [];
        this.showCloseTemplate = false;
        this.emailTemplateFormControl.patchValue('');
        this.emailTemplateParams.keyword = '';
        this.emailTemplateParams.page = 1;
        this.selectEmailTemplateEvent?.next(null);
        this.emailTemplateFormControl.updateValueAndValidity();
        this.fetchEmailTemplates(this.emailTemplateParams.keyword);
        this.getSelectedTemplate.emit(null);
    }

    /**
     * Fetches email templates
     *
     * @private
     * @memberof CampaignEmailFormComponent
     */
    private fetchEmailTemplates(keyword?: string, nextPage?: boolean, searchIn: string = 'slug'): void {
        this.fetchTemplateListInprogress.emit(true);
        this.apiInProgress$ = of(true);
        this.emailTemplateParams.keyword = keyword ?? this.selectEmailTemplateEvent?.getValue() ?? '';
        const payload = {
            url: `${this.emailUrl}/templates`,
            params: {
                page: this.emailTemplateParams.page,
                keyword: this.emailTemplateParams.keyword,
                search_in: searchIn,
                with: 'activeVersion',
                status_id: this.fetchTemplateByStatus,
            },
        };
        if (this.fromAdminPanel) {
            const options = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': this.adminAuthToken ?? '',
                },
                withCredentials: false,
            };
            payload['options'] = options;
            if (this.selectedUser) {
                payload.params['panel_user_id'] = this.selectedUser;
            }
        }
        this.sharedService.getEmailTemplate(payload).subscribe(
            (res) => {
                this.showPurchasePlanText$ = of(false);
                this.formatTemplateResponse(res, nextPage);
            },
            (error: any) => {
                this.fetchTemplateListInprogress.emit(false);
                this.apiInProgress$ = of(false);
                this.toast.error(
                    error?.errors?.[0] || error?.errors?.permission?.[0] || error?.message || 'Something went wrong.'
                );
                this.cdr.detectChanges();
            }
        );
    }

    private formatTemplateResponse(res, nextPage?: boolean): void {
        let data = res.data.data;
        if (this.fetchVerifiedTemplate) {
            data = data.filter((e) => e.active_version.status_id === 2);
        }
        const formattedResponse = data.map((template) => {
            return {
                template_id: template.id,
                slug: template.slug,
                name: template.active_version.name,
                variables: template.active_version.variables,
                active_version: template.active_version,
                ...(template?.name && {
                    templateName: template.name,
                }),
            };
        });
        if (nextPage) {
            // Load more case
            this.templates.push(...formattedResponse);
        } else {
            // Either data is searched or pre-filled from API response
            this.templates = formattedResponse;
        }
        if (this.existInListValidatorFn) {
            this.emailTemplateFormControl.removeValidators(this.existInListValidatorFn);
        }
        this.existInListValidatorFn = CustomValidators.elementExistsInList(
            this.templates.map((obj) => obj.slug),
            'slug'
        );
        this.emailTemplateFormControl.addValidators(this.existInListValidatorFn);
        this.emailTemplateParams.last_page = res.data.last_page;
        this.fetchTemplateListInprogress.emit(false);
        this.apiInProgress$ = of(false);
        this.returnTemplateList.emit(this.templates);
        this.selectTemplate(this.selectEmailTemplateEvent?.getValue());
        this.cdr.detectChanges();
    }

    private fetchEmailSubscriptions(): void {
        this.apiInProgress$ = of(true);
        const payload = {
            url: `${this.subscriptionUrl}/companyPlans?panel_user_id=${
                this.getValueFromObservable(this.selectCurrentAccount$)?.id
            }&ms_id=${this.subscriptionBasedServices.Email}`,
        };
        this.sharedService.getSubscriptionDetails(payload).subscribe(
            (res) => {
                // if (!res?.data?.filter((datum) => datum.is_active === 1)?.length) {
                if (!res?.data?.length) {
                    this.showPurchasePlanText$ = of(true);
                    this.emailTemplateFormControl.setErrors({
                        ...(this.emailTemplateFormControl.errors ?? {}),
                        invalid: true,
                    });
                    this.emailTemplateFormControl.markAsTouched();
                    if (this.emitNoSubscriptionEagerly) {
                        this.noSubscription.emit(this.subscriptionBasedServices.Email);
                    }
                } else {
                    this.showPurchasePlanText$ = of(false);
                    this.emailTemplateFormControl.updateValueAndValidity();
                    this.fetchEmailTemplates(this.emailTemplateFormControl.value?.slug);
                }
                this.apiInProgress$ = of(false);
                this.cdr.detectChanges();
            },
            (error) => {
                this.apiInProgress$ = of(false);
                this.cdr.detectChanges();
            }
        );
    }
}
