import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    NgZone,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { BaseComponent } from '@msg91/ui/base-component';
import { environment } from '../../../../../../../environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { checkFileExtension } from '@msg91/utils';
import { Store, select } from '@ngrx/store';
import { IAppState } from 'src/app/chat/store';
import { Observable, distinctUntilChanged, takeUntil } from 'rxjs';
import { selectChatInputSubmitted } from 'src/app/chat/store/selectors';
import { isEqual } from 'lodash-es';

@Component({
    selector: 'msg91-message-input',
    templateUrl: './message-input.component.html',
    styleUrls: ['./message-input.component.scss'],
    standalone: false
})
export class MessageInputComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy {
    @Input() fileUploadPercentage = 0;
    @Input() publishingInProcess = false;
    @Input() fileUploadInProcess = false;
    @Input() fileUploadSuccessful = false;
    @Input() fileUploadError = false;
    @Input() disable = false;
    @Input() channel: string;
    @Input() clientFormSubmitted: boolean;
    @Input() showSendButton: boolean;
    @Input() isMobileSDK: boolean;
    @Input() hideUpload: boolean;
    @ViewChild('textInput', { static: true }) public textInputElem: ElementRef<HTMLInputElement>;
    @ViewChild('textArea', { static: true }) public textAreaElem: ElementRef<HTMLInputElement>;
    @ViewChild('fileInput', { static: true }) public FileInputElem: ElementRef<HTMLInputElement>;
    @Output() public send = new EventEmitter<{ content: string; attachment: File }>();
    @Output() public inputFocused = new EventEmitter<boolean>();
    @Output() public inputBlurred = new EventEmitter<boolean>();
    @Output() public inputTyping = new EventEmitter<string>();
    public File: File = null;
    public previewUrl: string | ArrayBuffer;
    public messageContent: string = null;
    public appurl: string = environment.appUrl;
    public fileFormatNotSupported: boolean;
    public srcData: SafeResourceUrl;
    public fileType: string;
    public allowedMessageSize: number = 40000;
    public selectChatInputSubmitted$: Observable<boolean>;
    constructor(private sanitizer: DomSanitizer, private ngZone: NgZone, private store: Store<IAppState>) {
        super();

        this.selectChatInputSubmitted$ = this.store.pipe(
            select(selectChatInputSubmitted),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
    }

    ngOnInit() {
        setTimeout(() => {
            (this.isMobileSDK ? this.textInputElem : this.textAreaElem)?.nativeElement?.focus();
        }, 100);
        this.selectChatInputSubmitted$.subscribe((value: boolean) => {
            if (value) {
                (this.isMobileSDK ? this.textInputElem : this.textAreaElem)?.nativeElement?.focus();
            }
        });

        if (!this.isMobileSDK) {
            const inputTextArea = this.textAreaElem.nativeElement;
            inputTextArea.addEventListener('input', () => {
                // inputTextArea.style.height = '17px';
                inputTextArea.style.height = 'auto';
                inputTextArea.style.height =
                    inputTextArea.scrollHeight < 116
                        ? inputTextArea.scrollHeight - 16 > 30 // check add for doctype issue
                            ? inputTextArea.scrollHeight - 16 + 'px'
                            : 'auto'
                        : '100px';
            });
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!changes.fileUploadSuccessful?.previousValue && changes.fileUploadSuccessful?.currentValue) {
            this.messageContent = '';
            this.File = null;
            if (this.FileInputElem?.nativeElement) {
                this.FileInputElem.nativeElement.value = '';
            }
            (this.isMobileSDK ? this.textInputElem : this.textAreaElem)?.nativeElement?.focus();
        }
        if (changes?.disable?.currentValue === false) {
            setTimeout(() => {
                (this.isMobileSDK ? this.textInputElem : this.textAreaElem)?.nativeElement?.focus();
            }, 10);
        }
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    public checkEnterPress(event: KeyboardEvent) {
        this.ngZone.run(() => {
            if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey) {
                this.sendMessage();
            }
        });
    }

    public sendMessage(option?: any) {
        if (option) {
            this.messageContent = option;
        }
        if (this.messageContent?.trim().length > this.allowedMessageSize || this.fileUploadInProcess) {
            return;
        }
        if (this.messageContent?.trim().length || this.File !== null) {
            this.send.emit({
                content: this.messageContent?.trim().length ? this.messageContent?.trim() : '',
                attachment: this.File,
            });
            if (!this.isMobileSDK) {
                const inputTextArea = this.textAreaElem.nativeElement;
                // inputTextArea.style.height = '17px';
                inputTextArea.style.height = 'auto';
            }
            if (!this.File) {
                this.messageContent = '';
                this.File = null;
                this.modalChanges('');
                if (this.FileInputElem?.nativeElement) {
                    this.FileInputElem.nativeElement.value = '';
                }
                (this.isMobileSDK ? this.textInputElem : this.textAreaElem)?.nativeElement?.focus();
                if ((this.isMobileSDK ? this.textInputElem : this.textAreaElem)?.nativeElement) {
                    this.focused();
                }
            }
        }
    }

    selectFile(event: Event) {
        this.previewUrl = null;
        this.srcData = null;
        this.fileType = null;
        if (!checkFileExtension((event.target as any)?.files[0])) {
            this.fileFormatNotSupported = true;
            if (this.FileInputElem?.nativeElement) {
                this.FileInputElem.nativeElement.value = '';
            }
            setTimeout(() => {
                this.fileFormatNotSupported = false;
            }, 3000);
            return;
        }
        this.File = (event.target as any)?.files[0];
        if (this.File && this.File.type.includes('image')) {
            this.fileType = 'image';
            const reader = new FileReader();
            reader.readAsDataURL(this.File);
            reader.onload = (e) => {
                this.previewUrl = reader.result;
                this.srcData = this.sanitizer.bypassSecurityTrustResourceUrl(reader.result as string);
            };
        }
        if (this.File && this.File.type.includes('audio')) {
            this.fileType = 'audio';
        }
        if (this.File && this.File.type.includes('video')) {
            this.fileType = 'video';
        }

        if (this.FileInputElem?.nativeElement) {
            this.FileInputElem.nativeElement.value = '';
        }
    }

    cancelFile() {
        this.File = null;
        this.previewUrl = null;
        if (this.FileInputElem?.nativeElement) {
            this.FileInputElem.nativeElement.value = '';
        }
    }

    setDefaultPic() {
        this.srcData = this.appurl + 'assets/img/doc-preview.png';
    }

    @HostListener('dragover', ['$event'])
    _onDragOver(event: DragEvent) {
        console.log('DragOver ==>', event.dataTransfer.files);
    }

    @HostListener('dragleave')
    _onDragLeave(event: DragEvent) {
        console.log('dragleave ==>', event.dataTransfer.files);
    }

    @HostListener('drop', ['$event'])
    _onDrop(event: DragEvent) {
        console.log('drop', event.dataTransfer.files);
    }

    focused() {
        this.inputFocused.next(true);
    }

    modalChanges(event: string) {
        this.inputTyping.next(event);
    }

    blurred() {
        this.inputBlurred.next(true);
    }

    public preventEnterKey(event: KeyboardEvent): void {
        if (
            (this.isMobileSDK ? this.textInputElem : this.textAreaElem)?.nativeElement?.value.trim().length === 0 &&
            event.key === 'Enter' &&
            !event.shiftKey
        ) {
            event.preventDefault();
        } else if (event.key === 'Enter') {
            event.preventDefault();
        }
    }
}
