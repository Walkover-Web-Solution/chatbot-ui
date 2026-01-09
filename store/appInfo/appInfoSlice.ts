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

      // Initialize session state if not exists
      if (!state[tabSessionId]) {
        state[tabSessionId] = {};
      }

      const sessionState = state[tabSessionId];
      const hasNewThreadData = Object.keys(threadData).length > 0;

      if (hasNewThreadData) {
        // New thread data provided, use it directly
        sessionState.subThreadId = threadData.sub_thread_id || "";
        return;
      }

      // Handle empty thread list case
      if (allThreadList.length === 0) {
        sessionState.subThreadId = sessionState.threadId || "";
        return;
      }

      const currentSubThreadId = sessionState.subThreadId;
      const currentThreadId = sessionState.threadId;
      const firstSubThreadId = allThreadList[0]?.sub_thread_id;

      // Check if current subThreadId exists in the thread list
      if (currentSubThreadId) {
        const subThreadExists = allThreadList.find(
          (thread: any) => thread.sub_thread_id === currentSubThreadId
        );

        if (subThreadExists) {
          // Current subThreadId exists in list, keep it
          return;
        }
      }

      // Handle thread selection when subThreadId doesn't exist or is empty
      if (currentThreadId) {

        // Check if threadId exists as a main thread
        const mainThread = allThreadList.find(
          (thread: any) => thread.thread_id === currentThreadId
        );

        if (mainThread) {
          // ThreadId exists in list, use first available subThreadId
          sessionState.subThreadId = firstSubThreadId || "";
        } else {
          // ThreadId doesn't exist in list, keep it as subThreadId
          sessionState.subThreadId = currentThreadId;
        }
      } else {
        // No current threadId, use first available subThreadId
        sessionState.subThreadId = firstSubThreadId || "";
      }
    });
  }
});

export const {
  setDataInAppInfoReducer,
  resetAppInfoReducer
} = interfaceSlice.actions;

export default interfaceSlice.reducer;
