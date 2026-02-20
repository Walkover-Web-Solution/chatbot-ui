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
    const { chatSessionId, tabSessionId } = action.urlData;
    if (!chatSessionId || !tabSessionId) return;
    
    const sessionKey = `${chatSessionId}_${tabSessionId}`;
    const { msgId = "", gridId } = action.payload;
    const newGridId = msgId?.length > 0 ? `${gridId}_${msgId}` : gridId;
    if(!state[sessionKey]){
      state[sessionKey] = {...initialState};
    }
    state[sessionKey].interfaceContext = {
      ...state[sessionKey]?.interfaceContext,
      context: {
        ...state[sessionKey]?.interfaceContext?.context,
        [newGridId]: {
          ...state[sessionKey]?.interfaceContext?.context?.[newGridId],
          [action.payload.componentId]: action?.payload?.value || "",
        },
      },
    };
  },

  addDefaultContext(state, action: actionType<any>) {
    const { chatSessionId ,tabSessionId:urlTabSessionId, bridgeName : currentBridgeName } = action.urlData || {};
    if (!chatSessionId) return;
     const key = action.payload?.tabSessionId || urlTabSessionId || chatSessionId;

    const sessionKey = `${chatSessionId}_${tabSessionId}`;
    const bridgeName = action.payload?.bridgeName || currentBridgeName || "root";
    const variables = action.payload?.variables;

    if(!state[key]){
      state[key] = {...initialState};
    }
    if(!state[key]?.interfaceContext?.[bridgeName]){
      state[key].interfaceContext[bridgeName] = {
        interfaceData: {},
        threadList: {},
      };
    }
    state[key].interfaceContext[bridgeName].variables = {
      ...variables,
    };
  },

  setThreads(state, action:actionType<any>) {
    const { chatSessionId, tabSessionId, bridgeName : currentBridgeName , threadId : currentThreadId } = action?.urlData || {};
    if (!chatSessionId || !tabSessionId) return;
    
    const sessionKey = `${chatSessionId}_${tabSessionId}`;
    if(!state[sessionKey]){
      state[sessionKey] = {...initialState};
    }
    const bridgeName = action.payload?.bridgeName || currentBridgeName || "root";
    const threadId = action.payload?.threadId || currentThreadId;
    const threadData = action.payload?.newThreadData || {};
    const allThreadList = action.payload?.threadList || [];

    const updatedInterfaceContext = { ...(state[sessionKey]?.interfaceContext || {}) };

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

    state[sessionKey].interfaceContext = updatedInterfaceContext;
  },

  setHeaderActionButtons(state, action: actionType<HeaderButtonType>) {
    const { chatSessionId, tabSessionId } = action?.urlData || {};
    if (!chatSessionId || !tabSessionId) return;
    
    const sessionKey = `${chatSessionId}_${tabSessionId}`;
    if(!state[sessionKey]){
      state[sessionKey] = {...initialState};
    }
    state[sessionKey].headerButtons = action.payload;
  },

  setEventsSubsribedByParent(state, action: actionType<string[]>) {
    const { chatSessionId, tabSessionId } = action?.urlData || {};
    if (!chatSessionId || !tabSessionId) return;
    
    const sessionKey = `${chatSessionId}_${tabSessionId}`;
    if(!state[sessionKey]){
      state[sessionKey] = {...initialState};
    }
    state[sessionKey].eventsSubscribedByParent = action.payload;
  },

  setAvailableModelsToSwitch(state, action: actionType<any>) {
    const { chatSessionId, tabSessionId } = action?.urlData || {};
    if (!chatSessionId || !tabSessionId) return;
    
    const sessionKey = `${chatSessionId}_${tabSessionId}`;
    if(!state[sessionKey]){
      state[sessionKey] = {...initialState};
    }
    state[sessionKey].availableAiServicesToSwitch = action.payload;
  },

  setModalConfig(state, action: actionType<ModalConfigType>) {
    const { chatSessionId, tabSessionId } = action?.urlData || {};
    if (!chatSessionId || !tabSessionId) return;
    
    const sessionKey = `${chatSessionId}_${tabSessionId}`;
    if(!state[sessionKey]){
      state[sessionKey] = {...initialState};
    }
    state[sessionKey].modalConfig = action.payload;
  },

  setSelectedAIServiceAndModal(state, action: actionType<SelectedAiServicesType>) {
    const { chatSessionId, tabSessionId } = action?.urlData || {};
    if (!chatSessionId || !tabSessionId) return;
    
    const sessionKey = `${chatSessionId}_${tabSessionId}`;
    if(!state[sessionKey]){
      state[sessionKey] = {...initialState};
    }
    state[sessionKey].selectedAiServiceAndModal = action.payload;
  },

  setDataInInterfaceRedux(state, action: actionType<any>) {   
    const { chatSessionId, tabSessionId } = action?.urlData || {};
    if (!chatSessionId || !tabSessionId) return;
    
    const sessionKey = `${chatSessionId}_${tabSessionId}`;
    if(!state[sessionKey]){
      state[sessionKey] = {...initialState};
    }
    return { ...state, [sessionKey]: { ...state[sessionKey], ...action.payload } };
  }
};
