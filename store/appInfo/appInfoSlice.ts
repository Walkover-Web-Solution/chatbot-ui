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
      const chatSessionId = action.urlData.chatSessionId
      if (!(Object.keys(threadData || {}).length > 0)) {
        if (state[chatSessionId]?.threadId) {
          const selectedThread = allThreadList.find(
            (thread: any) => thread.thread_id === state[chatSessionId]?.threadId
          );

          if (!selectedThread) {
            state[chatSessionId].subThreadId = state[chatSessionId].threadId;
          } else if (!state[chatSessionId]?.subThreadId && state[chatSessionId]?.threadId === selectedThread.thread_id) {
            const lastSubThreadId = allThreadList[allThreadList.length - 1]?.sub_thread_id;
            if (lastSubThreadId) {
              state[chatSessionId].subThreadId = lastSubThreadId;
            }
          }
        }
        if (allThreadList?.length === 0) {
          state[chatSessionId].subThreadId = state[chatSessionId].threadId;
        }

      } else {
        state[chatSessionId].subThreadId = threadData?.sub_thread_id || "";
      }
    });
  }
});

export const {
  setDataInAppInfoReducer
} = interfaceSlice.actions;

export default interfaceSlice.reducer;
