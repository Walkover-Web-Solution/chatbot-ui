import { createSlice } from "@reduxjs/toolkit";
import { initialState, reducers } from "./helloReducer";

const interfaceSlice = createSlice({
  name: "Hello",
  initialState,
  reducers,
});

export const {
  setChannel,
  getHelloDetailsStart,
  getHelloDetailsSuccess,
  setIsVision,
  setHelloConfig,
  setWidgetInfo,
  setChannelListData,
  setJwtToken,
  setHelloKeysData,
  changeChannelAssigned,
  setGreeting,
  setUnReadCount,
  setAgentTeams,
  setHelloClientInfo
} = interfaceSlice.actions;
export default interfaceSlice.reducer;
