import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BaseComponent } from '@msg91/ui/base-component';
import { getAcceptedTypeRegex, isFileAllowed } from '@msg91/utils';
import { PrimeNgToastService } from '@msg91/ui/prime-ng-toast';
import { WhatsAppService } from '@msg91/services/msg91/whatsapp';
import { errorResolver } from '@msg91/models/root-models';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'msg91-whatsapp-media-upload-input',
    templateUrl: './whatsapp-media-upload-input.component.html',
    styleUrls: ['./whatsapp-media-upload-input.component.scss'],
})
export class WhatsappMediaUploadInputComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input() whatsappNumber: string;
    @Input() buttonText: string = 'Upload file';
    @Input() acceptedTypes: string = '';
    @Input() maxUploadSizeInMb: number = 20;
    @Input() isRequired: boolean;
    @Input() isUploaded: boolean;

    @Output() uploadResponse = new EventEmitter<{ apiResponse: { url: string }; fileName: string }>();

    public file: File;
    public uploadInProgress = new BehaviorSubject<boolean>(false);
    public uploadSuccess = new BehaviorSubject<boolean>(null);

    constructor(
        private service: WhatsAppService,
        private toast: PrimeNgToastService
    ) {
        super();
    }

    ngOnInit(): void {}

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public addFile(files: FileList): void {
        const file = files?.[0];

        if (this.acceptedTypes) {
            const fileRegex = getAcceptedTypeRegex(this.acceptedTypes);
            if (!isFileAllowed(file, fileRegex)) {
                this.toast.error('Selected file is not supported');
                return;
            }
        }
        if (file.size > this.maxUploadSizeInMb * 1024 * 1024) {
            this.toast.error('Maximum upload size is ' + this.maxUploadSizeInMb + ' MB');
            return;
        }
        this.file = file;
        if (this.whatsappNumber) {
            this.uploadFile();
        } else {
            console.error('Whatsapp number not found');
        }
    }

    private uploadFile(): void {
        const formData = new FormData();
        formData.append('whatsapp_number', this.whatsappNumber);
        formData.append('media', new Blob([this.file], { type: this.file.type }), this.file.name);
        this.uploadInProgress.next(true);
        this.uploadSuccess.next(null);
        this.isUploaded = false;
        this.service.uploadWhatsappTemplateMedia(formData).subscribe({
            next: (response) => {
                this.uploadInProgress.next(false);
                if (response.hasError) {
                    this.toast.error(errorResolver(response?.errors)[0]);
                    this.file = null;
                    this.uploadResponse.emit(null);
                } else {
                    this.uploadSuccess.next(true);
                    this.uploadResponse.emit({ apiResponse: response.data, fileName: this.file.name });
                }
            },
            error: (err) => {
                this.uploadInProgress.next(false);
                this.uploadSuccess.next(false);
                this.toast.error(errorResolver(err?.errors)[0]);
                this.file = null;
                this.uploadResponse.emit(null);
            },
        });
    }
}
