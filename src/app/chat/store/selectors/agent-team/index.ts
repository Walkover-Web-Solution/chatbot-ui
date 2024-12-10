import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IAgentsTeam } from '../../reducers/agents-team';

const AgentTeamState = createFeatureSelector<IAgentsTeam>('AgentsTeamData');
export const getAllTeams = createSelector(AgentTeamState, (state) => state.teams);
export const getAllAgents = createSelector(AgentTeamState, (state) => state.agents);
export const getAgentTeamInProcess = createSelector(AgentTeamState, (state) => state.getAgentTeamDataInProcess);
