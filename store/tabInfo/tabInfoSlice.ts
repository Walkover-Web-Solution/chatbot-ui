import { createSlice } from "@reduxjs/toolkit";
import { initialState, reducers } from "./tabInfoReducer.ts";

const interfaceSlice = createSlice({
  name: "tabInfo",
  initialState,
  reducers,
});

export const {
  setDataInTabInfo
} = interfaceSlice.actions;
export default interfaceSlice.reducer;
