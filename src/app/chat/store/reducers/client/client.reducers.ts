import { Action, createReducer, on } from '@ngrx/store';
import { IClient } from '../../../model';
import * as actions from './../../actions';

export interface IClientState extends IClient {
    chatInputSubmitted: boolean;
    getClientToken: string;
    getCallToken: string;
}

export const initialState: IClientState = {
    call_enabled: false,
    uuid: null,
    country: null,
    mail: null,
    name: null,
    number: null,
    pseudo_name: true,
    unique_id: null,
    presence_channel: null,
    country_iso2: null,
    chatInputSubmitted: false,
    is_blocked: false,
    getClientToken: null,
    getCallToken: null,
};

const _clientReducer = createReducer(
    initialState,
    on(actions.setClient, (state, { client }) => ({ ...state, ...client })),
    on(actions.resetClient, () => initialState),
    on(actions.logout, (state) => ({ ...state, ...initialState })),
    on(actions.updateClientComplete, (state, { client }) => ({ ...state, ...client })),
    on(actions.setCallStatus, (state, { callStatusChanged }) => ({ ...state, call_enabled: callStatusChanged })),
    on(actions.chatInputSubmitted, (state) => ({ ...state, chatInputSubmitted: true })),
    on(actions.setClientStatus, (state, { status }) => ({ ...state, is_blocked: status })),
    on(actions.getClientTokenSuccess, (state, { token }) => ({ ...state, getClientToken: token })),
    on(actions.getCallTokenSuccess, (state, { token }) => ({ ...state, getCallToken: token }))
);
export function clientReducer(state: IClientState = initialState, action: Action) {
    return _clientReducer(state, action);
}
