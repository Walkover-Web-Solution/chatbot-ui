import { createSlice } from "@reduxjs/toolkit";
import { initialState, reducers } from "./appInfoReducer";

const interfaceSlice = createSlice({
  name: "appInfo",
  initialState:initialState,
  reducers:reducers,
});

export const {
    setDataInAppInfoReducer
} = interfaceSlice.actions;

export default interfaceSlice.reducer;
