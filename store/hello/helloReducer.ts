import { SliceCaseReducers, ValidateSliceCaseReducers } from "@reduxjs/toolkit";
import { $HelloReduxType, HelloData } from "../../types/hello/HelloReduxType";
import actionType from "@/types/utility.js";

export const initialState: $HelloReduxType = {
  isHuman: false,
  widgetInfo: {},
  ChannelList: [],
  anonymousClientId: {},
  socketJwt: { jwt: "" },
  isLoading: false,
  mode: [],
  helloConfig: {} as HelloData,
  channelListData: {},
  currentChannelId: '',
  currentChatId: '',
  currentTeamId: ''
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
  },

  setWidgetInfo(state, action: actionType<HelloData>) {
    state.widgetInfo = action.payload;
  }, 
  setChannelListData(state, action: actionType<any>) {
    state.channelListData = action.payload;
    state.Channel = action.payload?.channels?.[0];
    // state.currentChannelId = action.payload?.channels?.[0]?.channel;
  },
  setJwtToken(state, action: actionType<string>) {
    state.socketJwt = { jwt: action.payload };
  },

  setHelloKeysData(state, action: actionType<Partial<$HelloReduxType>>) {
    const payload = action.payload;
    if (payload && typeof payload === 'object') {
      Object.keys(payload).forEach(key => {
        if (key in state) {
          // This ensures we only set properties that exist in $HelloReduxType
          (state as Record<keyof $HelloReduxType, any>)[key as keyof $HelloReduxType] = 
            payload[key as keyof $HelloReduxType];
        }
      });
    }
  }
};