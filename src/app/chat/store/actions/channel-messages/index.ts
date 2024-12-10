import { createAction, props } from '@ngrx/store';
import { IMessage } from '../../../model';

export const SetChannelMessages = createAction(
    '[channel-Message] Set Channel Messages',
    props<{ response: { channel: string; messages: IMessage[] } }>()
);
export const AddNewMessage = createAction(
    '[channel-Message] Add New Message',
    props<{ response: { channel: string; message: IMessage } }>()
);
export const AddPushNotificationMessage = createAction(
    '[channel-Message] Add Push Notification Message',
    props<{ response: { message: any } }>()
);
export const ChannelMessageDelete = createAction(
    '[channel-Message] Channel Message Delete',
    props<{ response: { channel: string; message: any } }>()
);
export const AddFormMessage = createAction(
    '[channel-Message] Add Form Message',
    props<{ response: { channel: string; message: IMessage } }>()
);
export const UpdateFormMessage = createAction(
    '[channel-Message] Update Form Message',
    props<{ response: { channel: string; message: IMessage } }>()
);
export const AddFeedBackMessage = createAction(
    '[channel-Message] Add Feedback Message',
    props<{ response: { channel: string; message: IMessage } }>()
);
export const UpdateFeedBackMessage = createAction(
    '[channel-Message] Update Feedback Message',
    props<{ response: { channel: string; message: IMessage } }>()
);
export const ResetMessageState = createAction(
    '[channel-Message] Reset channel message state',
    props<{ channel: string }>()
);
