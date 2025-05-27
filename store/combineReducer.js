import { combineReducers } from "redux";
import InterfaceReducer from "./interface/interfaceSlice.ts";
import appInfoReducer from "./appInfo/appInfoSlice.ts";
import helloReducer from "./hello/helloSlice"
import tabInfoReducer from "./tabInfo/tabInfoSlice.ts";

const rootReducer = combineReducers({
  Interface: InterfaceReducer,
  Hello: helloReducer,
  appInfo: appInfoReducer,
  tabInfo: tabInfoReducer
});

export default rootReducer;
