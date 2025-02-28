import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    ViewChildren,
} from '@angular/core';
import { BaseComponent } from '@msg91/ui/base-component';
import { select, Store } from '@ngrx/store';
import { IAppState } from '../../../../../store';
import { AbstractControl, FormControl, FormGroup, ValidationErrors  } from '@angular/forms';
import { IClient, IFormMessage, IParam, Message } from '../../../../../model';
import { Observable, of } from 'rxjs';
import { selectChatInputSubmitted, selectDefaultClientParams } from '../../../../../store/selectors';
import { distinctUntilChanged, take, takeUntil } from 'rxjs/operators';
import { isEqual } from 'lodash-es';
import { environment } from '../../../../../../../environments/environment';
import { PhoneNumber, PhoneNumberControl } from '@msg91/ui/phone-number-material';
import { IntlPhoneLib } from '@msg91/utils';
import { ALPHANUMERIC_WITH_SPACE_REGEX } from '@msg91/regex';

@Component({
    selector: 'msg91-client-input',
    templateUrl: './client-input.component.html',
    styleUrls: ['./client-input.component.scss'],
    standalone: false
})
export class ClientInputComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChildren('formControl') public controlElements: QueryList<ElementRef<HTMLInputElement> | PhoneNumberControl>;
    @Input() public message: Message = null;
    @Output() public updateClientData: EventEmitter<{ client: Partial<IClient>; channel: string }> = new EventEmitter<{
        client: Partial<IClient>;
        channel: string;
    }>();
    public clientForm: FormGroup = new FormGroup({});
    public defaultParams$: Observable<IParam[]>;
    public appurl: string = environment.appUrl;
    public formIsSubmiting = false;
    public defaultParams: IParam[];
    public intlClass: any;

    constructor(private store: Store<IAppState>, public el: ElementRef, public cdrf: ChangeDetectorRef) {
        super();
        this.defaultParams$ = this.store.pipe(
            select(selectDefaultClientParams),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
    }

    ngOnInit() {
        this.defaultParams$.pipe(take(1)).subscribe((res) => {
            if (res?.length) {
                res.forEach((x) => {
                    let phoneValue = null;
                    if (x.name?.toUpperCase() === 'NUMBER') {
                        this.initIntl(x);
                        phoneValue = ((this.message as IFormMessage)?.form[x.id].value as PhoneNumber).phonenumber;
                        this.clientForm.addControl(x.id, new FormControl(phoneValue));
                    } else {
                        this.clientForm.addControl(
                            x.id,
                            new FormControl(
                                (this.message as IFormMessage)?.form[x.id].value,
                                (this.message as IFormMessage)?.form[x.id].validators,
                                x.name?.toUpperCase() === 'NAME' ? this.validateName.bind(this) : null
                            )
                        );
                    }
                    if ((this.message as IFormMessage)?.form[x.id].value) {
                        this.clientForm.get(x.id).markAsDirty();
                        this.clientForm.get(x.id).markAsTouched();
                    }
                });
                this.clientForm.updateValueAndValidity();
                this.defaultParams = res;
            }
        });
    }

    ngAfterViewInit() {
        setTimeout(() => {
            (this.controlElements.toArray()[0] as ElementRef<HTMLInputElement>)?.nativeElement.focus();
        }, 10);
    }

    public initIntl(param: any) {
        const parentDom = document.querySelector('chat-widget').shadowRoot.querySelector('msg91-chat-view').shadowRoot;
        const customCssStyleURL = `${environment.baseUrl}${
            environment.env === 'prod' ? 'app' : 'hello-new'
        }/assets/utils/intl-tel-input-custom.css`;
        setTimeout(() => {
            const input = parentDom.getElementById('init-contact');
            if (input) {
                this.intlClass = new IntlPhoneLib(input, parentDom, customCssStyleURL, true, undefined, {
                    domain: `${environment.baseUrl}${environment.env !== 'prod' ? 'hello-new' : 'app'}`,
                });

                input.addEventListener('input', () => {
                    setTimeout(() => {
                        if (!this.intlClass.isValidNumber) {
                            this.clientForm.get(param.id).setErrors({ invalidNumber: !this.intlClass.isValidNumber });
                        } else {
                            this.clientForm.get(param.id).setErrors(null);
                        }
                    }, 100);
                });
            }
        }, 700);
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    validateName(control: AbstractControl): Observable<ValidationErrors | null> {
        const value = control?.value.trim();
        if (value.length === 0) {
            return of({ required: true });
        }
        if (value && !new RegExp(ALPHANUMERIC_WITH_SPACE_REGEX).test(value)) {
            return of({ alphabatOnly: true });
        }
        if (value.length > 30) {
            return of({ maxlength: true });
        } else {
            return of(null);
        }
    }

    // validatePhoneNo(control: AbstractControl): Observable<ValidationErrors | null> {
    //     if ((control?.value as PhoneNumber)?.phonenumber?.length) {
    //         return of((control?.value as PhoneNumber)?.phonenumber)
    //             .pipe(debounceTime(DEBOUNCE_TIME))
    //             .pipe(
    //                 switchMap((e) => {
    //                     return this.service.validatePhoneNo((control?.value as PhoneNumber)?.phonenumber).pipe(
    //                         map((res: IPhoneValidation) => {
    //                             // if res is true, username exists, return true
    //                             if (res?.success && res.data.is_valid) {
    //                                 return null;
    //                             } else {
    //                                 return { invalidNumber: true };
    //                             }
    //                             // NB: Return null if there is no error
    //                         }),
    //                         catchError((err) => {
    //                             if (err instanceof HttpErrorResponse) {
    //                                 if (err.status === 400 || err.status === 500) {
    //                                     return of({ invalidNumber: true });
    //                                 }
    //                             }
    //                         })
    //                     );
    //                 })
    //             );
    //     }
    //     return of(null);
    // }

    blockKeys(event: KeyboardEvent | ClipboardEvent, allowPlus: boolean = false): boolean | void {
        let text;
        if (event instanceof KeyboardEvent) {
            text = event.key;
        } else if (event instanceof ClipboardEvent) {
            text = event.clipboardData?.getData('text');
        }
        if (allowPlus && !text?.match(/^[0-9+]*$/)) {
            event.stopImmediatePropagation();
            event.stopPropagation();
            return false;
        } else if (!allowPlus && !text?.match(/^[0-9]*$/)) {
            event.stopImmediatePropagation();
            event.stopPropagation();
            return false;
        }
    }

    submitParam(params: IParam[]) {
        if (!this.clientForm.invalid && this.intlClass.isValidNumber) {
            this.formIsSubmiting = true;
            const result: Partial<IClient> = {};
            const formValue = this.clientForm.getRawValue();
            Object.keys(formValue).forEach((x) => {
                if (params.find((m) => m.id === x)?.name?.toUpperCase() === 'NUMBER') {
                    // const phoneValue: PhoneNumber = formValue[x];
                    // result[x] = phoneValue?.phonenumber;
                    result[x] = this.intlClass.phoneNumber;
                } else {
                    result[x] = formValue[x];
                }
            });
            this.updateClientData.next({
                client: result,
                channel: (this.message as IFormMessage)?.channel,
            });
            this.intlClass?.clearChangeFlagZIndexInterval();
            this.store
                .pipe(select(selectChatInputSubmitted), distinctUntilChanged(isEqual), take(1))
                .subscribe((chatInputSubmitted) => {
                    if (chatInputSubmitted) {
                        this.formIsSubmiting = false;
                    }
                });
        } else {
            for (const control in this.clientForm.controls) {
                this.clientForm.get(control).markAsDirty();
                this.clientForm.get(control).markAsTouched();
            }
            this.clientForm.updateValueAndValidity();
        }
    }
}
