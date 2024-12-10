import { createAction, props } from '@ngrx/store';
import { IWidgetTeam } from '../../../model';

export const setTeams = createAction('[Teams] set teams', props<{ teams: IWidgetTeam[] }>());

export const selectTeam = createAction('[Teams] select teamId', props<{ teamId: string }>());
