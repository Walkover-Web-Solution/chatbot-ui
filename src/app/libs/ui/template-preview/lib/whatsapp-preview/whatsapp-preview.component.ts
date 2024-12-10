import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ElementRef, inject } from '@angular/core';
import {
    IWhatsappTemplate,
    IWhatsappTemplateButtonFormat,
    IWhatsappTemplateHeaderFormat,
    IWhatsappTemplateMessageType,
} from '@msg91/models/whatsapp-models';
import { CONTENT_BETWEEEN_CURLY_BRACKETS_REGEX } from '@msg91/regex';
import { ISampleData } from '@msg91/models/whatsapp-models';

@Component({
    selector: 'msg91-whatsapp-preview',
    templateUrl: './whatsapp-preview.component.html',
    styleUrls: ['./whatsapp-preview.component.scss'],
})
export class WhatsappPreviewComponent implements OnChanges {
    /** Whatsapp template data */
    @Input() public whatsappTemplate: Array<IWhatsappTemplate> = [];
    /** Placeholder image for the template */
    @Input() public imagePlaceholder: string;
    /** Placeholder image for the template */
    @Input() public videoPlaceholder: string;
    /** Placeholder image for the template */
    @Input() public documentPlaceholder: string;
    /** Whatsapp variable regex for the template to replace the variable with values */
    @Input() public mappedVariableValues: { [key: string]: string };
    /** Provide either `mappedVariableValues` or `sampleData` */
    @Input() sampleData: ISampleData;
    /** Card and button theme changes */
    @Input() public cardThemeClass: string;
    /** Card background color */
    @Input() public cardBgColor: string = 'var(--color-whatsApp-primary-light) !important';
    /** Show or Hide All Buttons */
    @Input() public showAllButtons: boolean;
    /** True if preview width should be equal to parent container */
    @Input() public useContainerWidth: boolean = false;
    @Input() public showClickCounts: boolean = false;
    @Input() public countDetails: any;
    /** Show or Hide All Button changes emitter */
    @Output() showAllButtonsChange = new EventEmitter<boolean>();
    @Output() showButtonClickedDetails = new EventEmitter<any>();
    /** Template message types */
    public templateMessageType = IWhatsappTemplateMessageType;
    /** Template header types */
    public templateHeaderFormat = IWhatsappTemplateHeaderFormat;
    /** Template button types */
    public templateButtonFormat = IWhatsappTemplateButtonFormat;
    /** Whatsapp variable regex for the template to replace the variable with values */
    public whatsappVarRegex = new RegExp(CONTENT_BETWEEEN_CURLY_BRACKETS_REGEX, 'g');
    /** Formatted variable value for template preview, required
     * as every microservice has different symbol for template variable
     */
    public formattedMappedVariableValues: { [key: string]: any };

    @Input() addVariableClickHandler: boolean;
    @Input() templateDetail: { name: string; variables: string[] };
    @Output() mapVariableEvent = new EventEmitter<{
        position: { x: number; y: number };
        key: string;
    }>();

    public clickCountData = {};
    public elementRef = inject(ElementRef);

    /**
     * Formats the mapping variable as per the microservice symbol
     *
     * @param {SimpleChanges} changes Changes object
     * @memberof WhatsappPreviewComponent
     */
    public ngOnChanges(changes: SimpleChanges): void {
        if (this.addVariableClickHandler) {
            if (changes?.templateDetail?.currentValue || changes?.mappedVariableValues?.currentValue) {
                this.formattedMappedVariableValues = {};
                this.templateDetail?.variables?.forEach(
                    (variable) =>
                        (this.formattedMappedVariableValues[`{{${variable}}}`] = this.getVariableMappingHtml(variable))
                );
            }
        } else if (
            changes.mappedVariableValues &&
            changes.mappedVariableValues.currentValue !== changes.mappedVariableValues.previousValue &&
            this.mappedVariableValues
        ) {
            this.formattedMappedVariableValues = {};
            Object.keys(this.mappedVariableValues).forEach(
                (key) =>
                    (this.formattedMappedVariableValues[`{{${key}}}`] = this.mappedVariableValues[key]?.length
                        ? this.mappedVariableValues[key]
                        : `{{${key}}}`)
            );
        } else if (changes?.sampleData) {
            this.formattedMappedVariableValues = { headerVariableMapping: {}, bodyVariableMapping: {} };
            if (this.sampleData) {
                if (this.sampleData?.header) {
                    this.formattedMappedVariableValues.headerVariableMapping['{{1}}'] = this.sampleData?.header;
                }
                if (this.sampleData?.body) {
                    this.sampleData?.body?.forEach((value, index) => {
                        this.formattedMappedVariableValues.bodyVariableMapping[`{{${index + 1}}}`] = value;
                    });
                }
                if (this.sampleData?.carousel) {
                    const carouselMapping = [];
                    this.sampleData?.carousel?.cards?.forEach((card) => {
                        const cardMapping = { header: {}, body: {} };
                        if (this.sampleData?.carousel?.header) {
                            cardMapping.header['{{1}}'] = this.sampleData?.carousel?.header;
                        }
                        card?.body?.forEach((value, index) => {
                            cardMapping.body[`{{${index + 1}}}`] = value;
                        });
                        carouselMapping.push(cardMapping);
                    });
                    this.formattedMappedVariableValues.carouselVariableMapping = carouselMapping;
                }
            }
        }

        if (changes?.showClickCounts && this.showClickCounts) {
            for (let button of this.countDetails) {
                this.clickCountData[button.button] = button.total;
            }
        }
    }

    public clickListener(event): void {
        if (event?.target?.nodeName === 'A') {
            const key: string = event?.target?.id;
            if (key.indexOf(this.templateDetail.name) !== -1) {
                this.mapVariableEvent.emit({
                    position: { x: event?.clientX, y: event?.clientY },
                    key,
                });
            }
        }
    }

    private getVariableMappingHtml(variable: string): string {
        const mappingValue =
            this.mappedVariableValues?.[`${this.templateDetail.name}:${variable}`] ||
            this.mappedVariableValues?.[variable];
        return `{{${variable}:<a class="text-underline cursor-pointer link" id="${
            this.templateDetail.name
        }:${variable}">${mappingValue ?? 'Map'}</a>}}`;
    }

    public showButtonClickDetails(button): void {
        if (this.showClickCounts && this.clickCountData[button?.text]) {
            this.showButtonClickedDetails.emit(button);
        }
    }

    public scrollCarousel(scrollTo: 'left' | 'right'): void {
        const carouselWrapper: HTMLElement = this.elementRef?.nativeElement?.querySelector(`.carousel-wrapper`);
        const currentCardIndexIntoView = Math.round(carouselWrapper.scrollLeft / 230);
        const nextCardIndex = scrollTo === 'left' ? currentCardIndexIntoView - 1 : currentCardIndexIntoView + 1;
        const carouselElement = carouselWrapper?.querySelector(`#carousel-card-${nextCardIndex}`);
        if (carouselElement) {
            carouselElement?.scrollIntoView({ behavior: 'smooth' });
        } else {
            const currentCarouselElement = carouselWrapper?.querySelector(`#carousel-card-${currentCardIndexIntoView}`);
            currentCarouselElement?.scrollIntoView({ behavior: 'smooth' });
        }
    }
}
