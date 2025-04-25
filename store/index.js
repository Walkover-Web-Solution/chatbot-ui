"use client";
import { persistReducer, persistStore } from "redux-persist";
import createSagaMiddleware from "redux-saga";
import rootReducer from "./combineReducer";
import rootSaga from "./rootSaga.ts";
import createWebStorage from "redux-persist/es/storage/createWebStorage";
import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
// import { getInfoParametersFromUrl } from "../utils/utilities";

export const getInfoParametersFromUrl = () => {
  if (typeof window === "undefined") {
    return {}; // Return an empty object if window is not available (server-side)
  }

  const params = window.location.pathname.slice(1)?.split("/");
  const urlParameters = {};
  if (params[0] === "chatbot") urlParameters.chatbotId = params[1];
  if (params[0] === "chatbot") urlParameters.chatbotId = params[1];
  return urlParameters;
};

const customMiddleware = () => (next) => (action) => {
  action.urlData = getInfoParametersFromUrl();
  return next(action);
};

const createNoopStorage = () => {
  return {
    getItem(_key) {
      return Promise.resolve(null);
    },
    setItem(_key, value) {
      return Promise.resolve(value);
    },
    removeItem(_key) {
      return Promise.resolve();
    },
  };
};

const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

const persistConfig = { key: "root", storage, version: 1 };

const persistedReducer = persistReducer(persistConfig, rootReducer);
const sagaMiddleware = createSagaMiddleware();
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
      .concat(customMiddleware)
      .concat(sagaMiddleware),
});
sagaMiddleware.run(rootSaga);
export const persistor = persistStore(store);