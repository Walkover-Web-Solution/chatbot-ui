import {
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
import { FormControl } from '@angular/forms';
import { HighlightTag } from 'angular-text-input-highlight';
import { MentionConfig } from '@msg91/ui/angular-mentions';
import { MatFormFieldAppearance } from '@angular/material/form-field';

@Component({
    selector: 'msg91-textarea',
    templateUrl: './textarea.component.html',
    styleUrls: ['./textarea.component.scss'],
})
export class TextareaComponent implements OnChanges {
    @ViewChild('textarea') textarea: ElementRef;
    @Input() public rows = '4';
    @Input() public label = 'Textarea';
    @Input() public placeholder = '';
    @Input() public hint = '';
    @Input() public formFieldAppearance: MatFormFieldAppearance = 'outline';
    @Input() public textareaFormControl: FormControl<string>;
    @Input() public variableTriggerChar: string = '#';
    @Input() public showSuggestions: boolean = false;
    @Input() public showRequiredAsterisk = false;
    @Input() showLabel: boolean = true;

    // Provide either higlightRegex or fixedHighlightList
    @Input() public higlightRegex: string;
    @Input() public fixedHighlightList: string[] = null;
    @Input() public checkValue = false;
    @Output() public checkValueChange = new EventEmitter<boolean>();
    public tags: HighlightTag[] = [];

    @Input() public mentionConfigData: MentionConfig = { mentions: [] };
    // Item selected
    @Output() public itemSelected = new EventEmitter<any>();
    // Input Event
    @Output() public inputEvent = new EventEmitter<any>();
    // add class for css
    @Input() public pbClass: string = '';
    @Input() public textareaClass: string = '';
    @Input() public highlightClass: string = '';

    constructor(private _cdr: ChangeDetectorRef) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes?.fixedHighlightList?.currentValue?.length) {
            this.higlightRegex =
                '(?:\\B)*' + this.variableTriggerChar + `(${this.fixedHighlightList.join('|')})` + '(?:\\b)*';
            if (this.showSuggestions) {
                this.mentionConfigData = {
                    mentions: [
                        {
                            items: this.fixedHighlightList,
                            triggerChar: this.variableTriggerChar,
                            allowSpace: false,
                        },
                    ],
                };
            }
        }
        if (changes.mentionConfigData?.currentValue) {
            if (!this.fixedHighlightList) {
                this.higlightRegex = '(?:\\B)*';
                this.mentionConfigData?.mentions?.forEach((mention, index) => {
                    let list: string[] = [];
                    if (mention?.labelKey) {
                        mention?.items?.forEach((item) => {
                            if (item?.[mention?.labelKey || '']) {
                                list.push(item[mention?.labelKey || '']);
                            }
                        });
                    } else {
                        list = mention?.items ?? [];
                    }
                    if (list) {
                        this.higlightRegex += `${index > 0 ? '|' : ''}\\${mention.triggerChar}(${list?.join('|')})${
                            mention?.endChar ? '\\' + mention?.endChar : ''
                        }`;
                    }
                });
                this.higlightRegex += '(?:\\b)*';
            }
        }
        if (changes?.checkValue?.currentValue) {
            this.onValueChange();
            this.checkValueChange.emit(false);
        }
    }

    onValueChange() {
        if (this.higlightRegex) {
            this.tags = [];
            const vars = new RegExp(this.higlightRegex, 'gm');
            let match;
            while ((match = vars.exec(this.textareaFormControl?.value ?? ''))) {
                this.tags.push({
                    indices: {
                        start: match.index,
                        end: match.index + match[0].length,
                    },
                    cssClass: 'highlight-text',
                });
            }
            this._cdr.detectChanges();
        }
    }
}
