import * as fromBehaviour from './reducers/behaviour';
import * as fromAgents from './reducers/agents';
import * as fromChannelMessages from './reducers/channel-messages';
import * as fromWidgetInfo from './reducers/widgetInfo';
import * as fromTeams from './reducers/teams';
import * as fromChannels from './reducers/channels';
import * as fromKnowledgeBase from './reducers/knowledgeBase';
import * as fromPubnub from './reducers/pubnub';
import * as fromClient from './reducers/client';
import * as fromPresenceOfChannel from './presence';
import * as fromAgentsTeam from './reducers/agents-team';
import { ActionReducer, ActionReducerMap, MetaReducer } from '@ngrx/store';
import { localStorageSync } from 'ngrx-store-localstorage';
import { getCookie } from '../utils';

// export * from './actions';
// export * from './selectors';
export * from './presence';

export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
    return (state, action) => {
        const clonedState = reducer(state, action);
        const keys = [];
        const keysToSync = ['widgetInfo', 'agents', 'AgentsTeamData', 'knowledgeBase', 'client'];
        Object.keys(clonedState)
            .filter((filteredKey) => keysToSync.includes(filteredKey))
            .forEach((key) => {
                if (key !== 'widgetInfo') {
                    keys.push({
                        [key]: [...Object.keys(clonedState[key])],
                    });
                } else {
                    keys.push({
                        [key]: [
                            ...Object.keys(clonedState[key]).filter(
                                (filterKey) => filterKey !== 'pushNotificationMessage'
                            ),
                        ],
                    });
                }
            });
        return localStorageSync({
            keys,
            rehydrate: getCookie('hello-widget-anonymous-uuid') || getCookie('hello-widget-uuid') ? true : false,
            storage: localStorage,
        })(reducer)(state, action);
    };
}

export interface IAppState {
    behaviour: fromBehaviour.IBehaviourState;
    agents: fromAgents.IAgentsState;
    channelMessages: fromChannelMessages.IChannelMessageState;
    widgetInfo: fromWidgetInfo.IWidgetState;
    teams: fromTeams.ITeamsState;
    channels: fromChannels.IChannelsState;
    knowledgeBase: fromKnowledgeBase.IKnowledgeBaseState;
    pubnub: fromPubnub.IPubnubState;
    client: fromClient.IClientState;
    agents_presence: fromPresenceOfChannel.IPresenceOfAgents;
    AgentsTeamData: fromAgentsTeam.IAgentsTeam;
}

export const reducers: ActionReducerMap<IAppState> = {
    behaviour: fromBehaviour.reducer,
    agents: fromAgents.reducer,
    channelMessages: fromChannelMessages.reducer,
    widgetInfo: fromWidgetInfo.reducer,
    teams: fromTeams.reducer,
    channels: fromChannels.reducer,
    knowledgeBase: fromKnowledgeBase.reducer,
    pubnub: fromPubnub.reducer,
    client: fromClient.clientReducer,
    agents_presence: fromPresenceOfChannel.PresenceOfAgentReducer,
    AgentsTeamData: fromAgentsTeam.AgentsTeamReducer,
};

export const metaReducers: Array<MetaReducer<any, any>> = [localStorageSyncReducer];
