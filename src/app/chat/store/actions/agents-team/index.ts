import { createAction, props } from '@ngrx/store';
import { AgentTeamResponse } from '../../../model';

/** PRESENCE OF CHANNEL Action **/
export const GetAgentsTeamsData = createAction('[agents-teams] Get Agents-Teams Data');
export const GetAgentsTeamsDataComplete = createAction(
    '[agents-teams] Get Agents-Teams Data Complete',
    props<AgentTeamResponse>()
);
export const GetAgentsTeamsDataError = createAction(
    '[agents-teams] Get Agents-Teams Data Error',
    props<{ error?: any }>()
);
export const getAnonymousClientId = createAction('[agents-teams] Get Anonymous client ID');
