import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CONTENT_BETWEEEN_HASH_TAG_REGEX } from '@msg91/regex';

@Component({
    selector: 'msg91-sms-preview',
    templateUrl: './sms-preview.component.html',
    styleUrls: ['./sms-preview.component.scss'],
})
export class SmsPreviewComponent implements OnChanges {
    /** Sender ID of the SMS template */
    @Input() senderId: string | number;
    /** SMS template to be previewed */
    @Input() smsTemplate: string;
    /** Mapping of variable with values, to show on the preview */
    @Input() public mappedVariableValues: { [key: string]: string };

    @Input() public previewWidthClass: string = '';

    @Input() public maxHeight: string = '300px';

    @Input() addVariableClickHandler: boolean;
    @Input() templateDetail: { template_id: string; variables: string[] };
    @Output() mapVariableEvent = new EventEmitter<{ position: { x: number; y: number }; key: string }>();

    /** SMS variable regex for the template to replace the variable with values */
    public smsVarRegex = new RegExp(CONTENT_BETWEEEN_HASH_TAG_REGEX, 'g');
    /** Formatted variable value for template preview, required
     * as every microservice has different symbol for template variable
     */
    public formattedMappedVariableValues: { [key: string]: string };

    /**
     * Formats the mapping variable as per the microservice symbol
     *
     * @param {SimpleChanges} changes Changes object
     * @memberof SmsPreviewComponent
     */
    public ngOnChanges(changes: SimpleChanges): void {
        if (this.addVariableClickHandler) {
            if (changes?.templateDetail?.currentValue || changes?.mappedVariableValues?.currentValue) {
                this.formattedMappedVariableValues = {};
                this.templateDetail?.variables?.forEach(
                    (variable) =>
                        (this.formattedMappedVariableValues[`##${variable}##`] = this.getVariableMappingHtml(variable))
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
                    (this.formattedMappedVariableValues[`##${key}##`] = this.mappedVariableValues[key]?.length
                        ? this.mappedVariableValues[key]
                        : `##${key}##`)
            );
        }
    }

    public clickListener(event): void {
        if (event?.target?.nodeName === 'A') {
            const key: string = event?.target?.id;
            if (key.indexOf(this.templateDetail.template_id) !== -1) {
                this.mapVariableEvent.emit({ position: { x: event?.clientX, y: event?.clientY }, key });
            }
        }
    }

    private getVariableMappingHtml(variable: string): string {
        const mappingValue =
            this.mappedVariableValues?.[`${this.templateDetail.template_id}:${variable}`] ||
            this.mappedVariableValues?.[variable];
        return `{{${variable}:<a class="text-underline cursor-pointer link" id="${
            this.templateDetail.template_id
        }:${variable}">${mappingValue ?? 'Map'}</a>}}`;
    }
}
