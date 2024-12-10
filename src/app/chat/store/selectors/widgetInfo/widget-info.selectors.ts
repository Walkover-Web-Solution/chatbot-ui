import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IWidgetState, selectAll } from '../../reducers/widgetInfo';

export const widgetInfoStore = createFeatureSelector<IWidgetState>('widgetInfo');

export const selectWidgetToken = createSelector(widgetInfoStore, (state) => state.widgetToken);
export const selectInitWidgetInProcess = createSelector(widgetInfoStore, (state) => state.initWidgetInProgress);
export const selectInitWidgetSuccess = createSelector(widgetInfoStore, (state) => state.initWidgetInSuccess);
export const selectInitWidgetFailed = createSelector(widgetInfoStore, (state) => state.initWidgetFailed);
export const selectClientParams = createSelector(widgetInfoStore, (state) => state.clientParam);
export const selectAllClientParams = createSelector(selectClientParams, selectAll);

export const selectWidgetInfo = createSelector(widgetInfoStore, (state) => state?.widgetInfo);
export const selectWidgetChatStatus = createSelector(selectWidgetInfo, (state) => state?.chat_status);
export const selectWidgetTagline = createSelector(selectWidgetInfo, (state) => state?.tagline);
export const selectFaqFlag = createSelector(selectWidgetInfo, (state) => state?.show_faq);
export const selectWidgetCompanyId = createSelector(selectWidgetInfo, (state) => state?.company_id);

export const selectWidgetName = createSelector(selectWidgetInfo, (state) => state?.name);
export const selectWidgetAutoFocus = createSelector(selectWidgetInfo, (state) => state?.auto_focus);
export const selectWidgetCallEnables = createSelector(selectWidgetInfo, (state) => state?.enable_call);
export const selectWidgetClassifyEnables = createSelector(selectWidgetInfo, (state) => state?.classify);
export const selectWidgetFAQEnables = createSelector(selectWidgetInfo, (state) => state.enable_faq);
export const selectWidgetShowWidgetForm = createSelector(widgetInfoStore, (state) => {
    return state?.additionalData?.show_widget_form === true || state?.additionalData?.show_widget_form === false
        ? state?.additionalData?.show_widget_form
        : state?.widgetInfo?.show_widget_form;
});
// export const selectWidgetHideLauncher = createSelector(selectWidgetInfo, (state) => state?.hide_launcher);
// export const selectWidgetShowCloseButton = createSelector(selectWidgetInfo, (state) => state?.show_close_button);
// export const selectWidgetShowSendButton = createSelector(selectWidgetInfo, (state) => state?.show_send_button);
export const selectWidgetHideLauncher = createSelector(widgetInfoStore, (state) => {
    return state?.additionalData?.hide_launcher === true || state?.additionalData?.hide_launcher === false
        ? state?.additionalData?.hide_launcher
        : state?.widgetInfo?.hide_launcher;
});
export const selectWidgetShowCloseButton = createSelector(widgetInfoStore, (state) => {
    return state?.additionalData?.show_close_button === true || state?.additionalData?.show_close_button === false
        ? state?.additionalData?.show_close_button
        : state?.widgetInfo?.show_close_button;
});
export const selectWidgetShowSendButton = createSelector(widgetInfoStore, (state) => {
    return state?.additionalData?.show_send_button === true || state?.additionalData?.show_send_button === false
        ? state?.additionalData?.show_send_button
        : state?.widgetInfo?.show_send_button;
});
export const selectDefaultClientParams = createSelector(
    selectAllClientParams,
    (state) => state?.filter((x) => x.isDefault) || []
);
export const selectWidgetConfig = createSelector(widgetInfoStore, (state) => ({
    widgetToken: state.widgetToken,
    mail: state.mail,
    additionalData: state.additionalData,
    name: state.name,
    number: state.number,
    unique_id: state.unique_id,
}));
export const getWidgetTheme = createSelector(widgetInfoStore, (state) => state?.widgetTheme);
export const selectPushNotificationMessage = createSelector(widgetInfoStore, (state) => state?.pushNotificationMessage);
export const selectPushMessage = createSelector(widgetInfoStore, (state) => state?.pushMessage);
export const selectTypingChannel = createSelector(widgetInfoStore, (state) =>
    state.widgetInfo?.event_channels?.find((channel) => channel.includes('typing') ?? '')
);
