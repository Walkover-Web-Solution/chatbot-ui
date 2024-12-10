import { createAction, props } from '@ngrx/store';
import { ActiveView, CHAT_SECTION_VALUE, IFileResponse } from '../../../model';

export const changeVisibility = createAction('[Behaviour] Change Visibility', props<{ visible: boolean }>());

export const setActiveView = createAction('[Behaviour] set active view', props<{ activeView: ActiveView }>());
export const setChatScreen = createAction('[Behaviour] set Chat Screen', props<{ chatScreen: CHAT_SECTION_VALUE }>());
export const setMessageBoxState = createAction(
    '[Behaviour] set message-box state',
    props<{
        activeState: 'Focused' | 'Blurred' | 'Typing' | 'Not-Empty' | 'Empty';
        unSendContent?: string;
        channel?: string;
    }>()
);
export const uploadFile = createAction('[Behaviour] Upload File', props<{ file: File }>());
export const uploadFileError = createAction('[Behaviour] Upload File Error', props<{ error?: any }>());
export const uploadFileComplete = createAction(
    '[Behaviour] Upload File Complete',
    props<{ response: IFileResponse }>()
);
export const uploadFileProgress = createAction('[Behaviour] Upload File Progress', props<{ progress: number }>());

export const ResetFileFlags = createAction('[Behaviour] Reset File Flags');

export const setNetworkStatus = createAction(
    '[Behaviour] Set Network Status',
    props<{ status: 'ONLINE' | 'OFFLINE' }>()
);
