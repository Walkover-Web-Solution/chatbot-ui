import { IFeedbackMessage, IMessage, IPostFeedback, MessageTypes } from '../model';

export const arrangeMessagesOfChannel = (messages: IMessage[]) => {
    for (let i = 0; i < messages.length; i++) {
        if (messages[i].message?.type === MessageTypes.FEEDBACK) {
            let message = messages[i].message as IFeedbackMessage;
            let hasPostFeedback;
            for (let j = 0; j < messages.length; j++) {
                if (
                    message.token === (messages[j].message as IPostFeedback).token &&
                    (messages[j].message as IPostFeedback).type === MessageTypes.POST_FEEDBACK
                ) {
                    hasPostFeedback = true;
                    message = {
                        ...message,
                        rating: (messages[j].message as IPostFeedback).rating,
                        feedback_msg: (messages[j].message as IPostFeedback).feedback_msg,
                        feedbackGiven: true,
                    };
                    break;
                }
            }
            if (hasPostFeedback) {
                messages[i].message = message;
            } else {
                (messages[i].message as IFeedbackMessage).feedbackGiven = false;
            }
        }
        if (
            messages[i].message.type !== MessageTypes.CHAT &&
            messages[i].message.type !== MessageTypes.WIDGET &&
            messages[i].message.type !== MessageTypes.FEEDBACK &&
            messages[i].message.type !== MessageTypes.POST_FEEDBACK
        ) {
            messages.splice(i, 1);
        }
    }
};

export const extractContent = (s, space): string => {
    const span = document.createElement('span');
    span.innerHTML = s;
    if (space) {
        const children = span.querySelectorAll('*');
        for (let i = 0; i < children.length; i++) {
            if (children[i].textContent) children[i].textContent += ' ';
            else (children[i] as any).innerText += ' ';
        }
    }
    return [span.textContent || span.innerText].toString().replace(/ +/g, ' ');
};
