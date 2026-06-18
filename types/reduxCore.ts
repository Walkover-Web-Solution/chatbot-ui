import { $AppInfoReduxType } from "./appInfo/appInfoReduxType";
import { $InterfaceReduxType } from "./interface/InterfaceReduxType";
import { SubscribeDataState } from "../store/subscribeData/subscribeDataSlice";

export interface $ReduxCoreType {
  Interface: $InterfaceReduxType;
  appInfo: $AppInfoReduxType;
  draftData: $DraftDataReducerType;
  subscribeData: SubscribeDataState;
}

export interface $DraftDataReducerType {
  chatSessionId?: string
  tabSessionId?: string
  widgetToken?: string;
  chatbotId?: string;
  isChatbotMinimized?: boolean;
}