import { Pipe, PipeTransform } from '@angular/core';
import {
    IFeedbackMessage,
    IFormMessage,
    IMessage,
    IOutboundMessageModel,
    MessageTypes,
    IAttachmentContent,
    ITextContent,
} from '../../../../model';
import { extractContent } from '../../../../utils/messages';

@Pipe({
    name: 'lastConversion',
    standalone: false
})
export class LastConversionPipe implements PipeTransform {
    transform(value: IMessage, maxCharacter: number = 20): string {
        switch (value?.message?.type) {
            // eslint-disable-next-line no-fallthrough
            case MessageTypes.FEEDBACK: {
                if (!(value?.message as IFeedbackMessage)?.feedbackGiven) {
                    return 'Sender :' + 'Feedback requested';
                } else {
                    return 'You :' + 'Feedback submit';
                }
            }
            case MessageTypes.POST_FEEDBACK: {
                return 'You :' + 'Feedback submit';
            }
            // eslint-disable-next-line no-fallthrough
            case MessageTypes.FORM: {
                if (!(value.message as IFormMessage)?.formSubmitted) {
                    return 'Sender :' + 'Form requested';
                } else {
                    return 'You :' + 'Form submit';
                }
            }
            // eslint-disable-next-line no-fallthrough
            case MessageTypes.CHAT:
            case MessageTypes.WIDGET: {
                const message = value?.message as IOutboundMessageModel;
                if (
                    (message as IOutboundMessageModel)?.sender_id ||
                    (message as IOutboundMessageModel)?.is_auto_response
                ) {
                    if ((message as any)?.is_deleted) {
                        return 'This message was deleted.';
                    } else if ((message?.content as IAttachmentContent)?.attachment?.length) {
                        return 'Sender: Attachment';
                    } else if ((message?.content as ITextContent)?.text) {
                        const content = extractContent((message?.content as ITextContent).text, true);
                        return (
                            'Sender: ' +
                            (content?.length > maxCharacter ? content.substr(0, maxCharacter) + '...' : content)
                        );
                    } else if ((message?.content as any).type) {
                        const content = extractContent((message?.content as any).body.text, true);
                        return (
                            'Sender: ' +
                            (content?.length > maxCharacter ? content.substr(0, maxCharacter) + '...' : content)
                        );
                    }
                } else if (message) {
                    if ((message as any)?.is_deleted) {
                        return 'This message was deleted.';
                    } else if ((message?.content as IAttachmentContent)?.attachment?.length) {
                        return 'You: Attachment';
                    } else if (message?.content) {
                        const content: string = (message?.content as ITextContent)?.text.trim() as string;
                        return (
                            'You: ' +
                            (content?.length > maxCharacter ? content.substr(0, maxCharacter) + '...' : content)
                        );
                    } else if ((message?.content as any).type) {
                        const content = extractContent((message?.content as any).body.text, true);
                        return (
                            'You: ' +
                            (content?.length > maxCharacter ? content.substr(0, maxCharacter) + '...' : content)
                        );
                    }
                }
                break;
            }
            // eslint-disable-next-line no-fallthrough
            default: {
                return '';
            }
        }
    }
}
