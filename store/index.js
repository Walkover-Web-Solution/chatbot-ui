"use client";
import { createNoopStorage, STORAGE_OPTIONS } from "@/utils/storageUtility";
import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE
} from 'redux-persist/es/constants';
import createSagaMiddleware from "redux-saga";
import { createStateSyncMiddleware, initMessageListener } from 'redux-state-sync';
import rootReducer from "./combineReducer";
import rootSaga from "./rootSaga.ts";

// import { getInfoParametersFromUrl } from "../utils/utilities";

export const getInfoParametersFromUrl = (storeAPI) => {
  if (typeof window === "undefined") {
    return {}; // Return an empty object if window is not available (server-side)
  }

  let urlParameters = {};
  const state = storeAPI.getState();
  const chatSessionId = state.draftData.chatSessionId
  const tabSessionId = state.draftData.tabSessionId
  urlParameters.chatSessionId = chatSessionId
  urlParameters.tabSessionId = `${chatSessionId}_${tabSessionId}`
  urlParameters = { ...urlParameters, ...state.appInfo?.[urlParameters?.tabSessionId] }
  return urlParameters;
};

const customMiddleware = (storeAPI) => (next) => (action) => {

  // IF URL DATA ALREADY PRESENT THIS MEANS THIS ACTION IS TO SYNC CROSS TAB REDUX STORE
  if (!action.urlData) {
    action.urlData = getInfoParametersFromUrl(storeAPI);
  } else {
    console.log('SYNCING CROSS TAB REDUX STORE')
  }
  return next(action);
};


const crossTabSyncConfig = {
  channel: 'crossTabChannel',
  predicate: (action) => {
    const isPersistAction = [PERSIST, REHYDRATE, FLUSH, PAUSE, PURGE, REGISTER].includes(action.type);
    const actionTypeRoot = action.type.split('/')[0];
    const isAppOrDraftAction = actionTypeRoot === 'appInfo' || actionTypeRoot === "draftData" || actionTypeRoot === "Chat";
    const isCountIncreaseAction = action.type === "Hello/setUnReadCount" && !action.payload?.resetCount;
    return !isPersistAction && !isAppOrDraftAction && !isCountIncreaseAction;
  }
};

const storage =
  typeof window !== "undefined"
    ? STORAGE_OPTIONS.local : createNoopStorage();

const rootPersistConfig = {
  key: "root",
  storage: storage,
  version: 1,
  blacklist: ["appInfo", "draftData", "Chat"],
};

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);
const sagaMiddleware = createSagaMiddleware();

export function initializeStore(initialState) {
  const isServer = typeof window === "undefined";

  if (isServer) {
    // Server-side: exclude redux-state-sync middleware
    const store = configureStore({
      reducer: persistedReducer,
      preloadedState: initialState,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false })
          .concat(customMiddleware)
          .concat(sagaMiddleware),
    });
    sagaMiddleware.run(rootSaga);
    return store;
  } else {
    // Client-side: include redux-state-sync middleware
    const store = configureStore({
      reducer: persistedReducer,
      preloadedState: initialState,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false })
          .concat(customMiddleware)
          .concat(sagaMiddleware)
          .concat(createStateSyncMiddleware(crossTabSyncConfig)),
    });
    initMessageListener(store);
    sagaMiddleware.run(rootSaga);
    return store;
  }
}

// Initialize the store after function definition
export const store = initializeStore();
export const persistor = persistStore(store);