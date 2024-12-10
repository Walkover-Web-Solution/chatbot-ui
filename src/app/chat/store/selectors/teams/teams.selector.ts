import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ITeamsState, selectAll, selectEntities, selectTotal } from '../../reducers/teams';

export const teamsStore = createFeatureSelector<ITeamsState>('teams');
export const selectTotalTeamsCount = createSelector(teamsStore, selectTotal);
export const selectTeamEntries = createSelector(teamsStore, selectEntities);
export const selectAllTeams = createSelector(teamsStore, selectAll);
export const selectedTeamId = createSelector(teamsStore, (s) => s.selectedTeamId);
export const selectedTeam = createSelector(selectTeamEntries, selectedTeamId, (entries, id) => entries[id]);
