import { createAction, props } from '@ngrx/store';
import { IClientParam, IInitWidgetReq, IPushNotification, IWidgetInfo } from '../../../model';

export const initWidget = createAction('[WidgetInfo] init start', props<{ config: IInitWidgetReq }>());
export const initWidgetFailed = createAction('[WidgetInfo] init failed');
export const initWidgetSuccess = createAction('[WidgetInfo] init Successed');

export const logout = createAction('[WidgetInfo] logout');
export const resetState = createAction('[WidgetInfo] initialState');

export const setWidgetInfo = createAction('[WidgetInfo] set widgetInfo', props<{ widgetInfo: IWidgetInfo }>());

export const setWidgetClientUuid = createAction('[WidgetInfo] set ClientUuid', props<{ client_uuid: string }>());
export const setClientParam = createAction('[widgetInfo] Set Client Param', props<{ clientParam: IClientParam }>());
export const setCountryForNumberParam = createAction(
    '[WidgetInfo] set country for number param',
    props<{ country: string }>()
);

export const setWidgetTheme = createAction(
    '[WidgetInfo] widget theme',
    props<{ widgetTheme: { [key: string]: string | boolean } }>()
);

export const addDomainTracking = createAction('[WidgetInfo] Add Domain Tracking', props<{ domain: string }>());
export const addDomainTrackingSuccess = createAction(
    '[WidgetInfo] Add Domain Tracking Success',
    props<{ status: boolean }>()
);
export const addDomainTrackingError = createAction(
    '[WidgetInfo] Add Domain Tracking Error',
    props<{ error: string }>()
);
export const SetPushNotifications = createAction(
    '[channel-Message] Set Push Notifications',
    props<{ response: { message: IPushNotification } }>()
);
export const SetPushMessage = createAction(
    '[channel-Message] Set Push Message',
    props<{ response: { message: IPushNotification } }>()
);
