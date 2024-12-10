import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { ReplacePipe } from '@msg91/pipes/replace';
import { CONTENT_BETWEEEN_HASH_TAG_REGEX } from '@msg91/regex';

@Component({
    selector: 'msg91-email-preview',
    templateUrl: './email-preview.component.html',
    styleUrls: ['./email-preview.component.scss'],
})
export class EmailPreviewComponent implements OnChanges, OnDestroy {
    /** Template to be shown */
    @Input() public emailTemplate: string;
    /** Mapping of variable with values, to show on the preview */
    @Input() public mappedVariableValues: { [key: string]: string };
    /** Width for iframe */
    @Input() public width: string = '';
    /** Height for iframe */
    @Input() public height: string = '';
    /** Return formated content */
    @Output() public getFormattedEmailTemplate = new EventEmitter<string>();
    /** Email variable regex for the template to replace the variable with values */
    public emailVarRegex = new RegExp(CONTENT_BETWEEEN_HASH_TAG_REGEX, 'g');
    /** Formatted Email template, contains values in place of variables */
    public formattedEmailTemplate: string;
    /** Formatted variable value for template preview, required
     * as every microservice has different symbol for template variable
     */
    public formattedMappedVariableValues: { [key: string]: string };
    private iframeDocument;

    @Input() addVariableClickHandler: boolean;
    @Input() templateDetail: { slug: string; variables: string[] };
    @Output() mapVariableEvent = new EventEmitter<{ position: { x: number; y: number }; key: string }>();

    private iFrameRef;

    constructor(private replacePipe: ReplacePipe) {}

    /**
     * Formats the mapping variable as per the microservice symbol
     *
     * @param {SimpleChanges} changes Changes object
     * @memberof EmailPreviewComponent
     */
    public ngOnChanges(changes: SimpleChanges): void {
        if (
            (changes.mappedVariableValues &&
                changes.mappedVariableValues.currentValue !== changes.mappedVariableValues.previousValue) ||
            (changes.emailTemplate && changes.emailTemplate.currentValue !== changes.emailTemplate.previousValue)
        ) {
            if (this.addVariableClickHandler) {
                if (changes?.templateDetail?.currentValue || changes?.mappedVariableValues?.currentValue) {
                    this.formattedMappedVariableValues = {};
                    this.templateDetail?.variables?.forEach(
                        (variable) =>
                            (this.formattedMappedVariableValues[`##${variable}##`] =
                                this.getVariableMappingHtml(variable))
                    );
                }
            } else {
                this.formattedMappedVariableValues = {};
                Object.keys(this.mappedVariableValues ?? {}).forEach(
                    (key) =>
                        (this.formattedMappedVariableValues[`##${key}##`] = this.mappedVariableValues[key]?.length
                            ? this.mappedVariableValues[key]
                            : `##${key}##`)
                );
            }
            if (this.formattedMappedVariableValues) {
                this.formattedEmailTemplate = this.replacePipe.transform(
                    this.replacePipe.transform(this.emailTemplate, '\n', '<br />'),
                    this.formattedMappedVariableValues,
                    null
                );
            } else {
                this.formattedEmailTemplate = this.replacePipe.transform(this.emailTemplate, '\n', '<br />');
            }
            this.getFormattedEmailTemplate.emit(this.formattedEmailTemplate);
            if (this.iframeDocument) {
                this.loadDataInIframe(null, this.formattedEmailTemplate);
            }
        }
    }

    ngOnDestroy(): void {
        if (this.addVariableClickHandler) {
            this.iframeDocument.removeEventListener('click', this.clickListener.bind(this));
        }
    }

    /**
     * Iframe load handler, assigns the passed content to the iframe
     *
     * @param {*} iframe Iframe instance
     * @param {*} data Data to be displayed
     * @memberof EmailPreviewComponent
     */
    loadDataInIframe(iframe: any, data: any): void {
        if (iframe) {
            this.iframeDocument = iframe.contentDocument || iframe.contentWindow;
        }
        this.iframeDocument?.open();
        this.iframeDocument?.write(data);
        if (this.addVariableClickHandler) {
            this.iFrameRef = iframe ? iframe : this.iFrameRef;
            this.iframeDocument.removeEventListener('click', this.clickListener.bind(this));
            this.iframeDocument.addEventListener('click', this.clickListener.bind(this));
        }
    }

    public clickListener(event): void {
        if (event?.target?.nodeName === 'A') {
            const key: string = event?.target?.id;
            if (key.indexOf(this.templateDetail.slug) !== -1) {
                const coordinates = this.iFrameRef?.getBoundingClientRect();
                if (coordinates) {
                    this.mapVariableEvent.emit({
                        position: {
                            x: coordinates.x + event?.clientX,
                            y: coordinates.y + event?.clientY,
                        },
                        key,
                    });
                }
            }
        }
    }

    private getVariableMappingHtml(variable: string): string {
        const mappingValue =
            this.mappedVariableValues?.[`${this.templateDetail.slug}:${variable}`] ||
            this.mappedVariableValues?.[variable];
        return `{{${variable}:<a href="javascript:void(0)" style="color: blue" id="${
            this.templateDetail.slug
        }:${variable}">${mappingValue ?? 'Map'}</a>}}`;
    }
}
