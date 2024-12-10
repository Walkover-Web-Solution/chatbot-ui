import { AgentTeamResponse } from '../../../model';
import { createReducer, on } from '@ngrx/store';
import {
    GetAgentsTeamsData,
    GetAgentsTeamsDataComplete,
    GetAgentsTeamsDataError,
    logout,
    resetState,
} from '../../actions';

export interface IAgentsTeam extends AgentTeamResponse {
    getAgentTeamDataInProcess: boolean;
    error: any;
}

/** Initial state of PRESENCE OF CHANNEL **/
export const initialAgentsTeam: IAgentsTeam = {
    agents: [],
    teams: [],
    getAgentTeamDataInProcess: false,
    error: null,
};

/** reducer function of PRESENCE OF CHANNEL **/
export const AgentsTeamReducer = createReducer(
    initialAgentsTeam,
    on(GetAgentsTeamsData, (state) => ({ ...state, getAgentTeamDataInProcess: true })),
    on(GetAgentsTeamsDataComplete, (state, { agents, teams }) => ({
        ...state,
        agents: [...agents],
        teams: [...teams],
        getAgentTeamDataInProcess: false,
    })),
    on(GetAgentsTeamsDataError, (state, { error }) => ({ ...state, getAgentTeamDataInProcess: false, error })),
    on(resetState, (state) => ({
        ...state,
        ...initialAgentsTeam,
    })),
    on(logout, (state) => ({ ...state, initialAgentsTeam }))
);
