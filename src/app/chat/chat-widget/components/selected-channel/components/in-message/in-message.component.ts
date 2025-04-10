import { ChangeDetectorRef, Component, Inject, Input, Output, OnDestroy, OnInit, EventEmitter } from '@angular/core';
import { BaseComponent } from '@msg91/ui/base-component';
import { AgentResponse, IMessageModel } from '../../../../../model';
import { DOCUMENT } from '@angular/common';
import { ajax } from 'rxjs/ajax';
import { fileNotSupportAtUI } from '@msg91/utils';
import { environment } from '../../../../../../../environments/environment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LinkifyPipe } from '@msg91/pipes/LinkifyPipe';
import { WhatsappInlineStyleFormat } from '@msg91/pipes/whatsapp-inline-style-format';

const IMAGE_PLACEHOLDER = `${environment.appUrl}assets/images/image-placeholder.png`;

@Component({
    selector: 'msg91-in-message',
    templateUrl: './in-message.component.html',
    styleUrls: ['./in-message.component.scss'],
    standalone: false
})
export class InMessageComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input() fromName: string;
    @Input() messages: IMessageModel;
    @Input() agentDetails: AgentResponse[];
    @Input() isMobileSDK: boolean;
    @Input() widgetInfo: any;
    @Output() emitDownloadContent: EventEmitter<any> = new EventEmitter<any>();
    @Output() botOptionSelected: EventEmitter<any> = new EventEmitter<any>();
    public downloadInProgress = {};
    public supportedFiles = {};
    public assignee: AgentResponse;
    public linkExpire: boolean = false;
    public currentTime: number;
    private timerInterval: any;
    public rawHtml: SafeHtml;

    constructor(@Inject(DOCUMENT) private document: Document, private cdr: ChangeDetectorRef, private sanitizer: DomSanitizer, private linkifyPipe: LinkifyPipe, private WhatsappInlineStyleFormat: WhatsappInlineStyleFormat ) {
        super();
    }
    ngOnInit() {
        if (this.messages.content?.attachment?.length) {
            for (let attachment of this.messages.content?.attachment) {
                this.supportedFiles[attachment.name] = !fileNotSupportAtUI(attachment.path);
            }
        }
        if (this.messages.sender_id !== 'bot') {
            this.assignee = this.agentDetails.find((e) => e.id === this.messages.sender_id);
        }
        
        let content = this.messages.content;
        let message_type = this.messages.message_type;
        if (message_type !== 'video_call') {
            content.text = this.linkifyPipe.transform(content.text);
        }
        content.text = this.WhatsappInlineStyleFormat.transform(content.text)      
        this.rawHtml = this.sanitizer.bypassSecurityTrustHtml(content.text)
        if (content?.expiration_time) {
            const currentTimeToken = new Date().getTime();
            this.currentTime = currentTimeToken;
            this.linkExpire = content.expiration_time ? content.expiration_time < currentTimeToken : false;
            if (!this.linkExpire) {
                setTimeout(() => {
                    this.linkExpire = true;
                    clearInterval(this.timerInterval);
                    this.cdr.detectChanges();
                }, content.expiration_time - currentTimeToken);
                let expireAfter = (+content.expiration_time - this.currentTime) / 1000;
                let expireAfterMins = Math.floor(expireAfter / 60);
                if (expireAfterMins > 0) {
                    this.timerInterval = setInterval(() => {
                        this.currentTime = new Date().getTime();
                        expireAfter = (+content.expiration_time - this.currentTime) / 1000;
                        expireAfterMins = Math.floor(expireAfter / 60);
                        if (expireAfterMins <= 0) {
                            this.linkExpire = true;
                        }
                        this.cdr.detectChanges();
                    }, 60000);
                } else {
                    this.linkExpire = true;
                }
            }
        }
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    public download(attachment_url: string | undefined, fileName: string): void {
        if (this.isMobileSDK) {
            const downloadContent = {
                content: this.messages?.content,
                attachment_url,
                downloadAttachment: true,
            };
            this.emitDownloadContent.emit(downloadContent);
        } else {
            this.downloadInProgress[attachment_url] = true;
            const api = ajax({
                url: attachment_url,
                method: 'GET',
                responseType: 'blob',
            });

            api.subscribe({
                next: (res: any) => {
                    const urlCreator = window.URL || window.webkitURL;
                    const imageUrl = urlCreator.createObjectURL(res.response);
                    const tag = document.createElement('a');
                    tag.href = imageUrl;
                    tag.download = fileName ? fileName : 'hello-media';
                    document.body.appendChild(tag);
                    tag.click();
                    document.body.removeChild(tag);
                    this.downloadInProgress[attachment_url] = false;
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    this.downloadInProgress[attachment_url] = false;
                    this.cdr.detectChanges();
                },
            });
        }
    }

    onImageLoadError(imageTag: any): void {
        if (imageTag) {
            imageTag.src = IMAGE_PLACEHOLDER;
            imageTag.parentNode.className = 'media-not-found';
        }
    }
}
