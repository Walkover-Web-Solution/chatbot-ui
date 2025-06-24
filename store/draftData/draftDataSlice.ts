import { $DraftDataReducerType } from "@/types/reduxCore";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * Draft data slice for managing chat session ID
 */
const draftDataSlice = createSlice({
  name: "draftData",
  initialState: {
    chatSessionId: "" as string,
    tabSessionId: "" as string,
    widgetToken: "" as string,
    chatbotId: "" as string,
  } as $DraftDataReducerType,
  reducers: {
    /**
     * Sets the chat session ID in the state
     * @param state - Current state
     * @param action - Action containing the chat session ID
     */
    setDataInDraftReducer: (state, action: PayloadAction<$DraftDataReducerType>) => {
      return {
        ...state,
        ...action.payload 
      }
    },
    resetDraftDataReducer: () => {
      return {
        chatSessionId: "",
        tabSessionId: "",
        widgetToken: "",
        chatbotId: ""
      }
    }
  },
});

export const {
  setDataInDraftReducer,
  resetDraftDataReducer
} = draftDataSlice.actions;

export default draftDataSlice.reducer;

