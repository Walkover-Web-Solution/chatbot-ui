import { $AppInfoReduxType } from "./appInfo/appInfoReduxType";
import { $HelloReduxType } from "./hello/HelloReduxType";
import { $InterfaceReduxType } from "./interface/InterfaceReduxType";

export interface $ReduxCoreType {
  Hello: $HelloReduxType;
  Interface: $InterfaceReduxType;
  appInfo: $AppInfoReduxType,
  draftData: $DraftDataReducerType
}

export interface $DraftDataReducerType {
  chatSessionId?: string
  tabSessionId?: string
  widgetToken?: string;
  chatbotId?: string;
  hello:{
    variables:Record<string,any>
  }
}