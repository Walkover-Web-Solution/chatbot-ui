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

export const getInfoParametersFromUrl = () => {
  if (typeof window === "undefined") {
    return {}; // Return an empty object if window is not available (server-side)
  }

  let urlParameters = {};
  const chatSessionId = store.getState().draftData.chatSessionId
  const tabSessionId = store.getState().draftData.tabSessionId
  urlParameters.chatSessionId = chatSessionId
  urlParameters.tabSessionId = `${chatSessionId}_${tabSessionId}`
  urlParameters = { ...urlParameters, ...store.getState().appInfo?.[urlParameters?.tabSessionId] }
  return urlParameters;
};

const customMiddleware = () => (next) => (action) => {

  // IF URL DATA ALREADY PRESENT THIS MEANS THIS ACTION IS TO SYNC CROSS TAB REDUX STORE
  if (!action.urlData) {
    action.urlData = getInfoParametersFromUrl();
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
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
      .concat(customMiddleware)
      .concat(sagaMiddleware)
      .concat(createStateSyncMiddleware(crossTabSyncConfig)),
});
initMessageListener(store);
sagaMiddleware.run(rootSaga);
export const persistor = persistStore(store);