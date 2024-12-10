import { createAction, createReducer, on, props } from '@ngrx/store';
import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { PresenceState, SocketPresenceEvent } from '../model/socket';
import { cloneDeep } from 'lodash-es';

/** PRESENCE OF CHANNEL Action **/
export const SET_PRESENCE_OF_AGENT = createAction(
    '[Presence] SET_PRESENCE_OF_AGENT',
    props<{ uuid: string; status: 'join' | 'leave' | 'state-change' | 'timeout' }>()
);
export const SET_STATE_OF_AGENT = createAction(
    '[Presence] SET_STATE_OF_AGENT',
    props<{ uuid: string; presenceState: PresenceState }>()
);
export const RESET_PRESENCE_DATA = createAction('[Presence] RESET_PRESENCE_DATA');

/** Initial state of PRESENCE OF CHANNEL **/
const presenceAdepter = createEntityAdapter<SocketPresenceEvent>({
    selectId: (model) => model.uuid,
});

export const initialPresenceOfChannel: IPresenceOfAgents = presenceAdepter.getInitialState();

/** reducer function of PRESENCE OF CHANNEL **/
export const PresenceOfAgentReducer = createReducer(
    initialPresenceOfChannel,
    on(SET_PRESENCE_OF_AGENT, (state, { uuid, status }) => {
        let agentPresence = cloneDeep(
            presenceAdepter
                .getSelectors()
                .selectAll(state)
                ?.find((s) => s.uuid === uuid)
        );
        if (agentPresence) {
            agentPresence['action'] = status;
        } else {
            agentPresence = {
                action: status,
                state: null,
                uuid: uuid,
                channel: null,
            };
        }
        return presenceAdepter.upsertOne(agentPresence, state);
    }),
    on(SET_STATE_OF_AGENT, (state, { uuid, presenceState }) => {
        let agentPresence = cloneDeep(
            presenceAdepter
                .getSelectors()
                .selectAll(state)
                ?.find((s) => s.uuid === uuid)
        );
        if (agentPresence) {
            agentPresence['action'] = 'state-change';
            agentPresence['state'] = presenceState;
        } else {
            agentPresence = {
                action: 'join',
                state: presenceState,
                uuid: uuid,
                channel: null,
            };
        }
        return presenceAdepter.upsertOne(agentPresence, state);
    }),
    on(RESET_PRESENCE_DATA, (action) => initialPresenceOfChannel)
);

export type IPresenceOfAgents = EntityState<SocketPresenceEvent>;

export const presenceSelectors = presenceAdepter.getSelectors();
