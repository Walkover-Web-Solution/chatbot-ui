import {
    CUSTOM_ELEMENTS_SCHEMA,
    Component,
    EventEmitter,
    Input,
    NgModule,
    OnChanges,
    Output,
    SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'msg91-emoji-picker',
    template: ` <div class="position-relative">
        <button
            mat-icon-button
            color="primary"
            class="icon-btn-md"
            (click)="setEmojiPickerPosition()"
            [id]="emojiPickerId"
            [matTooltip]="emojiBtnTooltip"
            *ngIf="!matFlatButton"
        >
            <mat-icon class="material-icons-outlined" [ngClass]="emojiDrawerIconClass">add_reaction</mat-icon>
        </button>
        <button
            mat-button
            (click)="setEmojiPickerPosition()"
            [id]="emojiPickerId"
            [matTooltip]="emojiBtnTooltip"
            *ngIf="matFlatButton"
        >
            <mat-icon class="material-icons-outlined" [ngClass]="emojiDrawerIconClass">add_reaction</mat-icon>
        </button>
        <div
            *ngIf="preloadEmojiPicker || showEmojiPicker"
            [hidden]="!showEmojiPicker"
            class="position-absolute"
            [id]="'div-' + emojiPickerId"
            style="display: none"
        >
            <emoji-mart
                class="emoji-mart"
                [set]="emojiSet"
                [showPreview]="showPreview"
                [isNative]="isNative"
                [title]="title"
                [totalFrequentLines]="totalFrequentLines"
                [perLine]="perLine"
                [emojiSize]="emojiSize"
                [darkMode]="darkMode"
                [color]="navBarColor"
                (emojiSelect)="emojiSelect.emit($event?.emoji?.native); showEmojiPicker = false; hideEmojiPicker()"
            ></emoji-mart>
        </div>
    </div>`,
})
export class EmojiPickerComponent implements OnChanges {
    @Input() public emojiSet: 'native' | 'google' | 'twitter' | 'facebook' | 'emojione' | 'apple' | 'messenger' =
        'apple';
    @Input() public showPreview: boolean = false;
    @Input() public isNative: boolean = false;
    @Input() public title: string = 'Pick your emoji…';
    @Input() public totalFrequentLines: number = 1;
    @Input() public perLine: number = 8;
    @Input() public emojiSize: number = 24;
    @Input() public darkMode: boolean = false;
    @Input() public navBarColor: string = '#1e75ba';
    @Input() public emojiDrawerIconClass: string = 'mat-icon-16';
    @Input() public closeEmojiPicker: boolean = false;
    @Input() public offsetBottom: number = 0;
    @Input() public offsetRight: number = 0;
    @Input() public emojiBtnTooltip: string = 'Reaction';
    @Input() public matFlatButton: boolean = false;
    @Input() public preloadEmojiPicker = false;
    @Output() public emojiSelect: EventEmitter<any> = new EventEmitter();

    public showEmojiPicker: boolean = false;
    public emojiPickerId = String(new Date().getMilliseconds());

    public ngOnChanges(changes: SimpleChanges): void {
        if (
            changes?.closeEmojiPicker?.currentValue !== changes?.closeEmojiPicker?.previousValue &&
            this.closeEmojiPicker
        ) {
            this.showEmojiPicker = false;
            this.hideEmojiPicker();
        }
    }

    public setEmojiPickerPosition(): void {
        this.showEmojiPicker = !this.showEmojiPicker;
        if (this.showEmojiPicker) {
            setTimeout(() => {
                const element = document?.getElementById(this.emojiPickerId)?.getBoundingClientRect();
                let heightOfEmojiDiv = 400;
                let widthOfEmojiDiv = 400;
                let elementYPosition = window.innerHeight - element?.bottom;
                let elementXPosition = window.innerWidth - element?.right;
                let commonStyles = 'z-index: 99999; display: block;';
                if (elementYPosition - heightOfEmojiDiv - this.offsetBottom > 0) {
                    commonStyles = `${commonStyles}top: 30px;`;
                } else {
                    commonStyles = `${commonStyles}bottom: 30px;`;
                }
                if (elementXPosition - widthOfEmojiDiv - this.offsetRight > 0) {
                    commonStyles = `${commonStyles}left: -30px;`;
                } else {
                    commonStyles = `${commonStyles}right: -30px;`;
                }
                if (document.getElementById('div-' + this.emojiPickerId)) {
                    document.getElementById('div-' + this.emojiPickerId).style.cssText = commonStyles;
                }
            }, 10);
        } else {
            this.hideEmojiPicker();
        }
    }

    public hideEmojiPicker(): void {
        if (document.getElementById('div-' + this.emojiPickerId)) {
            document.getElementById('div-' + this.emojiPickerId).style.cssText = 'display: none';
        }
    }
}

@NgModule({
    imports: [CommonModule, PickerModule, MatIconModule, MatButtonModule, MatTooltipModule],
    declarations: [EmojiPickerComponent],
    exports: [EmojiPickerComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UiEmojiPickerModule {}
