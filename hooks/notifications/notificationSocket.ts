import { useEffect } from "react";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import socketManager from "./notificationSocketManager";
import { $ReduxCoreType } from "@/types/reduxCore";
import { getLocalStorage } from "@/utils/utilities";

const useNotificationSocket = () => {
  const { jwtToken, company_id } = useCustomSelector((state: $ReduxCoreType) => ({
    jwtToken: state.Hello?.socketJwt?.jwt,
    company_id: state.Hello?.widgetInfo?.company_id
  }));

  useEffect(() => {
    if (!jwtToken || !company_id || (!getLocalStorage('a_clientId') && !getLocalStorage('k_clientId'))) return;

    socketManager.connect(jwtToken);
    const uuid = getLocalStorage('k_clientId') ? getLocalStorage('k_clientId') : getLocalStorage('a_clientId')
    if (uuid) {
      socketManager.subscribe([`ch-comp-${company_id}.${uuid}`])
        .catch(error => {
          console.error("Failed to subscribe to channels:", error);
        });
    }
    // Cleanup function - no need to disconnect as the manager handles multiple components
    return () => {
      // We don't disconnect here as other components might be using the socket
      // The socket manager will handle cleanup when the app unmounts
    };
  }, [jwtToken, company_id]);

  return null;
};

export default useNotificationSocket;