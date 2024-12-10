import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IBehaviourState } from '../../reducers/behaviour';

export const selectBehaviourState = createFeatureSelector<IBehaviourState>('behaviour');

export const selectVisibility = createSelector(selectBehaviourState, (state) => state.visible);
export const selectActiveView = createSelector(selectBehaviourState, (state) => state.activeView);
export const selectedChatScreen = createSelector(selectBehaviourState, (state) => state.chatSelectedSection);
export const selectNetworkStatus = createSelector(selectBehaviourState, (state) => state.networkState);
export const getMessageBoxState = createSelector(selectBehaviourState, (state) => state.messageBoxState);
export const getUnSendContent = createSelector(selectBehaviourState, (state) => state.unSendContent);
export const fileUploadingInProgress = createSelector(selectBehaviourState, (state) => state.fileUploading);
export const fileUploadingProgress = createSelector(selectBehaviourState, (state) => state.fileUploadingProgress);
export const fileUploadingSuccess = createSelector(selectBehaviourState, (state) => state.fileUploadingSuccess);
export const fileUploadingError = createSelector(selectBehaviourState, (state) => state.fileUploadingError);
export const fileUploadData = createSelector(selectBehaviourState, (state) => state.fileResponse);
