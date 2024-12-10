import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { WhatsAppInteractiveHeaderType, WhatsAppInteractiveMessageType } from '@msg91/models/whatsapp-models';

export interface InteractiveMessageHeader {
    type: FormControl<WhatsAppInteractiveHeaderType>;
    text?: FormControl<string>;
    document?: FormGroup<{
        link?: FormControl<string>;
        filename?: FormControl<string>;
    }>;
    video?: FormGroup<{
        link?: FormControl<string>;
    }>;
    image?: FormGroup<{
        link?: FormControl<string>;
    }>;
}
export interface InteractiveMessageBody {
    text: FormControl<string>;
}
export interface InteractiveMessageFooter {
    text: FormControl<string>;
}
export interface InteractiveButton {
    type: FormControl<string>;
    reply: FormGroup<{
        title: FormControl<string>;
        id: FormControl<string>;
    }>;
}
export interface InteractiveListSectionRows {
    title: FormControl<string>;
    description?: FormControl<string>;
    id: FormControl<string>;
}
export interface InteractiveListSectionRows {
    product_retailer_id: FormControl<string>;
}
export interface InteractiveSection {
    title: FormControl<string>;
}
export interface InteractiveListSection extends InteractiveSection {
    rows: FormArray<FormGroup<InteractiveListSectionRows>>;
}
export interface InteractiveProductSection extends InteractiveSection {
    product_items: FormArray<FormGroup<InteractiveListSectionRows>>;
}
export interface InteractiveButtonMessageAction {
    button?: FormControl<string>;
    buttons?: FormArray<FormGroup<InteractiveButton>>;
}
export interface InteractiveListMessageAction {
    catalog_id?: FormControl<string>;
    sections?: FormArray<FormGroup<InteractiveListSection> | FormGroup<InteractiveProductSection>>;
}
export interface InteractiveProductMessageAction {
    catalog_id?: FormControl<string>;
    product_retailer_id?: FormControl<string>;
}
export interface InteractiveMessage {
    subject?: FormControl<string>;
    interactive_type?: FormControl<WhatsAppInteractiveMessageType>;
    header?: FormGroup<InteractiveMessageHeader>;
    body?: FormGroup<InteractiveMessageBody>;
    footer?: FormGroup<InteractiveMessageFooter>;
    action:
        | FormGroup<InteractiveButtonMessageAction>
        | FormGroup<InteractiveListMessageAction>
        | FormGroup<InteractiveProductMessageAction>;
}

export type InteractiveMessageControls = {
    [key in keyof InteractiveMessage]: AbstractControl;
};
export type InteractiveMessageFormGroup = FormGroup<InteractiveMessage> & {
    value: InteractiveMessage;
    controls: InteractiveMessageControls;
};

export const WHATSAPP_INTERACTIVE_VALIDATIONS = {
    MEDIA: {
        DOCUMENT: {
            TYPE: '.docx, .xlsx, .pptx, .doc, .xls , .ppt, .pdf, .txt, application/json, text/plain, text/csv, application/pdf, application/vnd.ms-powerpoint, application/msword, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.presentationml.presentation, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            MAX_SIZE_IN_MB: 100,
        },
        AUDIO: {
            TYPE: 'audio/aac, audio/mp4, audio/amr, audio/mpeg, audio/ogg; codecs=opus',
            MAX_SIZE_IN_MB: 16,
        },
        VIDEO: {
            TYPE: 'video/mp4, video/quicktime, video/3gpp',
            MAX_SIZE_IN_MB: 16,
        },
        IMAGE: {
            TYPE: 'image/png, image/jpeg, image/jpg',
            MAX_SIZE_IN_MB: 5,
        },
    },
    BUTTON_TYPE: {
        HEADER: {
            TEXT_MAX_LENGTH: 60,
        },
        BODY: {
            TEXT_MAX_LENGTH: 1024,
        },
        FOOTER: {
            TEXT_MAX_LENGTH: 60,
        },
        BUTTON: {
            TEXT_MAX_LENGTH: 20,
        },
    },
};
