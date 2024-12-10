import { Action, createReducer, on } from '@ngrx/store';
import { IAdditionalData, IParam, IPushNotification, IWidgetInfo } from '../../../model';
import * as actions from './../../actions';
import { createEntityAdapter, EntityState } from '@ngrx/entity';

export interface IParamState extends EntityState<IParam> {}

export interface IWidgetState {
    widgetToken: string;
    unique_id: string;
    number: string;
    mail: string;
    name: string;
    widgetInfo: IWidgetInfo;
    clientParam: IParamState;
    client_uuid: string; // client uuid
    additionalData: IAdditionalData;
    initWidgetInProgress: boolean;
    initWidgetInSuccess: boolean;
    initWidgetFailed: boolean;
    widgetTheme: { [key: string]: string | boolean };
    pushNotificationMessage: IPushNotification;
    pushMessage: IPushNotification;
}

const paramAdapter = createEntityAdapter<IParam>({
    selectId: (p) => p.id,
});
export const initialState: IWidgetState = {
    widgetToken: null,
    widgetInfo: null,
    clientParam: paramAdapter.getInitialState(),
    client_uuid: null,
    name: null,
    mail: null,
    number: null,
    unique_id: null,
    additionalData: null,
    initWidgetInProgress: false,
    initWidgetInSuccess: false,
    initWidgetFailed: false,
    widgetTheme: null,
    pushNotificationMessage: null,
    pushMessage: null,
};
export const widgetReducer = createReducer(
    initialState,
    on(actions.setWidgetClientUuid, (state, action) => ({ ...state, client_uuid: action.client_uuid })),
    on(actions.initWidget, (state: IWidgetState, { config }) => ({
        ...state,
        client_uuid: null,
        ...config,
        initWidgetInProgress: true,
        initWidgetInSuccess: null,
        initWidgetFailed: false,
    })),
    on(actions.initWidgetSuccess, (state: IWidgetState) => ({
        ...state,
        initWidgetInProgress: false,
        initWidgetInSuccess: true,
        initWidgetFailed: false,
    })),
    on(actions.initWidgetFailed, (state: IWidgetState) => ({
        ...state,
        initWidgetInProgress: false,
        initWidgetInSuccess: false,
        initWidgetFailed: true,
    })),
    on(actions.setWidgetInfo, (state, action) => ({ ...state, widgetInfo: action.widgetInfo })),
    on(actions.setClientParam, (state, action) => ({
        ...state,
        clientParam: paramAdapter.addMany(
            [
                ...action.clientParam.default_params,
                ...action.clientParam.standard_params,
                ...action.clientParam.custom_params,
            ],
            state.clientParam
        ),
    })),
    on(actions.setCountryForNumberParam, (state, action) => {
        let numberParam = paramAdapter
            .getSelectors()
            .selectAll(state.clientParam)
            .find((p) => p.name === 'number');
        return {
            ...state,
            clientParam: paramAdapter.updateOne(
                {
                    id: numberParam.id,
                    changes: {
                        country: action.country,
                    },
                },
                state.clientParam
            ),
        };
    }),
    on(actions.setClient, (state, { client }) => ({
        ...state,
        number: client?.number,
        mail: client?.mail,
    })),
    on(actions.resetState, (state) => ({
        ...state,
        ...initialState,
    })),
    on(actions.logout, (state) => ({
        ...state,
        ...initialState,
        widgetToken: state.widgetToken,
        clientParam: state.clientParam,
    })),
    on(actions.setWidgetTheme, (state, action) => ({
        ...state,
        widgetTheme: action.widgetTheme,
    })),
    on(actions.addDomainTrackingError, (state, action) => ({
        ...state,
        widgetInfo: {
            ...state.widgetInfo,
            is_domain_enable: false,
        },
    })),
    on(actions.SetPushNotifications, (state, { response }) => ({
        ...state,
        pushNotificationMessage: response.message,
    })),
    on(actions.SetPushMessage, (state, { response }) => ({
        ...state,
        pushMessage: response.message,
    }))
);

export const { selectAll, selectTotal, selectIds, selectEntities } = paramAdapter.getSelectors();

export function reducer(state: IWidgetState = initialState, action: Action) {
    return widgetReducer(state, action);
}
