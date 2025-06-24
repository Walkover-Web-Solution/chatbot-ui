'use client';
import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";

import { createNoopStorage, STORAGE_OPTIONS } from "@/utils/storageUtility";
import appInfoReducer from "./appInfo/appInfoSlice";
import draftDataReducer from "./draftData/draftDataSlice";
import helloReducer from "./hello/helloSlice";
import InterfaceReducer from "./interface/interfaceSlice";

const storage =
  typeof window !== "undefined"
    ? STORAGE_OPTIONS.session : createNoopStorage();

const appInfoPersistConfig = {
  key: "appInfo",
  storage: storage,
  version: 1,
};

const rootReducer = combineReducers({
  Interface: InterfaceReducer,
  Hello: helloReducer,
  appInfo: persistReducer(appInfoPersistConfig, appInfoReducer),
  draftData: draftDataReducer
});

export default rootReducer;