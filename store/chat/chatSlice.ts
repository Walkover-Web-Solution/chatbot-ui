import { createSlice } from "@reduxjs/toolkit";
import { chatReducerV2, initialChatState } from "./chatReducerV2";

const chatSlice = createSlice({
    name: "Chat",
    initialState: initialChatState,
    reducers: chatReducerV2
});

export const {
    updateLastAssistantMessage,
    removeMessages,
    setLoading,
    setChatsLoading,
    setOptions,
    setImages,
    clearImages,
    setThreadId,
    setSubThreadId,
    setBridgeName,
    setHelloId,
    setBridgeVersionId,
    setHeaderButtons,
    setStarterQuestions,
    setCurrentPage,
    setHasMoreMessages,
    setIsFetching,
    setNewMessage,
    setOpen,
    setToggleDrawer,
    setTyping,
    setMessageTimeout,
    setData,
    updateSingleMessage,
    setOpenHelloForm,
    setInitialMessages,
    setPaginateMessages,
    setHelloEventMessage,
    setError,
    resetState
} = chatSlice.actions;

export default chatSlice.reducer;