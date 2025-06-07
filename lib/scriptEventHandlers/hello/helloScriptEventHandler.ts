// src/eventHandlers/helloDataHandler.ts

import { CBManger } from "@/hooks/coBrowser/CBManger";
import { registerEventHandler } from "../scriptEventRegistry";
import { Dispatch, UnknownAction } from "redux";
import isPlainObject from "lodash.isplainobject";
import { addDomainToHello } from "@/config/helloApi";
import { saveClientDetails } from "@/config/helloApi";
import { GetSessionStorageData, SetSessionStorage } from "@/utils/ChatbotUtility";
import { getLocalStorage, setLocalStorage } from "@/utils/utilities";
import { setDataInAppInfoReducer } from "@/store/appInfo/appInfoSlice";
import { setHelloConfig, setHelloKeysData } from "@/store/hello/helloSlice";
import { setDataInInterfaceRedux } from "@/store/interface/interfaceSlice";
import { setDataInTabInfo } from "@/store/tabInfo/tabInfoSlice";

const helloToChatbotPropsMap: Record<string, string> = {
  // show_close_button: 'hideCloseButton',
  hideFullScreenButton: 'hideFullScreenButton'
}

registerEventHandler('ADD_COBROWSE_SCRIPT', (event: MessageEvent) => {
  CBManger.injectScript(event?.data?.data?.origin)
})

registerEventHandler('ADD_USER_EVENT_SEGMENTO', (event: MessageEvent) => {
  if (event?.data?.data && isPlainObject(event?.data?.data)) {
    addDomainToHello({ userEvent: event?.data?.data })
    return
  }
})

registerEventHandler('UPDATE_USER_DATA_SEGMENTO', (event: MessageEvent) => {
  if (event?.data?.data && isPlainObject(event?.data?.data)) {
    saveClientDetails(event?.data?.data)
    return
  }
})

registerEventHandler('parent-route-changed', (event: MessageEvent) => {
  if (event?.data?.data?.websiteUrl) {
    addDomainToHello({ domain: event?.data?.data?.websiteUrl });
    return;
  }
})

registerEventHandler('helloData', (event: MessageEvent, dispatch: Dispatch<UnknownAction>, handleThemeChange: (theme: string) => void) => {
  const {
    widgetToken,
    unique_id,
    mail,
    number,
    user_jwt_token,
    name,
    sdkConfig,
    ...restProps
  } = event.data.data;

  if (sdkConfig?.customTheme) {
    handleThemeChange(sdkConfig?.customTheme)
  }

  const fullWidgetToken = unique_id ? `${widgetToken}_${unique_id}` : `${widgetToken}`;
  const prevWidgetId = GetSessionStorageData('widgetToken');
  const prevUser = JSON.parse(getLocalStorage('userData') || '{}');
  SetSessionStorage('widgetToken', fullWidgetToken)
  const hasUserIdentity = Boolean(unique_id || mail || number);

  // Helper: reset Redux keys and sub-thread
  const resetKeys = () => {
    dispatch(setDataInAppInfoReducer({ subThreadId: '', currentChannelId: '', currentChatId: '', currentTeamId: '' }));
  };

  // 1. Widget token changed
  if (unique_id ? `${widgetToken}_${unique_id}` !== prevWidgetId : widgetToken !== prevWidgetId) {
    resetKeys();
    // ['a_clientId', 'k_clientId', 'userData', 'client', 'default_client_created'].forEach(key => setLocalStorage(key, ''));
    // setLocalStorage('is_anon', hasUserIdentity ? 'false' : 'true');
  }

  // 2. User identity changed
  if (unique_id !== prevUser.unique_id) {
    setLocalStorage('client', '{}');
    setLocalStorage('userData', '{}');
    resetKeys();
  }

  // 3. Update stored userData
  const { mail: clientMail, number: clientNumber, name: clientName, country_code: clientCountryCode } = JSON.parse(getLocalStorage('client') || '{}');
  if (mail && number && name) {
    setLocalStorage('client', JSON.stringify({ mail: mail, number: number, name: name, country_code: clientCountryCode || "+91" }));
    dispatch(setHelloKeysData({ showWidgetForm: false }));
  } else {
    setLocalStorage('client', JSON.stringify({ mail: clientMail, number: clientNumber, name: clientName, country_code: clientCountryCode || "+91" }));
  }

  setLocalStorage('userData', JSON.stringify({ unique_id, mail, number, user_jwt_token: hasUserIdentity ? user_jwt_token : undefined, name }));

  // 4. Anonymous cleanup when no identity
  if (!hasUserIdentity && getLocalStorage('k_clientId')) {
    resetKeys();
    setLocalStorage('k_clientId', '');
  }

  // 5. Determine anonymity status
  const defaultClientCreated = getLocalStorage('default_client_created') === 'true';
  const isAnon = hasUserIdentity || defaultClientCreated ? 'false' : 'true';

  if (getLocalStorage('is_anon') != isAnon) {
    resetKeys();
  }

  setLocalStorage('is_anon', isAnon);

  // 7. Map additional interface props
  Object.entries(restProps).forEach(([key, value]) => {
    const mappedKey = helloToChatbotPropsMap[key];
    if (!mappedKey) return;

    const finalValue = mappedKey === 'hideCloseButton' ? !value : value;
    dispatch(setDataInInterfaceRedux({ [mappedKey]: finalValue }));
  });

  // 8. Persist new widget token and config
  setLocalStorage('WidgetId', widgetToken);
  dispatch(setHelloConfig(event.data.data));
  SetSessionStorage('helloConfig', JSON.stringify(event.data.data))
  dispatch(setDataInTabInfo({ widgetToken: fullWidgetToken }));
});