import { Action, createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import * as actions from './../../actions';
import { IWidgetTeam } from '../../../model';

export interface ITeamsState extends EntityState<IWidgetTeam> {
    selectedTeamId: string;
}

const teamAdapter: EntityAdapter<IWidgetTeam> = createEntityAdapter({ selectId: (team) => team.id });
export const initialState: ITeamsState = teamAdapter.getInitialState({ selectedTeamId: null, ids: [], entities: {} });
export const index = createReducer(
    initialState,
    on(actions.setTeams, (state, { teams }) => teamAdapter.addMany(teams, state)),
    on(actions.selectTeam, (state, { teamId }) => ({ ...state, selectedTeamId: teamId })),
    on(actions.resetState, (state) => ({
        ...state,
        ...initialState,
    })),
    on(actions.logout, (state) => ({ ...state, ...initialState }))
);

export function reducer(state: ITeamsState = initialState, action: Action) {
    return index(state, action);
}

export const { selectIds, selectEntities, selectAll, selectTotal } = teamAdapter.getSelectors();
