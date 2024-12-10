import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {
    WhatsAppCatalogueType,
    WhatsAppHeaderType,
    WhatsAppInteractiveMessageType,
} from '@msg91/models/whatsapp-models';
import { BaseComponent } from '@msg91/ui/base-component';
import { isEqual } from 'lodash-es';
import { distinctUntilChanged, Observable, of, Subject, takeUntil } from 'rxjs';

import {
    InteractiveListMessageAction,
    InteractiveMessage,
    InteractiveMessageControls,
    InteractiveMessageFormGroup,
    InteractiveProductMessageAction,
    WHATSAPP_INTERACTIVE_VALIDATIONS,
} from './interactive-message-section.model';
import { InteractiveMessageSectionStore } from './interactive-message-section.store';

@Component({
    selector: 'msg91-interactive-message-section',
    templateUrl: './interactive-message-section.component.html',
    styleUrls: ['./interactive-message-section.component.scss'],
    providers: [InteractiveMessageSectionStore],
})
export class InteractiveMessageSectionComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy {
    @Input() catalogueType: string;
    @Input() formValue: any;
    @Input() integratedNumber: string;
    @Input() appearance = 'outline';
    @Input() isRequired = false;
    @Input() markAllAsTouched: Subject<void>;
    @Output() sectionData = new EventEmitter<any>();

    /** Catalogue Type Enum */
    public whatsAppCatalogueTypeEnum = WhatsAppCatalogueType;

    public selectedProductRetailerId = new Set<string>();
    public requiredValidator = this.isRequired ? [Validators.required] : [];

    /** Stores the formatted data of current interactive form for preview */
    public currFormatedData$: Observable<{
        formattedData: Array<Array<any>>;
        formattedSections: Array<Array<any>>;
    }> = of({
        formattedData: [[]],
        formattedSections: [[]],
    });

    /** Supported header types */
    public headerType = WhatsAppHeaderType;
    /** Currently selected header type */
    public selectedHeaderType = new FormControl(WhatsAppHeaderType.Text);
    /** Interactive message type */
    public messageType = WhatsAppInteractiveMessageType;
    // /** Selected interactive message type */
    public interactiveType: string = this.messageType.ProductList;
    /** All allowed file types for upload */
    public allowedFileType = `${WHATSAPP_INTERACTIVE_VALIDATIONS.MEDIA.IMAGE.TYPE}, ${WHATSAPP_INTERACTIVE_VALIDATIONS.MEDIA.VIDEO.TYPE}, ${WHATSAPP_INTERACTIVE_VALIDATIONS.MEDIA.DOCUMENT.TYPE}`;
    /** Stores the instance of uploaded file */
    public uploadedFile: File;
    /** Interactive message form instance */
    public createInteractiveMessageForm: FormGroup<InteractiveMessage>;

    /** Form array getters */
    public get buttonFormArray(): FormArray {
        return this.createInteractiveMessageForm?.get('action')?.get('buttons') as FormArray;
    }
    public get sectionFormArray(): FormArray {
        return this.createInteractiveMessageForm?.get('action')?.get('sections') as FormArray;
    }

    public catalogDetails$: Observable<any> = this.componentStore.catalogDetails$;

    public sectionRowFormArray(sectionIndex: number): FormArray {
        return (this.createInteractiveMessageForm?.get('action.sections') as FormArray)
            .at(sectionIndex)
            .get('rows') as FormArray;
    }
    public sectionProductFormArray(sectionIndex: number): FormArray {
        return (this.createInteractiveMessageForm?.get('action.sections') as FormArray)
            .at(sectionIndex)
            .get('product_items') as FormArray;
    }

    constructor(
        private formBuilder: FormBuilder,
        private componentStore: InteractiveMessageSectionStore
    ) {
        super();
        this.createInteractiveMessageForm = this.formBuilder.group({
            action: this.formBuilder.group({
                buttons: this.formBuilder.array([]),
            }),
        } as InteractiveMessageControls) as InteractiveMessageFormGroup;
    }

    public ngOnInit(): void {
        this.createInteractiveMessageForm.valueChanges
            .pipe(distinctUntilChanged(isEqual), takeUntil(this.destroy$))
            .subscribe((res) => {
                this.selectedProductRetailerId.clear();
                res?.action?.sections?.forEach((section) => {
                    section?.product_items?.forEach((item) => {
                        if (item?.product_retailer_id) {
                            this.selectedProductRetailerId.add(item?.product_retailer_id);
                        }
                    });
                });
                if (this.createInteractiveMessageForm.valid) {
                    this.sectionData.emit(this.createInteractiveMessageForm.getRawValue()?.action);
                } else {
                    this.sectionData.emit(null);
                }
            });
        this.catalogDetails$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            this.createInteractiveMessageForm?.get('action.catalog_id')?.setValue(res?.catalog_id);
        });

        this.markAllAsTouched?.pipe(takeUntil(this.destroy$))?.subscribe((data) => {
            this.createInteractiveMessageForm.markAllAsTouched();
        });
        if (this.formValue) {
            this.createInteractiveMessageForm?.get('action.catalog_id')?.setValue(this.formValue?.catalog_id);
            (this.createInteractiveMessageForm?.get('action.sections') as FormArray)?.clear();
            this.formValue?.sections?.forEach((section) =>
                this.addRemoveProductListSections(false, null, null, section)
            );
            this.createInteractiveMessageForm.patchValue({
                action: typeof this.formValue === 'string' ? { product_retailer_id: this.formValue } : this.formValue,
            });
        }
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes?.integratedNumber?.currentValue) {
            this.getCatalogDetails();
        }
        if (changes?.isRequired?.currentValue) {
            this.requiredValidator = this.isRequired ? [Validators.required] : [];
        }
        if (changes?.catalogueType?.currentValue) {
            this.selectedProductRetailerId.clear();
            if (this.catalogueType === WhatsAppCatalogueType.Catalogue) {
                this.createInteractiveMessageForm.setControl(
                    'action',
                    this.formBuilder.group({
                        catalog_id: this.formBuilder.control({
                            value: this.getValueFromObservable(this.catalogDetails$)?.catalog_id,
                            disabled: true,
                        }),
                        product_retailer_id: this.formBuilder.control('', this.requiredValidator),
                    }) as FormGroup<InteractiveProductMessageAction>
                );
            } else if (this.catalogueType === WhatsAppCatalogueType.Mpm) {
                this.createInteractiveMessageForm.setControl(
                    'action',
                    this.formBuilder.group({
                        catalog_id: this.formBuilder.control({
                            value: this.getValueFromObservable(this.catalogDetails$)?.catalog_id,
                            disabled: true,
                        }),
                        sections: this.formBuilder.array([]) as FormArray,
                    }) as FormGroup<InteractiveListMessageAction>
                );
                this.addRemoveProductListSections(false);
            }
        }
    }

    /**
     * Add/Remove button handler
     *
     * @param {number} [buttonIndex] Button index at which the operation needs to be performed
     * @param {{ type: string; reply: { title: string } }} [value] Value to patch on new field
     * @memberof CreateInteractiveMessageDialogComponent
     */
    public addRemoveButton(buttonIndex?: number, value?: { type: string; reply: { title: string } }): void {
        if (isNaN(buttonIndex)) {
            // Add a new button
            this.buttonFormArray.push(
                this.formBuilder.group({
                    type: this.formBuilder.control(value?.type ?? 'reply'),
                    reply: this.formBuilder.group({
                        id: this.formBuilder.control(Math.random() * Math.random() * 1000),
                        title: this.formBuilder.control(value?.reply?.title ?? '', [
                            Validators.maxLength(WHATSAPP_INTERACTIVE_VALIDATIONS.BUTTON_TYPE.BUTTON.TEXT_MAX_LENGTH),
                            Validators.required,
                        ]),
                    }),
                })
            );
        } else {
            // Remove button at buttonIndex
            this.buttonFormArray.removeAt(buttonIndex);
            if (!this.buttonFormArray.length) {
                this.addRemoveButton();
            }
        }
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    /**
     * Adds or removes section's rows
     *
     * @param {number} sectionIndex Section index at which the rows need to be removed
     * @param {number} [rowIndex] Index of the row to be removed
     * @param {boolean} [removeRow] True, if row needs to be removed
     * @memberof CreateInteractiveMessageDialogComponent
     */
    public addRemoveListSectionRows(sectionIndex: number, rowIndex?: number, removeRow?: boolean): void {
        const rowArray = this.sectionRowFormArray(sectionIndex);
        if (removeRow) {
            rowArray.removeAt(rowIndex);
        } else {
            rowArray.push(
                this.formBuilder.group({
                    title: this.formBuilder.control(''),
                    description: this.formBuilder.control(''),
                    id: this.formBuilder.control(Math.random() * Math.random()),
                })
            );
        }
    }

    /**
     * Add/remove sections in 'list' type interactive message
     *
     * @param {boolean} [resetSection] True, then resets the section form array, required when interactive type is changed
     * @param {boolean} [removeSection] True, if section needs to be removed at a particular index
     * @param {number} [sectionIndex] Index of the section to be removed
     * @memberof CreateInteractiveMessageDialogComponent
     */
    public addRemoveListSections(resetSection?: boolean, removeSection?: boolean, sectionIndex?: number): void {
        const action = this.createInteractiveMessageForm.get('action') as FormGroup;
        if (action) {
            if (removeSection) {
                if (!isNaN(sectionIndex)) {
                    // Index is received, remove the section at that index
                    (action.get('sections') as FormArray).removeAt(sectionIndex);
                } else {
                    // Index is not received which means the interactive type has been changed
                    action.removeControl('sections');
                    action.removeControl('button');
                }
            } else {
                if (resetSection) {
                    // Resets the section form array, required when interactive type is changed
                    const button = this.formBuilder.control('', Validators.required);
                    action.setControl('button', button);
                    const sectionArray = this.formBuilder.array([]) as FormArray;
                    action.setControl('sections', sectionArray);
                }
                const sectionRowsArray = this.formBuilder.array([]) as FormArray;
                sectionRowsArray.push(
                    this.formBuilder.group({
                        title: this.formBuilder.control(''),
                        description: this.formBuilder.control(''),
                    })
                );
                (action.get('sections') as FormArray).push(
                    this.formBuilder.group({
                        title: this.formBuilder.control(''),
                        rows: sectionRowsArray,
                    })
                );
            }
        }
    }

    /**
     * Add/remove sections in 'product_list' type interactive message
     *
     * @param {boolean} [resetSection] True, then resets the section form array, required when interactive type is changed
     * @param {boolean} [removeSection] True, if section needs to be removed at a particular index
     * @param {number} [sectionIndex] Index of the section to be removed
     * @memberof CreateInteractiveMessageDialogComponent
     */
    public addRemoveProductListSections(
        resetSection?: boolean,
        removeSection?: boolean,
        sectionIndex?: number,
        sectionValue?: any
    ): void {
        const action = this.createInteractiveMessageForm.get('action') as FormGroup;
        if (action) {
            if (removeSection) {
                if (!isNaN(sectionIndex)) {
                    // Index is received, remove the section at that index
                    (action.get('sections') as FormArray).removeAt(sectionIndex);
                } else {
                    // Index is not received which means the interactive type has been changed
                    action.removeControl('sections');
                    action.removeControl('catalog_id');
                }
            } else {
                if (resetSection) {
                    // Resets the section form array, required when interactive type is changed
                    const catalogId = this.formBuilder.control({
                        value: this.getValueFromObservable(this.catalogDetails$)?.catalog_id,
                        disabled: true,
                    });
                    action.setControl('catalog_id', catalogId);
                    const sectionArray = this.formBuilder.array([]) as FormArray;
                    action.setControl('sections', sectionArray);
                }
                const sectionProductItemsArray = this.formBuilder.array([]) as FormArray;
                for (let product of sectionValue?.product_items ?? [{}]) {
                    sectionProductItemsArray.push(
                        this.formBuilder.group({
                            product_retailer_id: this.formBuilder.control(
                                product?.product_retailer_id ?? '',
                                this.requiredValidator
                            ),
                        })
                    );
                }
                (action.get('sections') as FormArray).push(
                    this.formBuilder.group({
                        title: this.formBuilder.control(sectionValue?.title ?? '', this.requiredValidator),
                        product_items: sectionProductItemsArray,
                    })
                );
            }
        }
    }

    /**
     * Adds or removes product list section's items
     *
     * @param {number} sectionIndex Section index at which the rows need to be removed
     * @param {number} [rowIndex] Index of the row to be removed
     * @param {boolean} [removeRow] True, if row needs to be removed
     * @memberof CreateInteractiveMessageDialogComponent
     */
    public addRemoveProductListSectionItems(sectionIndex: number, rowIndex?: number, removeRow?: boolean): void {
        const productArray = this.sectionProductFormArray(sectionIndex);
        if (removeRow) {
            productArray.removeAt(rowIndex);
        } else {
            productArray.push(
                this.formBuilder.group({
                    product_retailer_id: this.formBuilder.control('', this.requiredValidator),
                })
            );
        }
    }

    /**
     * Button drag/drop handler
     *
     * @param {CdkDragDrop<string[]>} event DragDrop event
     * @memberof CreateInteractiveMessageDialogComponent
     */
    public dropButton(event: CdkDragDrop<string[]>): void {
        const currentFormControl = this.buttonFormArray.at(event.currentIndex);
        const previousFormControl = this.buttonFormArray.at(event.previousIndex);
        const currentValue = currentFormControl?.value;
        const previousValue = previousFormControl?.value;
        currentFormControl.setValue(previousValue);
        previousFormControl.setValue(currentValue);
    }

    /**
     * Section drag/drop handler
     *
     * @param {CdkDragDrop<string[]>} event DragDrop event
     * @memberof CreateInteractiveMessageDialogComponent
     */
    public dropSection(event: CdkDragDrop<string[]>): void {
        const currentFormControl = this.sectionFormArray.at(event.currentIndex);
        const previousFormControl = this.sectionFormArray.at(event.previousIndex);
        const currentValue = currentFormControl?.value;
        const previousValue = previousFormControl?.value;
        currentFormControl.setValue(previousValue);
        previousFormControl.setValue(currentValue);
    }

    /**
     * Section's rows drag/drop handler
     *
     * @param {CdkDragDrop<string[]>} event DragDrop event
     * @param {number} sectionIndex Section Index
     * @memberof CreateInteractiveMessageDialogComponent
     */
    public dropSectionRows(event: CdkDragDrop<string[]>, sectionIndex: number): void {
        const currentFormControl = this.sectionRowFormArray(sectionIndex).at(event.currentIndex);
        const previousFormControl = this.sectionRowFormArray(sectionIndex).at(event.previousIndex);
        const currentValue = currentFormControl?.value;
        const previousValue = previousFormControl?.value;
        currentFormControl.setValue(previousValue);
        previousFormControl.setValue(currentValue);
    }

    /**
     * Drop handler
     *
     * @param {CdkDragDrop<string[]>} event DragDrop event
     * @param {('button' | 'section' | 'row')} type Type of entity being dropped
     * @param {number} [sectionIndex] Current index of the section
     * @memberof CreateInteractiveMessageDialogComponent
     */
    public drop(event: CdkDragDrop<string[]>, type: 'section' | 'product', sectionIndex?: number): void {
        let formArray: FormArray;
        switch (type) {
            case 'section':
                formArray = this.sectionFormArray;
                break;
            case 'product':
                formArray = this.sectionProductFormArray(sectionIndex);
                break;
            default:
                break;
        }
        formArray.controls[event.previousIndex] = formArray.controls.splice(
            event.currentIndex,
            1,
            formArray.controls[event.previousIndex]
        )[0];
        formArray.updateValueAndValidity();
    }

    public getCatalogDetails(): void {
        this.componentStore.getCatalogDetails({
            integrated_number: this.integratedNumber,
        });
    }
}
