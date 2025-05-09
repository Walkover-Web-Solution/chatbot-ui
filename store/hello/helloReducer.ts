import actionType from "@/types/utility.js";
import { SliceCaseReducers, ValidateSliceCaseReducers } from "@reduxjs/toolkit";
import { $HelloReduxType, ChannelListData, HelloData } from "../../types/hello/HelloReduxType";

export const initialState: $HelloReduxType = {
  isHuman: false,
  widgetInfo: {},
  ChannelList: [],
  anonymousClientId: {},
  socketJwt: { jwt: "" },
  isLoading: false,
  mode: [],
  helloConfig: {} as HelloData,
  channelListData: {} as ChannelListData,
  currentChannelId: '',
  currentChatId: '',
  currentTeamId: '',
  greeting: {},
  showWidgetForm: null,
  is_anon: false
};

export const reducers: ValidateSliceCaseReducers<
  $HelloReduxType,
  SliceCaseReducers<$HelloReduxType>
> = {
  getHelloDetailsStart(state) {
    return { ...state, isLoading: true };
  },
  getHelloDetailsSuccess(state, action) {
    const { widgetInfo, ChannelList, Jwt, anonymousClientId, mode, vision } = action.payload;
    state.widgetInfo = widgetInfo;
    state.anonymousClientId = anonymousClientId;
    state.socketJwt = { jwt: Jwt };
    state.channelListData = ChannelList;
    // state.isHuman = ChannelList?.channels?.[0]?.channel || false;
    state.isLoading = false;
    state.Channel = ChannelList?.channels?.[0];
    state.mode = mode;
    state.vision = vision || false;
  },
  setChannel(state, action) {
    state.Channel = action.payload.Channel;
    state.isHuman = true;
  },
  setHuman(state, action: actionType<{ isHuman: boolean }>) {
    state.isHuman = action.payload?.isHuman ?? true;
  },

  setHelloConfig(state, action: actionType<HelloData>) {
    state.helloConfig = action.payload;
    state.showWidgetForm = state.showWidgetForm !== null ? state.showWidgetForm : (action.payload?.show_widget_form ?? true);
  },

  setWidgetInfo(state, action: actionType<HelloData>) {
    state.widgetInfo = action.payload;
  },
  setChannelListData(state, action: actionType<ChannelListData>) {
    state.channelListData = action.payload;
    state.Channel = action.payload?.channels?.[0];
    // state.currentChannelId = action.payload?.channels?.[0]?.channel;
  },
  setJwtToken(state, action: actionType<string>) {
    state.socketJwt = { jwt: action.payload };
  },
  setGreeting(state, action: actionType<any>) {
    state.greeting = action.payload;
  },
  setHelloKeysData(state, action: actionType<Partial<$HelloReduxType>>) {
    const payload = action.payload;
    if (payload && typeof payload === 'object') {
      Object.keys(payload).forEach(key => {
          // This ensures we only set properties that exist in $HelloReduxType
          (state as Record<keyof $HelloReduxType, any>)[key as keyof $HelloReduxType] =
            payload[key as keyof $HelloReduxType];

      });
    }
  },

  changeChannelAssigned(state, action: actionType<{ assigned_type: string, assignee_id: string, channelId?: string }>) {
    const { assigned_type, assignee_id , channelId = state.currentChannelId } = action.payload;
    const channel = state.channelListData?.channels?.find((channel: any) => channel?.channel === channelId);
    if (channel) {
      channel.assigned_type = assigned_type;
      channel.assignee_id = assignee_id;
    }
    // Remove the return statement as we're already modifying the draft state
    // When using Immer, we should either modify the draft OR return a new state, not both
  },

  setUnReadCount(state, action: actionType<{ channelId?: string, resetCount?: boolean }>) {
    const { channelId = state.currentChannelId, resetCount = false } = action.payload;
    
    if (!state.channelListData?.channels?.length) return;
    
    const channelIndex = state.channelListData.channels.findIndex(
      (channel: any) => channel.channel === channelId
    );
    
    if (channelIndex === -1) return;
    
    const channel = state.channelListData.channels[channelIndex];
    
    // Update unread count
    if (resetCount) {
      channel.widget_unread_count = 0;
    } else {
      channel.widget_unread_count = (channel.widget_unread_count || 0) + 1;
    }
    
    // Always move channel to top of the list regardless of reset status
    if (channelIndex > 0) {
      // Remove channel from current position and add to beginning
      const [movedChannel] = state.channelListData.channels.splice(channelIndex, 1);
      state.channelListData.channels.unshift(movedChannel);
    }
  }
};