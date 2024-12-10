import { Action, createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';

import { IWidgetAgent } from '../../../model';
import { logout, resetState } from '../../actions';

export interface IAgentsState extends EntityState<IWidgetAgent> {}

const agentAdapter: EntityAdapter<IWidgetAgent> = createEntityAdapter({ selectId: (agent) => agent.id });
export const initialState: IAgentsState = agentAdapter.getInitialState();
export const index = createReducer(
    initialState,
    on(resetState, (state) => ({
        ...state,
        ...initialState,
    })),
    on(logout, (state) => ({ ...state, initialState }))
);

export function reducer(state: IAgentsState = initialState, action: Action) {
    return index(state, action);
}
