import { createFeatureSelector, createSelector } from '@ngrx/store';

import { IClientState } from '../reducers/client';
import { IWidgetState } from '../reducers/widgetInfo';
import { AfterMessagePublishOperation, IChannelAssignees } from '../../model';
import { selectEntities } from '../reducers/channels';
import {
    selectDefaultClientParams,
    selectInitWidgetInProcess,
    selectWidgetInfo,
    selectWidgetShowWidgetForm,
} from './widgetInfo';
import { getAgentTeamInProcess, getAllAgents, getAllTeams } from './agent-team';
import {
    selectChannelListInProcess,
    selectChannels,
    selectCreateChannelInProcess,
    selectedChannelStr,
    selectLastMessageOfChannelsInProcess,
    selectReopenInProcess,
    selectTotalMessageCountInProcess,
} from './channels';
import { IPresenceOfAgents } from '../presence';
import { IAppState } from '../index';
import { selectedChannelMessages } from './channel-messages';
import { IAgentsTeam } from '../reducers/agents-team';
import {
    getChannelHistoryInProcess,
    getPubNubKeysInProcess,
    publishMessageInProcess,
    pubnubInitializingInProgress,
    reAuthenticationProcess,
} from './pubnub';
import { fileUploadingInProgress } from './behaviour';
import { shuffle } from 'lodash-es';
import { selectedTeam } from './teams';
import { SocketPresenceEvent } from '../../model/socket';

export * from './behaviour';
export * from './widgetInfo';
export * from './client';
export * from './channels';
export * from './pubnub';
export * from './channel-messages';
export * from './teams';
export * from './agent-team';

const selectClient = createFeatureSelector<IClientState>('client');
const widgetInfoStore = createFeatureSelector<IWidgetState>('widgetInfo');
const AgentTeamState = createFeatureSelector<IAgentsTeam>('AgentsTeamData');

export const getAuthToken = createSelector(selectClient, widgetInfoStore, (clientstore, widgetstore) =>
    clientstore?.uuid ? `${widgetstore?.widgetToken}:${clientstore.uuid}` : widgetstore.widgetToken
);
const AgentPresenceState = createFeatureSelector<IPresenceOfAgents>('agents_presence');
const selectAllChannelsEntries = createSelector(selectChannels, selectEntities);
export const getAfterMessageOperations = createSelector(
    selectAllChannelsEntries,
    selectWidgetInfo,
    selectDefaultClientParams,
    selectClient,
    getAllAgents,
    getAllTeams,
    AgentPresenceState,
    selectWidgetShowWidgetForm,
    (
        allChannels,
        widgetInfo,
        params,
        client,
        agents,
        teams,
        presence,
        showWidgetForm,
        channel: string
    ): AfterMessagePublishOperation[] => {
        const afterMessageOperations: AfterMessagePublishOperation[] = [];
        if (channel && widgetInfo && allChannels[channel]) {
            // if (widgetInfo.chatbot) {
            //   afterMessageOperations.push(AfterMessagePublishOperation.botConversation);
            // }
            if (widgetInfo.classify && !allChannels[channel].assigned_type && !allChannels[channel].assigned_id) {
                afterMessageOperations.push(AfterMessagePublishOperation.classifyChannel);
            }
            switch (allChannels[channel].assigned_type) {
                case 'agent': {
                    if (!presence[allChannels[channel].assigned_id]) {
                        afterMessageOperations.push(AfterMessagePublishOperation.AddUnreadNotification);
                    }
                    break;
                }
                case 'team': {
                    const team_agents = teams?.find((x) => x.id === allChannels[channel].assigned_id)?.agents;
                    let oneAgentOnline = false;
                    if (team_agents.length) {
                        for (let i = 0; i < team_agents.length; i++) {
                            if (presence[team_agents[i]]) {
                                oneAgentOnline = true;
                                break;
                            }
                        }
                        if (!oneAgentOnline) {
                            afterMessageOperations.push(AfterMessagePublishOperation.AddUnreadNotification);
                        }
                    }
                    break;
                }
            }
            if (params?.length && showWidgetForm) {
                const formValue = {};
                params.forEach((x) => {
                    formValue[x.id] = client[`customer_${x.name}`];
                });
                if (Object.values(formValue).findIndex((x) => !x || x === '' || x === undefined) > -1) {
                    afterMessageOperations.push(AfterMessagePublishOperation.AddFormMessage);
                }
            }
        }
        return afterMessageOperations;
    }
);

export const selectedChannel = createSelector(
    selectAllChannelsEntries,
    selectedChannelStr,
    (s, channel) => s[channel] || null
);
export const selectedChannelAssignee = createSelector(selectedChannel, AgentTeamState, (channel, agentTeam): string => {
    switch (channel?.assigned_type) {
        case 'team': {
            return agentTeam.teams.find((x) => x.id === channel.assigned_id)?.name;
        }
        case 'agent': {
            return agentTeam.agents.find((x) => x.id === channel.assigned_id)?.name;
        }
        default: {
            return 'Conversation';
        }
    }
});

export const selectedChannelAssigneePresence = createSelector(
    selectedChannel,
    AgentPresenceState,
    (channel, agentTeamPresence): SocketPresenceEvent => {
        switch (channel?.assigned_type) {
            case 'team': {
                return null;
            }
            case 'agent': {
                return agentTeamPresence?.entities[channel.assigned_id];
            }
            default: {
                return null;
            }
        }
    }
);
export const selectedChannelId = createSelector(
    selectAllChannelsEntries,
    selectedChannelStr,
    (s, channel) => s[channel]?.id
);
export const getLastMessageTimeToken = createSelector(
    selectedChannelMessages,
    selectedChannel,
    (messages, channel): number => {
        if (messages?.length) {
            if (channel.widget_unread_count) {
                return messages[messages.length - channel.widget_unread_count]?.timetoken;
            }
            return messages[messages.length - 1]?.timetoken;
        }
        return null;
    }
);

export const getOpponentLastReadMessageTimeToken = createSelector(
    selectedChannelMessages,
    selectedChannel,
    (messages, channel): number => {
        messages = messages.filter((message) => message.message.type !== 'form' && message.message.type !== 'feedback');
        if (messages?.length) {
            if (channel?.cc_unread_count) {
                return messages[messages.length - channel.cc_unread_count - 1]?.timetoken;
            }
            return messages[messages.length - 1]?.timetoken;
        }
        return null;
    }
);

export const messagePublishInProcess = createSelector(
    publishMessageInProcess,
    getChannelHistoryInProcess,
    reAuthenticationProcess,
    pubnubInitializingInProgress,
    selectReopenInProcess,
    selectCreateChannelInProcess,
    getPubNubKeysInProcess,
    fileUploadingInProgress,
    (...flags): boolean => {
        return flags?.findIndex((x) => x) > -1;
    }
);

export const getAssigneesOfChannel = (channel: string) =>
    createSelector(
        selectAllChannelsEntries,
        getAllAgents,
        getAllTeams,
        (entities, agents, teams): IChannelAssignees => {
            if (channel && entities[channel]) {
                switch (entities[channel].assigned_type) {
                    case 'team': {
                        const team = teams?.find((x) => x.id === entities[channel].assigned_id);
                        const result = {
                            assigneeName: team?.name,
                            assignees: [],
                        };
                        if (team?.agents?.length) {
                            for (let i = 0; i < team.agents.length; i++) {
                                const agent = agents?.find((x) => x.id === team.agents[i]);
                                if (agent) {
                                    result.assignees.push(agent.name);
                                }
                                if (result.assignees.length === 3) {
                                    break;
                                }
                            }
                        }
                        return result;
                    }
                    case 'agent': {
                        return {
                            assigneeName: agents?.find((x) => x.id === entities[channel].assigned_id)?.name,
                            assignees: [agents?.find((x) => x.id === entities[channel].assigned_id)?.name],
                        };
                    }
                    default: {
                        return {
                            assigneeName: 'Conversation',
                            assignees: ['Anonymous'],
                            assigneeBot: true,
                        };
                    }
                }
            }
            return null;
        }
    );

export const getAllAssignees = createSelector(getAllAgents, (agents): string[] => {
    let result: string[];
    if (agents?.length) {
        if (agents.length >= 3) {
            result = shuffle(agents.map((x) => x.name)).slice(0, 3);
        } else {
            result = shuffle(agents.map((x) => x.name));
        }
    }
    return result;
});

export const getTeamAssignees = (teamId: number) =>
    createSelector(getAllAgents, getAllTeams, (agents, teams): string[] => {
        let result: string[];
        if (agents?.length && teams?.length && teamId) {
            const selectedTeam = teams.find((x) => x.id === teamId);
            if (selectedTeam?.agents?.length >= 3) {
                result = shuffle(
                    agents?.filter((x) => selectedTeam.agents.findIndex((m) => m === x.id) > -1).map((x) => x.name)
                ).slice(0, 3);
            } else {
                result = shuffle(
                    agents?.filter((x) => selectedTeam.agents.findIndex((m) => m === x.id) > -1).map((x) => x.name)
                );
            }
        }
        return result;
    });

export const getSelectedTeamAssignees = createSelector(
    getAllAgents,
    getAllTeams,
    selectedTeam,
    (agents, teams, team): IChannelAssignees => {
        if (agents?.length && teams?.length && team) {
            let assignees: string[];
            const selectedTeam = teams.find((x) => x.id === team.id);
            if (selectedTeam?.agents?.length >= 3) {
                assignees = shuffle(
                    agents?.filter((x) => selectedTeam.agents.findIndex((m) => m === x.id) > -1).map((x) => x.name)
                ).slice(0, 3);
            } else {
                assignees = shuffle(
                    agents?.filter((x) => selectedTeam.agents.findIndex((m) => m === x.id) > -1).map((x) => x.name)
                );
            }
            return {
                assigneeName: team.name,
                assignees,
            };
        }
        return null;
    }
);

// export const initWidgetGlobalInProcess = createSelector(
//     selectInitWidgetInProcess,
//     getPubNubKeysInProcess,
//     selectTotalMessageCountInProcess,
//     selectLastMessageOfChannelsInProcess,
//     selectChannelListInProcess,
//     getAgentTeamInProcess,
//     (...flags) => flags.findIndex((x) => x) > -1
// );
export const initWidgetGlobalInProcess = createSelector(
    selectInitWidgetInProcess,
    getPubNubKeysInProcess,
    // selectTotalMessageCountInProcess,
    // selectLastMessageOfChannelsInProcess,
    // selectChannelListInProcess,
    // getAgentTeamInProcess,
    (...flags) => flags.findIndex((x) => x) > -1
);
