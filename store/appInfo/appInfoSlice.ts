import { createSlice } from "@reduxjs/toolkit";
import { initialState, reducers } from "./appInfoReducer";
import { setThreads } from "../interface/interfaceSlice";

const interfaceSlice = createSlice({
  name: "appInfo",
  initialState: initialState,
  reducers: reducers,
  extraReducers: (builder) => {
    builder.addCase(setThreads, (state, action) => {
      const threadData = action.payload?.newThreadData || {};
      const allThreadList = action.payload?.threadList || [];

      if (!(Object.keys(threadData || {}).length > 0)) {
        if (state.threadId) {
          const selectedThread = allThreadList.find(
            (thread: any) => thread.thread_id === state.threadId
          );

          if (!selectedThread) {
            state.subThreadId = state.threadId;
          } else if (!state.subThreadId && state.threadId === selectedThread.thread_id) {
            const lastSubThreadId = allThreadList[allThreadList.length - 1]?.sub_thread_id;
            if (lastSubThreadId) {
              state.subThreadId = lastSubThreadId;
            }
          }
        }
        if (allThreadList?.length === 0) {
          state.subThreadId = state.threadId;
        }

      } else {
        state.subThreadId = threadData?.sub_thread_id || "";
      }
    });
  }
});

export const {
  setDataInAppInfoReducer
} = interfaceSlice.actions;

export default interfaceSlice.reducer;
