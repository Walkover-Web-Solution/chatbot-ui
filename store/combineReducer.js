'use client';
import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";

import { createNoopStorage, STORAGE_OPTIONS } from "@/utils/storageUtility";
import appInfoReducer from "./appInfo/appInfoSlice";
import chatReducer from "./chat/chatSlice";
import componentOverridesReducer from "./componentOverrides/componentOverridesSlice";
import draftDataReducer from "./draftData/draftDataSlice";
import InterfaceReducer from "./interface/interfaceSlice";
import subscribeDataReducer from "./subscribeData/subscribeDataSlice";

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
  Chat: chatReducer,
  draftData: draftDataReducer,
  appInfo: persistReducer(appInfoPersistConfig, appInfoReducer),
  componentOverrides: componentOverridesReducer,
  subscribeData: subscribeDataReducer,
});

export default rootReducer;