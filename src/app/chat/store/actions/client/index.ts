import { createAction, props } from '@ngrx/store';
import { IClient } from '../../../model';

export const setClient = createAction('[Client] set client', props<{ client: Partial<IClient> }>());
export const resetClient = createAction('[Client] reset client');

export const updateClient = createAction(
    '[Client] Update client',
    props<{ client: Partial<IClient>; channel: string }>()
);
export const updateClientComplete = createAction(
    '[Client] Update client Complete',
    props<{ client: Partial<IClient>; channel: string }>()
);
export const chatInputSubmitted = createAction('[Client] Chat Input Submitted');
export const updateClientError = createAction('[Client] Update client Error', props<{ error: any }>());
export const setCallStatus = createAction(
    '[Client] call Status Changed',
    props<{ channel: string; callStatusChanged: boolean }>()
);
export const setClientStatus = createAction('[Client] Set Client Status', props<{ status: boolean }>());
