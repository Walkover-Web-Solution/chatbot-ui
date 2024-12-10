import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    SimpleChanges,
    ViewChild,
    Optional,
} from '@angular/core';
import { FormControl, ValidatorFn } from '@angular/forms';
import { PrimeNgToastService } from '@msg91/ui/prime-ng-toast';
import { fromEvent, of } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';
import { BaseComponent } from '@msg91/ui/base-component';
import { ProxyBaseUrls } from '@msg91/models/root-models';
import { SharedService } from '@msg91/services/shared';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { DEBOUNCE_TIME } from '@msg91/constant';
import { CustomValidators } from '@msg91/custom-validator';
import { ICurrentAccount } from '@msg91/models/setting-models';
import { Observable } from 'rxjs';
import { SubscriptionBasedServices } from '@msg91/constant';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
    selector: 'msg91-email-domain-autocomplete',
    templateUrl: './email-domain-autocomplete.component.html',
    styleUrls: ['./email-domain-autocomplete.component.scss'],
})
export class EmailDomainAutocompleteComponent extends BaseComponent implements AfterViewInit, OnChanges, OnDestroy {
    @Input() emailDomainFormControl: FormControl;
    @Input() createDomainURL: string;
    @Input() fromCampaign: boolean = false;
    @Input() fetchAll: boolean = false;
    @Input() hideRefresh: boolean = false;
    @Input() clearFilter: boolean;
    @Input() formFieldAppearance: string = 'outline';
    @Input() domainAPIParams: any = {};
    @Input() emitAddDomainEvent: boolean = false;
    @Input() initialValueSet: boolean = false;
    @Input() refreshList: boolean = false;
    @Input() matFormFieldClass = 'w-100';
    @Input() fetchSamePageList: boolean = false;
    @Input() fromAdminPanel: boolean = false;
    @Input() adminAuthToken: any;
    @Input() selectedUser: number | string;
    /** If true, will check for subscription before calling API */
    @Input() checkForSubscription: boolean;
    /** Current account details to fetch subscription details */
    @Input() selectCurrentAccount$: Observable<ICurrentAccount>;
    /** Emits the 'noSubscription' event eagerly, when there is no subscription */
    @Input() emitNoSubscriptionEagerly: boolean;
    /** True, if user has subscribed successfully */
    @Input() public userSubscriptionComplete: boolean;
    @Input() public operationAllowed: boolean = true;

    @Output() fetchDomainListInprogress: EventEmitter<any> = new EventEmitter();
    @Output() getSelectedDomain: EventEmitter<any> = new EventEmitter();
    @Output() returnDomainList: EventEmitter<any> = new EventEmitter();
    @Output() optionSelected: EventEmitter<any> = new EventEmitter();
    @Output() clearDomainEvent: EventEmitter<void> = new EventEmitter();
    @Output() openAddDomainDialog: EventEmitter<void> = new EventEmitter();
    /** Emits to the parent when no active subscription is found */
    @Output() noSubscription: EventEmitter<number> = new EventEmitter();

    @ViewChild('emailDomainInput') public emailDomainInput: ElementRef;
    @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;

    public domains: { id: number; name: string; domain: string }[] = [];
    public domainInitialValue: string;
    public fetchDataWithoutKeyword: boolean = false;
    public showCloseDomain: boolean = false;
    public existInListValidatorFn: ValidatorFn;
    public apiInProgress$ = of(false);
    /** True, if there are no current subscription */
    public showPurchasePlanText$ = of(false);
    public subscriptionBasedServices = SubscriptionBasedServices;

    private emailDomainParams = {
        page: 1,
        last_page: 1,
        keyword: '',
    };

    constructor(
        private sharedService: SharedService,
        private cdr: ChangeDetectorRef,
        private toast: PrimeNgToastService,
        @Inject(ProxyBaseUrls.EmailProxy) private emailUrl: any,
        @Optional() @Inject(ProxyBaseUrls.SubscriptionURLProxy) private subscriptionUrl: any
    ) {
        super();
    }

    public ngAfterViewInit(): void {
        fromEvent(this.emailDomainInput.nativeElement, 'input')
            .pipe(
                tap((event: any) => {
                    if (event?.target?.value) {
                        this.showCloseDomain = true;
                    } else {
                        this.showCloseDomain = false;
                    }
                }),
                debounceTime(DEBOUNCE_TIME),
                takeUntil(this.destroy$)
            )
            .subscribe((event: any) => {
                this.emailDomainParams.keyword = event?.target?.value;
                this.emailDomainParams.page = 1;
                this.fetchEmailDomains(this.emailDomainParams.keyword);
            });
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes?.clearFilter) {
            this.clearDomain();
        }
        if (changes?.refreshList?.currentValue) {
            if (typeof this.emailDomainFormControl.value === 'string') {
                this.emailDomainFormControl.setValue(null);
                this.showCloseDomain = false;
            }
            this.emailDomainParams.keyword = '';
            this.emailDomainParams.page = 1;
            this.fetchEmailDomains();
        }
        if (changes?.emailDomainFormControl || changes?.initialValueSet?.currentValue) {
            this.domainInitialValue = this.emailDomainFormControl.value?.domain;
            this.showCloseDomain = this.domainInitialValue ? true : false;
            if (this.checkForSubscription) {
                this.fetchEmailSubscriptions();
            } else {
                this.fetchEmailDomains(this.domainInitialValue);
            }
        } else if (changes?.selectedUser) {
            this.emailDomainFormControl?.reset();
            this.emailDomainParams.page = 1;
            this.domainInitialValue = null;
            this.showCloseDomain = false;
            this.fetchEmailDomains(this.domainInitialValue);
        }
        if (changes?.fetchSamePageList?.currentValue) {
            this.emailDomainParams.page = 1;
            this.domainInitialValue = this.emailDomainFormControl.value?.domain;
            this.fetchEmailDomains(this.emailDomainFormControl.value?.domain);
        }
        if (
            changes?.userSubscriptionComplete?.currentValue &&
            changes.userSubscriptionComplete?.currentValue !== changes.userSubscriptionComplete?.previousValue
        ) {
            this.showPurchasePlanText$ = of(false);
            this.cdr.detectChanges();
        }
    }

    /**
     * Fetches next Domain page
     *
     * @memberof CampaignEmailFormComponent
     */
    public fetchNextDomainPage(): void {
        if (this.emailDomainParams.page < this.emailDomainParams.last_page) {
            this.emailDomainParams = {
                ...this.emailDomainParams,
                page: this.emailDomainParams.page + 1,
            };
            this.fetchEmailDomains(this.emailDomainParams?.keyword ?? null, true);
        }
    }

    /**
     * Select Domain
     */
    public selectDomain(): void {
        if (this.emailDomainFormControl.value?.domain) {
            this.showCloseDomain = true;
        }
        const selectedDomain = this.domains.find((e) => e.domain === this.emailDomainFormControl.value?.domain);
        this.getSelectedDomain.emit(selectedDomain);
    }

    public domainDisplayFunction(domain: { id: string; domain: string }): string {
        return domain?.domain;
    }

    public refreshDomain(): void {
        this.domains = [];
        this.emailDomainParams = {
            page: 1,
            last_page: 1,
            keyword: null,
        };
        this.fetchEmailDomains(this.emailDomainParams.keyword);
    }

    public clearDomain(): void {
        this.domains = [];
        this.showCloseDomain = false;
        this.emailDomainFormControl.patchValue('');
        this.emailDomainParams.keyword = '';
        this.emailDomainParams.page = 1;
        this.fetchEmailDomains(this.emailDomainParams.keyword);
        this.clearDomainEvent.emit();
    }

    /**
     * Set emailDomainFormControl value
     *
     * @param {*} value
     * @memberof EmailDomainAutocompleteComponent
     */
    public setDomainControlValue(value: any) {
        this.emailDomainFormControl.setValue(value);
        this.emailDomainFormControl.markAsDirty();
        this.showCloseDomain = true;
        this.optionSelected.emit(value);
    }

    /**
     * Fetches email Domains
     *
     * @private
     * @memberof CampaignEmailFormComponent
     */
    private fetchEmailDomains(keyword?: string, nextPage?: boolean): void {
        this.fetchDomainListInprogress.emit(true);
        this.apiInProgress$ = of(true);
        const payload = {
            url: `${this.emailUrl}/domains`,
            params: {
                page: this.emailDomainParams.page,
                keyword: keyword ? keyword : '',
                is_enabled: 1,
                status_id: 2,
                ...this.domainAPIParams,
            },
        };
        if (this.fetchAll) {
            delete payload.params.status_id;
            delete payload.params.is_enabled;
        }
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
        this.sharedService.getEmailDomain(payload).subscribe(
            (res) => {
                this.showPurchasePlanText$ = of(false);
                this.formatDomainResponse(res, keyword, nextPage);
            },
            (error: any) => {
                this.fetchDomainListInprogress.emit(false);
                this.apiInProgress$ = of(false);
                this.toast.error(
                    error?.errors?.[0] || error?.errors?.permission?.[0] || error?.message || 'Something went wrong.'
                );
                this.cdr.detectChanges();
            }
        );
    }

    private formatDomainResponse(res, keyword: string, nextPage?: boolean): void {
        const data = res.data.data;
        if (keyword !== null) {
            // Either data is searched or pre-filled from API response
            if (nextPage) {
                // Load more case
                this.domains.push(...data);
            } else {
                // Either data is searched or pre-filled from API response
                this.domains = data;
            }
            if (keyword && keyword === this.domainInitialValue) {
                if (data.length === 0 && !this.fetchDataWithoutKeyword) {
                    this.fetchDataWithoutKeyword = true;
                    this.fetchEmailDomains();
                }
                this.emailDomainFormControl.setValue(data.find((domain) => domain.domain === this.domainInitialValue));
            }
            if (keyword && this.emailDomainFormControl.value?.domain) {
                this.fetchEmailDomains();
            }
            this.optionSelected.emit();
        } else {
            if (nextPage) {
                // Load more case
                this.domains.push(...data);
            } else {
                // Either data is searched or pre-filled from API response
                this.domains = data;
            }
        }
        this.emailDomainParams.last_page = res.data.last_page;
        if (this.existInListValidatorFn) {
            this.emailDomainFormControl.removeValidators(this.existInListValidatorFn);
        }
        const domainArray = this.domains.map((obj) => obj.domain);
        if (
            this.emailDomainFormControl.value?.domain &&
            !domainArray?.includes(this.emailDomainFormControl.value?.domain)
        ) {
            domainArray?.push(this.emailDomainFormControl.value?.domain);
        }
        this.existInListValidatorFn = CustomValidators.elementExistsInList(domainArray, 'domain');
        this.emailDomainFormControl.addValidators(this.existInListValidatorFn);
        this.fetchDomainListInprogress.emit(false);
        this.apiInProgress$ = of(false);
        this.selectDomain();
        this.returnDomainList.emit(this.domains);
        this.cdr.detectChanges();
    }

    /**
     * Fetches Email subscription
     *
     * @private
     * @memberof EmailDomainAutocompleteComponent
     */
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
                    this.emailDomainFormControl.setErrors({
                        ...(this.emailDomainFormControl.errors ?? {}),
                        invalid: true,
                    });
                    this.emailDomainFormControl.markAsTouched();
                    if (this.emitNoSubscriptionEagerly) {
                        this.noSubscription.emit(this.subscriptionBasedServices.Email);
                    }
                } else {
                    this.showPurchasePlanText$ = of(false);
                    this.emailDomainFormControl.updateValueAndValidity();
                    this.fetchEmailDomains(this.domainInitialValue);
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
