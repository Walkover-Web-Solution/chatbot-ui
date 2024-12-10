import { Action, createReducer, on } from '@ngrx/store';
import * as behaviourAction from '../../actions/behaviour';
import { ActiveView, CHAT_SECTION_VALUE, IFileResponse } from '../../../model';
import { logout } from '../../actions';

export interface IBehaviourState {
    visible: boolean;
    activeView: ActiveView;
    messageBoxState: 'Focused' | 'Blurred' | 'Typing' | 'Not-Empty' | 'Empty';
    unSendContent: string;
    InBetweenCall: boolean;
    networkState: 'ONLINE' | 'OFFLINE';
    chatSelectedSection: CHAT_SECTION_VALUE;
    fileResponse: IFileResponse;
    fileUploading: boolean;
    fileUploadingProgress: number;
    fileUploadingError: any;
    fileUploadingSuccess: boolean;
}

export const initialState: IBehaviourState = {
    InBetweenCall: false,
    activeView: 'Chat',
    messageBoxState: 'Blurred',
    networkState: 'OFFLINE',
    visible: false,
    unSendContent: null,
    chatSelectedSection: null,
    fileResponse: null,
    fileUploading: false,
    fileUploadingProgress: null,
    fileUploadingError: null,
    fileUploadingSuccess: null,
};
export const index = createReducer(
    initialState,
    on(behaviourAction.changeVisibility, (state, action) => ({ ...state, visible: action.visible })),
    on(behaviourAction.setChatScreen, (state, action) => ({ ...state, chatSelectedSection: action.chatScreen })),
    on(behaviourAction.setActiveView, (state, action) => ({ ...state, activeView: action.activeView })),
    on(behaviourAction.setMessageBoxState, (state, action) => ({
        ...state,
        messageBoxState: action.activeState,
        unSendContent:
            action.activeState === 'Typing' || action.activeState === 'Empty' || action.activeState === 'Not-Empty'
                ? action.unSendContent
                : state.unSendContent,
    })),
    on(behaviourAction.setNetworkStatus, (state, { status }) => ({ ...state, networkState: status })),
    on(behaviourAction.uploadFile, (state, { file }) => ({
        ...state,
        fileResponse: null,
        fileUploading: true,
        fileUploadingError: null,
        fileUploadingProgress: 0,
        fileUploadingSuccess: false,
    })),
    on(behaviourAction.uploadFileProgress, (state, { progress }) => ({ ...state, fileUploadingProgress: progress })),
    on(behaviourAction.uploadFileComplete, (state, { response }) => ({
        ...state,
        fileResponse: response,
        fileUploading: false,
        fileUploadingError: null,
        fileUploadingSuccess: true,
    })),
    on(behaviourAction.uploadFileError, (state, { error }) => ({
        ...state,
        fileUploading: false,
        fileUploadingSuccess: false,
        fileUploadingError: error,
        fileResponse: null,
    })),
    on(behaviourAction.ResetFileFlags, (state) => ({
        ...state,
        fileResponse: null,
        fileUploading: false,
        fileUploadingProgress: null,
        fileUploadingError: null,
        fileUploadingSuccess: null,
    })),
    on(logout, (state) => ({ ...state, ...initialState }))
);

export function reducer(state: IBehaviourState = initialState, action: Action) {
    return index(state, action);
}
