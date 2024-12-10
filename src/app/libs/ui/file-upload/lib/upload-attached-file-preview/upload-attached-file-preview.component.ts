import { MatIconRegistry } from '@angular/material/icon';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'msg91-upload-attached-file-preview',
    templateUrl: './upload-attached-file-preview.component.html',
    styleUrls: ['./upload-attached-file-preview.component.scss'],
})
export class UploadAttachedFilePreviewComponent implements OnChanges {
    /** File upload preview details */
    @Input() public filePreviewDetails;
    /** Emits when the preview delete */
    @Output() public deleteFile: EventEmitter<any> = new EventEmitter();

    public fileIcon = new BehaviorSubject({
        name: 'insert_drive_file',
        isSvg: false,
    });

    constructor(
        private iconRegistry: MatIconRegistry,
        private sanitizer: DomSanitizer
    ) {
        this.iconRegistry.addSvgIcon(
            'csv',
            this.sanitizer.bypassSecurityTrustResourceUrl('assets/images/icons/csv-new.svg')
        );
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes?.filePreviewDetails?.currentValue) {
            const iconObj = {
                name: 'insert_drive_file',
                isSvg: false,
            };
            const fileType = this.filePreviewDetails.type;
            if (fileType.includes('csv')) {
                iconObj.name = 'csv';
                iconObj.isSvg = true;
            } else if (fileType.toLowerCase().startsWith('image')) {
                iconObj.name = 'image';
            } else if (fileType.toLowerCase().startsWith('audio')) {
                iconObj.name = 'audio_file';
            } else if (fileType.toLowerCase().startsWith('video')) {
                iconObj.name = 'video_file';
            }
            this.fileIcon.next(iconObj);
        }
    }
}
