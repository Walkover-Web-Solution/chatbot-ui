import actionType from "@/types/utility.js";
import { SliceCaseReducers, ValidateSliceCaseReducers } from "@reduxjs/toolkit";
import { $HelloReduxType, ChannelListData, HelloData } from "../../types/hello/HelloReduxType";

export const initialState: $HelloReduxType = {};

export const reducers: ValidateSliceCaseReducers<
  $HelloReduxType,
  SliceCaseReducers<$HelloReduxType>
> = {
  getHelloDetailsStart(state, action) {
    const chatSessionId = action.urlData?.chatSessionId
    if (chatSessionId) {
      return {
        ...state, [chatSessionId]: {
          ...state[chatSessionId],
          isLoading: true
        }
      };
    }
  },
  getHelloDetailsSuccess(state, action: actionType<any>) {
    const chatSessionId = action?.urlData?.chatSessionId;
    if (!chatSessionId) return;

    const { widgetInfo, ChannelList, Jwt, anonymousClientId, mode, vision } = action.payload;

    state[chatSessionId] = {
      ...state[chatSessionId],
      widgetInfo,
      anonymousClientId,
      socketJwt: { jwt: Jwt },
      channelListData: ChannelList,
      isLoading: false,
      Channel: ChannelList?.channels?.[0],
      mode,
      vision: vision || false
    };
  },
  setChannel(state, action) {
    const chatSessionId = action.urlData?.chatSessionId
    if (chatSessionId) {
      state[chatSessionId] = {
        ...state[chatSessionId],
        Channel: action.payload.Channel
      };
    }
  },

  setHelloConfig(state, action: actionType<HelloData>) {
    const chatSessionId = action.urlData?.chatSessionId
    if (chatSessionId) {
      state[chatSessionId] = {
        ...state[chatSessionId],
        helloConfig: action.payload
      };
    }
  },

  setWidgetInfo(state, action: actionType<HelloData>) {
    const chatSessionId = action.urlData?.chatSessionId
    if (chatSessionId) {
      state[chatSessionId] = {
        ...state[chatSessionId],
        widgetInfo: { ...state[chatSessionId]?.widgetInfo, ...action.payload }
      };
    }
  },

  setChannelListData(state, action: actionType<ChannelListData>) {
    const chatSessionId = action.urlData?.chatSessionId
    if (chatSessionId) {
      state[chatSessionId] = {
        ...state[chatSessionId],
        channelListData: action.payload,
        Channel: action.payload?.channels?.[0]
      };
    }
  },

  setJwtToken(state, action: actionType<string>) {
    const chatSessionId = action.urlData?.chatSessionId
    if (chatSessionId) {
      state[chatSessionId] = {
        ...state[chatSessionId],
        socketJwt: { jwt: action.payload }
      };
    }
  },

  setGreeting(state, action: actionType<any>) {
    const chatSessionId = action.urlData?.chatSessionId
    if (chatSessionId) {
      state[chatSessionId] = {
        ...state[chatSessionId],
        greeting: action.payload
      };
    }
  },

  setHelloKeysData(state, action: actionType<Partial<$HelloReduxType>>) {
    const chatSessionId = action.urlData?.chatSessionId
    if (chatSessionId && action.payload && typeof action.payload === 'object') {
      state[chatSessionId] = {
        ...state[chatSessionId],
        ...action.payload
      };
    }
  },

  setHelloClientInfo(state, action: actionType<Partial<$HelloReduxType>>) {
    const chatSessionId = action.urlData?.chatSessionId;
    const existingClientInfo = state[chatSessionId]?.clientInfo || {};
    if (chatSessionId && action.payload && typeof action.payload === 'object') {
      state[chatSessionId] = {
        ...state[chatSessionId],
        clientInfo: {
          ...existingClientInfo,
          ...(action.payload?.clientInfo || {})
        }
      };
    }
  },

  changeChannelAssigned(state, action: actionType<{ assigned_type: string, assignee_id: string, channelId?: string }>) {
    const chatSessionId = action.urlData?.chatSessionId
    if (chatSessionId) {
      const { assigned_type, assignee_id, channelId = state[chatSessionId]?.currentChannelId } = action.payload;
      const channel = state[chatSessionId]?.channelListData?.channels?.find(
        (channel: any) => channel?.channel === channelId
      );

      if (channel) {
        channel.assigned_type = assigned_type;
        channel.assigned_id = assignee_id;
        channel.assigned_to = assigned_type === 'team'
          ? { name: state[chatSessionId]?.agent_teams?.teams?.[assignee_id] }
          : { name: state[chatSessionId]?.agent_teams?.agents?.[assignee_id] };
      }
    }
  },

  setUnReadCount(state, action: actionType<{ channelId?: string, resetCount?: boolean }>) {
    const chatSessionId = action.urlData?.chatSessionId
    if (chatSessionId) {
      const { channelId = state[chatSessionId]?.currentChannelId, resetCount = false } = action.payload;

      if (!state[chatSessionId]?.channelListData?.channels?.length) return;

      const channelIndex = state[chatSessionId].channelListData.channels.findIndex(
        (channel: any) => channel.channel === channelId
      );

      if (channelIndex === -1) return;

      const channel = state[chatSessionId].channelListData.channels[channelIndex];

      if (resetCount) {
        channel.widget_unread_count = 0;
      } else {
        channel.widget_unread_count = (channel.widget_unread_count || 0) + 1;
      }

      if (channelIndex > 0) {
        const [movedChannel] = state[chatSessionId].channelListData.channels.splice(channelIndex, 1);
        state[chatSessionId]?.channelListData.channels.unshift(movedChannel);
      }
    }
  },

  setAgentTeams(state, action: actionType<any>) {
    const chatSessionId = action.urlData?.chatSessionId
    if (chatSessionId) {
      const { agents = [], teams = [] } = action.payload;

      const agentsMap = agents.reduce((map: Record<string, any>, agent: any) => {
        if (agent && agent.id) {
          map[agent.id] = agent?.name;
        }
        return map;
      }, {});

      const teamsMap = teams.reduce((map: Record<string, any>, team: any) => {
        if (team && team.id) {
          map[team.id] = team?.name;
        }
        return map;
      }, {});

      state[chatSessionId] = {
        ...state[chatSessionId],
        agent_teams: {
          agents: agentsMap,
          teams: teamsMap
        }
      };
    }
  }
};