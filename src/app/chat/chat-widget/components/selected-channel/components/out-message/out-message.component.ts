import { ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { BaseComponent } from '@msg91/ui/base-component';
import { IMessageModel } from '../../../../../model';
import { DOCUMENT } from '@angular/common';
import { ajax } from 'rxjs/ajax';
import { fileNotSupportAtUI } from '@msg91/utils';
import { environment } from '../../../../../../../environments/environment';

const IMAGE_PLACEHOLDER = `${environment.appUrl}assets/images/image-placeholder.png`;

@Component({
    selector: 'msg91-out-message',
    templateUrl: './out-message.component.html',
    styleUrls: ['./out-message.component.scss'],
    standalone: false
})
export class OutMessageComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input() messages: IMessageModel;
    public downloadInProgress = {};
    public supportedFiles = {};
    public text: string;

    constructor(@Inject(DOCUMENT) private document: Document, private cdr: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        if ((this.messages as any)?.is_deleted) {
            this.text = `<pre class="pre-text">This message was deleted.</pre>`;
        } else {
            if (this.messages.content?.attachment?.length) {
                for (let attachment of this.messages.content?.attachment) {
                    this.supportedFiles[attachment.name] = !fileNotSupportAtUI(attachment.path);
                }
            }
            this.text = `<pre class="pre-text">${this.messages.content.text.replace(/</g, '&lt;')}</pre>`;
        }
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    download(attachment_url: string | undefined, fileName: string) {
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

    onImageLoadError(imageTag: any): void {
        if (imageTag) {
            imageTag.src = IMAGE_PLACEHOLDER;
            imageTag.parentNode.className = 'media-not-found';
        }
    }
}
