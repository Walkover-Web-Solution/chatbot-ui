import { createAction, props } from '@ngrx/store';
import {
    AfterMessagePublishOperation,
    IChannel,
    IClassificationChannel,
    IClient,
    IClientListResp,
    IMessage,
    IPostFeedback,
    Message,
} from '../../../model';

export const getChannelList = createAction(
    '[Channels] get channels list',
    props<{
        widgetToken: string;
        uuid: string;
        data: {
            mail?: string;
            number?: string;
            name?: string;
            unique_id?: string;
            uuid?: string;
            anonymous_client_uuid?: string;
        };
        reconnection?: boolean;
    }>()
);
export const getChannelListSuccess = createAction(
    '[Channels] get channels list success',
    props<{ data: IClientListResp; reconnection?: boolean }>()
);
export const setChannels = createAction('[Channels] set channels', props<{ channels: IChannel[]; uuid: string }>());

export const CreateChannel = createAction(
    '[Channels] Create Channel',
    props<{
        request: {
            authorization: string;
            client: Partial<IClient>;
            firstMessage: Message;
        };
    }>()
);
export const CreateChannelComplete = createAction(
    '[Channels] Create Channel Complete',
    props<{ response: { channel: IChannel } }>()
);
export const CreateChannelError = createAction('[Channels] Create Channel Error', props<{ error?: any }>());

export const ReopenChannel = createAction(
    '[Channels] Reopen Channel',
    props<{
        request: {
            authorization: string;
            channel: IChannel;
            firstMessage: Message;
        };
    }>()
);
export const ReopenChannelComplete = createAction(
    '[Channels] Reopen Channel Complete',
    props<{ response: { channel: IChannel } }>()
);
export const ReopenChannelError = createAction('[Channels] Reopen Channel Error', props<{ error?: any }>());

export const AfterPublishOperations = createAction(
    '[Channels] After Publish Operations',
    props<{
        request: {
            authorization: string;
            channel: string;
            Message: Message;
            operations: AfterMessagePublishOperation[];
        };
    }>()
);
export const AfterPublishOperationsComplete = createAction(
    '[Channels] After Publish Operations Complete',
    props<{
        response: {
            channel?: string;
            classification?: IClassificationChannel;
        };
    }>()
);
export const AfterPublishOperationsError = createAction(
    '[Channels] After Publish Operations Error',
    props<{ error?: any }>()
);

export const SubmitChannelFeedback = createAction(
    '[Channels] Submit Channel Feedback',
    props<{ request: IPostFeedback; channel: string }>()
);
export const SubmitChannelFeedbackComplete = createAction(
    '[Channels] Submit Channel Feedback Complete',
    props<{ response: IPostFeedback }>()
);
export const SubmitChannelFeedbackError = createAction(
    '[Channels] Submit Channel Feedback Error',
    props<{ error?: any }>()
);

export const deleteUnreadCount = createAction(
    '[Channels] Delete Unread count',
    props<{ channel: string; authToken: string }>()
);
export const deleteUnreadCountComplete = createAction(
    '[Channels] Delete Unread count Complete',
    props<{ channel: string }>()
);
export const deleteUnreadCountError = createAction('[Channels] Delete Unread count Error', props<{ error?: any }>());

export const channelStateChange = createAction(
    '[Channels] Channel State Change',
    props<{ channel: string; channelClosed: boolean }>()
);
export const resetChannelList = createAction('[Channels] Remove Channel List');
export const agentReadTheMessages = createAction(
    '[Channels] Delete Unread count Error',
    props<{ channel: string; read: boolean }>()
);

export const selectChannel = createAction('[Channels] select channel', props<{ channel: string }>());

export const setVideoCallURL = createAction('[Channels] Set Video Call URL', props<{ channel: string; url: string }>());

export const UpdateLastMessage = createAction(
    '[channel-Message] Update Last Message',
    props<{ response: { channel: string; message: IMessage } }>()
);
export const UpdateChannel = createAction(
    '[channel-Message] Update Channel',
    props<{ response: { channel: string; channelData: IChannel } }>()
);

export const getGreeting = createAction(
    '[Channels] Get Greeting',
    props<{ company_id: string | any; bot_id: string | any; UUID: any; token: any; botType: string }>()
);

export const getGreetingSuccess = createAction('[Channels] Get Greeting Success', props<{ data: any }>());
