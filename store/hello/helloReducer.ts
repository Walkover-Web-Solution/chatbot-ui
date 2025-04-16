import { SliceCaseReducers, ValidateSliceCaseReducers } from "@reduxjs/toolkit";
import { $HelloReduxType, HelloData } from "../../types/hello/HelloReduxType";
import actionType from "@/types/utility.js";

export const initialState: $HelloReduxType = {
  isHuman: false,
  widgetInfo: {},
  ChannelList: {},
  anonymousClientId: {},
  socketJwt: {},
  isLoading: false,
  mode: [],
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
    state.ChannelList = ChannelList;
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

  setHelloConfig(state, action: actionType<{ helloConfig: HelloData }>) {
    state.helloConfig = action.payload?.helloConfig;
  },
};
