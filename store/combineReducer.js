import { combineReducers } from "redux";
import InterfaceReducer from "./interface/interfaceSlice.ts";
import appInfoReducer from "./appInfo/appInfoSlice.ts";
import helloReducer from "./hello/helloSlice"

const rootReducer = combineReducers({
  Interface: InterfaceReducer,
  Hello: helloReducer,
  appInfo: appInfoReducer
});

export default rootReducer;
