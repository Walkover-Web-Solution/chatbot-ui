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
      const tabSessionId = action?.urlData?.tabSessionId;
    if(!state[tabSessionId]){
      state[tabSessionId] = {};
    }
      if (!(Object.keys(threadData || {}).length > 0)) {
        if (state[tabSessionId]?.threadId) {
          const selectedThread = allThreadList.find(
            (thread: any) => thread.thread_id === state[tabSessionId]?.threadId
          );

          if (!selectedThread) {
            state[tabSessionId].subThreadId = state[tabSessionId]?.threadId;
          } else if (!state[tabSessionId]?.subThreadId && state[tabSessionId]?.threadId === selectedThread.thread_id) {
            const lastSubThreadId = allThreadList[allThreadList.length - 1]?.sub_thread_id;
            if (lastSubThreadId) {
              state[tabSessionId].subThreadId = lastSubThreadId;
            }
          }
        }
        if (allThreadList?.length === 0) {
          state[tabSessionId].subThreadId = state[tabSessionId]?.threadId;
        }

      } else {
        state[tabSessionId].subThreadId = threadData?.sub_thread_id || "";
      }
    });
  }
});

export const {
  setDataInAppInfoReducer
} = interfaceSlice.actions;

export default interfaceSlice.reducer;
