/* eslint-disable */
import { SliceCaseReducers, ValidateSliceCaseReducers } from "@reduxjs/toolkit";
import {
  $InterfaceReduxType,
  HeaderButtonType,
  ModalConfigType,
  SelectedAiServicesType
} from "../../types/interface/InterfaceReduxType.ts";
import actionType from "../../types/utility.ts";

const sampleInterfaceData: any = {
  interfaceContext: {},
  isLoading: false,
  _id: "",
  title: "",
  org_id: "",
  project_id: "",
  created_by: "",
  updated_by: "",
  components: { root: {} },
  coordinates: { root: {} },
  config: {},
  actions: { root: {} },
  frontendActions: { root: {} },
  createdAt: "",
  updatedAt: "",
  threadId: "",
  bridgeName: "root",
};

export const initialState: $InterfaceReduxType = {
  isLoading: false,
  interfaceData: {},
  interfaceContext: {},
  currentSelectedComponent: {},
};

export const reducers: ValidateSliceCaseReducers<
  $InterfaceReduxType,
  SliceCaseReducers<$InterfaceReduxType>
> = {

  addInterfaceContext(
    state,
    action: actionType<{
      gridId: string;
      msgId: string;
      componentId: string;
      value: string;
    }>
  ) {
    const { chatSessionId } = action.urlData;
    if (!chatSessionId) return;
    
    const { msgId = "", gridId } = action.payload;
    const newGridId = msgId?.length > 0 ? `${gridId}_${msgId}` : gridId;
    if(!state[chatSessionId]){
      state[chatSessionId] = {...initialState};
    }
    state[chatSessionId].interfaceContext = {
      ...state[chatSessionId]?.interfaceContext,
      context: {
        ...state[chatSessionId]?.interfaceContext?.context,
        [newGridId]: {
          ...state[chatSessionId]?.interfaceContext?.context?.[newGridId],
          [action.payload.componentId]: action?.payload?.value || "",
        },
      },
    };
  },

  addDefaultContext(state, action: actionType<any>) {
    const { chatSessionId , bridgeName : currentBridgeName } = action.urlData || {};
    if (!chatSessionId) return;

    const bridgeName = action.payload?.bridgeName || currentBridgeName || "root";
    const variables = action.payload?.variables;

    if(!state[chatSessionId]){
      state[chatSessionId] = {...initialState};
    }
    if(!state[chatSessionId]?.interfaceContext?.[bridgeName]){
      state[chatSessionId].interfaceContext[bridgeName] = {
        interfaceData: {},
        threadList: {},
      };
    }
    state[chatSessionId].interfaceContext[bridgeName].variables = {
      ...state[chatSessionId]?.interfaceContext?.[bridgeName]?.variables,
      ...variables,
    };
  },

  setThreads(state, action:actionType<any>) {
    const { chatSessionId , bridgeName : currentBridgeName , threadId : currentThreadId } = action?.urlData || {};
    if (!chatSessionId) return;
    if(!state[chatSessionId]){
      state[chatSessionId] = {...initialState};
    }
    const bridgeName = action.payload?.bridgeName || currentBridgeName || "root";
    const threadId = action.payload?.threadId || currentThreadId;
    const threadData = action.payload?.newThreadData || {};
    const allThreadList = action.payload?.threadList || [];

    const updatedInterfaceContext = { ...(state[chatSessionId]?.interfaceContext || {}) };

    if (!updatedInterfaceContext[bridgeName]) {
      updatedInterfaceContext[bridgeName] = {
        interfaceData: {},
        threadList: {},
      };
    }

    if (!updatedInterfaceContext[bridgeName].threadList) {
      updatedInterfaceContext[bridgeName].threadList = {};
    }

    if (!updatedInterfaceContext[bridgeName]?.threadList?.[threadId]) {
      updatedInterfaceContext[bridgeName].threadList[threadId] = [];
    }

    if (!(Object.keys(threadData || {}).length > 0)) {
      updatedInterfaceContext[bridgeName].threadList[threadId] = allThreadList;
      if (allThreadList?.length === 0) {
        updatedInterfaceContext[bridgeName].threadList[threadId].push({
          thread_id: threadId,
          sub_thread_id: threadId,
          display_name: threadId,
        });
      }
    }
    else if(updatedInterfaceContext[bridgeName].threadList[threadId][0]?.sub_thread_id === threadData?.sub_thread_id) {
      updatedInterfaceContext[bridgeName].threadList[threadId][0] = {
        ...threadData
      };
    }
    else {
      updatedInterfaceContext[bridgeName].threadList[threadId].unshift(threadData);
    }

    state[chatSessionId].interfaceContext = updatedInterfaceContext;
  },

  setHeaderActionButtons(state, action: actionType<HeaderButtonType>) {
    const { chatSessionId } = action?.urlData || {};
    if (!chatSessionId) return;
    if(!state[chatSessionId]){
      state[chatSessionId] = {...initialState};
    }
    state[chatSessionId].headerButtons = action.payload;
  },

  setEventsSubsribedByParent(state, action: actionType<string[]>) {
    const { chatSessionId } = action?.urlData || {};
    if (!chatSessionId) return;
    if(!state[chatSessionId]){
      state[chatSessionId] = {...initialState};
    }
    state[chatSessionId].eventsSubscribedByParent = action.payload;
  },

  setAvailableModelsToSwitch(state, action: actionType<any>) {
    const { chatSessionId } = action?.urlData || {};
    if (!chatSessionId) return;
    if(!state[chatSessionId]){
      state[chatSessionId] = {...initialState};
    }
    state[chatSessionId].availableAiServicesToSwitch = action.payload;
  },

  setModalConfig(state, action: actionType<ModalConfigType>) {
    const { chatSessionId } = action?.urlData || {};
    if (!chatSessionId) return;
    if(!state[chatSessionId]){
      state[chatSessionId] = {...initialState};
    }
    state[chatSessionId].modalConfig = action.payload;
  },

  setSelectedAIServiceAndModal(state, action: actionType<SelectedAiServicesType>) {
    const { chatSessionId } = action?.urlData || {};
    if (!chatSessionId) return;
    if(!state[chatSessionId]){
      state[chatSessionId] = {...initialState};
    }
    state[chatSessionId].selectedAiServiceAndModal = action.payload;
  },

  setDataInInterfaceRedux(state, action: actionType<any>) {   
    const { chatSessionId } = action?.urlData || {};
    if (!chatSessionId) return;
    if(!state[chatSessionId]){
      state[chatSessionId] = {...initialState};
    }
    return { ...state, [chatSessionId]: { ...state[chatSessionId], ...action.payload } };
  }
};
