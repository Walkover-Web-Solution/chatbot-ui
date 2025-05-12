import defaultAxios from "axios";
import { getLocalStorage, setLocalStorage } from "./utilities";
import { store } from "../store";
import { setHelloKeysData } from "../store/hello/helloSlice";
import { setDataInAppInfoReducer } from "@/store/appInfo/appInfoSlice";

const instance = defaultAxios.create();
const axios = instance;

// response interceptor
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
    if (error?.response?.data?.message?.is_exists === 0) {
      let is_anon = ''
      if (getLocalStorage('k_clientId')) {
        is_anon = 'false'
      } else {
        is_anon = 'true'
      }

      store.dispatch(setDataInAppInfoReducer({
        subThreadId: ''
      }))

      store.dispatch(setHelloKeysData({
        currentChannelId: '',
        currentChatId: '',
        currentTeamId: ''
      }))

      setLocalStorage('is_anon', is_anon)
      setLocalStorage('a_clientId', '')
      setLocalStorage('k_clientId', '')
      setLocalStorage('default_client_created', 'false')
      const currentWidgetId = getLocalStorage('WidgetId') || ''
      setLocalStorage('WidgetId', currentWidgetId)

    }
    return Promise.reject(error);
  }
);

export default axios;
