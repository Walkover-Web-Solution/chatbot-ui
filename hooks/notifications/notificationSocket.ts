import { useEffect } from "react";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import socketManager from "./notificationSocketManager";
import { $ReduxCoreType } from "@/types/reduxCore";
import { getLocalStorage } from "@/utils/utilities";
import { subscribeForFCMPushNotification } from "@/config/helloApi";

const useNotificationSocket = ({ chatSessionId }: { chatSessionId: string }) => {
  const { jwtToken, company_id, pushConfig, isMobileSDK } = useCustomSelector((state) => ({
    jwtToken: state.Hello?.[chatSessionId]?.socketJwt?.jwt,
    company_id: state.Hello?.[chatSessionId]?.widgetInfo?.company_id,
    pushConfig: state.Hello?.[chatSessionId]?.helloConfig?.pushConfig,
    isMobileSDK: state.Hello?.[chatSessionId]?.helloConfig?.isMobileSDK,
  }));

  useEffect(() => {
    if (!jwtToken || !company_id || (!getLocalStorage('a_clientId') && !getLocalStorage('k_clientId')) || (isMobileSDK ? !pushConfig : false)) return;
    console.log(jwtToken, 'jwtToken', company_id, 'company_id', getLocalStorage('a_clientId'), 'a_clientId', getLocalStorage('k_clientId'), 'k_clientId', isMobileSDK, 'isMobileSDK', pushConfig, 'pushConfig')

    socketManager.connect(jwtToken);
    const uuid = getLocalStorage('k_clientId') ? getLocalStorage('k_clientId') : getLocalStorage('a_clientId')
    if (uuid) {
      const socketChannel = `ch-comp-${company_id}.${uuid}`
      socketManager.subscribe([socketChannel])
        .catch(error => {
          console.error("Failed to subscribe to channels:", error);
        });
      if (isMobileSDK && pushConfig) {
        console.log('callling subscribeForFCMPushNotification')
        subscribeForFCMPushNotification({ ...pushConfig, user_channel: socketChannel }, jwtToken)
          .catch(error => {
            console.log("Failed to subscribe to channels FOR FCM:", error);
          })
      }
    }
    // Cleanup function - no need to disconnect as the manager handles multiple components
    return () => {
      // We don't disconnect here as other components might be using the socket
      // The socket manager will handle cleanup when the app unmounts
    };
  }, [jwtToken, company_id, pushConfig,isMobileSDK]);

  return null;
};

export default useNotificationSocket;