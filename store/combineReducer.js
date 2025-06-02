'use client';
import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";

import InterfaceReducer from "./interface/interfaceSlice";
import appInfoReducer from "./appInfo/appInfoSlice";
import helloReducer from "./hello/helloSlice";
import tabInfoReducer from "./tabInfo/tabInfoSlice";
import { createNoopStorage, STORAGE_OPTIONS } from "@/utils/storageUtility";

const storage =
  typeof window !== "undefined"
    ? STORAGE_OPTIONS.session : createNoopStorage();

const appInfoPersistConfig = {
  key: "appInfo",
  storage: storage,
  version: 1,
};

const tabInfoPersistConfig = {
  key: "tabInfo",
  storage: storage,
  version: 1,
};

const rootReducer = combineReducers({
  Interface: InterfaceReducer,
  Hello: helloReducer,
  appInfo: persistReducer(appInfoPersistConfig, appInfoReducer),
  tabInfo: persistReducer(tabInfoPersistConfig, tabInfoReducer),
});

export default rootReducer;