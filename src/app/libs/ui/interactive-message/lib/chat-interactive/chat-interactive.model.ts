import { WhatsAppInteractiveMessageType } from '@msg91/models/whatsapp-models';

export interface InteractiveMessageHeader {
    type: 'text' | 'image' | 'video' | 'document';
    text: string;
}
export interface ButtonInteractiveMessage {
    buttons: Array<{
        type: 'reply';
        reply: {
            id: string;
            title: string;
        };
    }>;
}
export interface ListInteractiveMessage {
    button: string;
    sections: Array<{
        title: string;
        rows: Array<{
            id: string;
            title: string;
            description: string;
        }>;
    }>;
}
export interface InteractiveMessage {
    type: WhatsAppInteractiveMessageType;
    header: InteractiveMessageHeader;
    body: {
        text: string;
    };
    footer: {
        text: string;
    };
    action: ButtonInteractiveMessage | ListInteractiveMessage;
}
export interface InteractiveMessageRequest {
    type: 'interactive';
    interactive_type: string;
    subject: string;
    reply_message: Partial<InteractiveMessage> & {
        meta_data: { integrated_number: number; integrated_number_id: number };
    };
    id?: string;
}
