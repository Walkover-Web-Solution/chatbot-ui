"use client";
import { STORAGE_OPTIONS } from "@/utils/storageUtility";
import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import createSagaMiddleware from "redux-saga";
import rootReducer from "./combineReducer";
import rootSaga from "./rootSaga.ts";
import { createStateSyncMiddleware, initMessageListener } from 'redux-state-sync';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE
} from 'redux-persist/es/constants';

// import { getInfoParametersFromUrl } from "../utils/utilities";

export const getInfoParametersFromUrl = () => {
  if (typeof window === "undefined") {
    return {}; // Return an empty object if window is not available (server-side)
  }

  const params = window.location.pathname.slice(1)?.split("/");
  const urlParameters = {};
  if (params[0] === "chatbot") {
    const chatbotId = params[1];
    if (chatbotId === 'hello') {
      urlParameters.chatSessionId = store.getState().tabInfo.widgetToken
    } else {
      urlParameters.chatSessionId = store.getState().tabInfo.chatbotId
    }
  }
  urlParameters.tabSessionId = `${urlParameters.chatSessionId}_${store.getState().tabInfo.tabSessionId}`

  return urlParameters;
};

const customMiddleware = () => (next) => (action) => {
  
  // IF URL DATA ALREADY PRESENT THIS MEANS THIS ACTION IS TO SYNC CROSS TAB REDUX STORE
  if(!action.urlData){
    action.urlData = getInfoParametersFromUrl();
  }else{
    console.log('SYNCING CROSS TAB REDUX STORE')
  }
  return next(action);
};


const crossTabSyncConfig = {
  predicate: (action) => {
    const isPersistAction = [PERSIST, REHYDRATE, FLUSH, PAUSE, PURGE, REGISTER].includes(action.type);
    const actionTypeRoot = action.type.split('/')[0];
    const isAppOrTabInfoAction = actionTypeRoot === 'appInfo' || actionTypeRoot === 'tabInfo';
    return !isPersistAction && !isAppOrTabInfoAction;
  }
};

const rootPersistConfig = {
  key: "root",
  storage: STORAGE_OPTIONS.local,
  version: 1,
  blacklist: ["appInfo", "tabInfo"],
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