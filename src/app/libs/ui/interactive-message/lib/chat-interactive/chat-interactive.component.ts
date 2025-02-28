import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { InteractiveMessage } from './chat-interactive.model';
import { IWhatsappTemplateHeaderFormat } from '@msg91/models/whatsapp-models';
import { downloadFile } from '@msg91/utils';

@Component({
    selector: 'msg91-chat-interactive',
    templateUrl: './chat-interactive.component.html',
    styleUrls: ['./chat-interactive.component.scss'],
    standalone: false
})
export class ChatInteractiveComponent implements OnInit {
    @Input() public message: { interactive: InteractiveMessage };
    @Input() public disableAction: boolean;

    @Output() optionSelected: EventEmitter<{ name: string; value: any }> = new EventEmitter();

    public formattedMessage;
    public templateHeaderFormat = IWhatsappTemplateHeaderFormat;

    ngOnInit(): void {
        this.formatMessage();
    }

    public formatMessage(): void {
        this.formattedMessage = cloneDeep(this.message);
        if (
            this.formattedMessage?.interactive?.type === 'list' &&
            this.formattedMessage.interactive.action?.sections?.length
        ) {
            this.formattedMessage.interactive.action?.sections.forEach((section) => {
                if (section.rows?.length) {
                    section.rows = section.rows.map((row) => ({ name: row.title, value: row.id }));
                }
            });
        } else if (
            this.formattedMessage?.interactive?.type === 'button' &&
            this.formattedMessage.interactive.action?.buttons?.length
        ) {
            this.formattedMessage.interactive.action.buttons = this.formattedMessage.interactive.action?.buttons.map(
                (button) => ({
                    name: button.reply?.title,
                    value: button.reply?.id,
                })
            );
        }
    }

    /**
     * Downloads the attachment
     *
     * @param {string} url
     * @memberof ChatInteractiveComponent
     */
    public downloadAttachment(url: string): void {
        downloadFile(url);
    }
}
