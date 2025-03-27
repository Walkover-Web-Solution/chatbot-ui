import { emitEventToParent } from "./emitEventsToParent/emitEventsToParent";

export const SetSessionStorage = (key: string, value: string) => {
  sessionStorage.setItem(key, value);
};

export const GetSessionStorageData = (key: string): string | null => {
  try {
    return sessionStorage.getItem(key);
  } catch (error) {
    console.error(
      `Error retrieving session storage data for key "${key}":`,
      error
    );
    return null;
  }
};

export const isJSONString = (str: string) => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

export const perFormAction = (actionData: any) => {
  // const data = {
  //   message: actionData?.variables || actionData?.variable || actionData?.data || actionData?.dataToSend || {},
  //   type: "ChatbotResponse",
  // };
  // window?.parent?.postMessage(data, "*");
  emitEventToParent('FRONT_END_ACTION',actionData?.variables || actionData?.variable || actionData?.data || actionData?.dataToSend || {})
  // switch (actionData?.type?.toLowerCase()) {
  //   case "senddatatofrontend":
  //     /* eslint-disable-next-line */
  //     const data = {
  //       message: actionData.variable,
  //       type: "ChatbotResponse",
  //     };
  //     window?.parent?.postMessage(data, "*");
  //     break;
  //   case "senddatatoai":
  //     // data = {
  //     //   message: actionData.data,
  //     //   type: "ChatbotResponse",
  //     // };
  //     break;
  //   default:
  //     break;
  // }
};

export const toggleSidebar = (sidebarId) => {
  const sidebar = document.getElementById(sidebarId);
  const handleClickOutside = (event) => {
    const sidebar = document.getElementById(sidebarId);
    const button = event.target.closest('button');

    if (sidebar && !sidebar.contains(event.target) && !button) {
      sidebar.classList.add('-translate-x-full');
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscPress);
    }
  };

  const handleEscPress = (event) => {
    if (event.key === 'Escape') {
      sidebar.classList.add('-translate-x-full');
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscPress);
    }
  };

  if (sidebar) {
    sidebar.classList.toggle('-translate-x-full');

    if (!sidebar.classList.contains('-translate-x-full')) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscPress);
    } else {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscPress);
    }
  }
};