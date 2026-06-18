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

export const perFormAction = (actionData: any, sendMessage: any, props: any) => {
  switch (actionData?.actionType) {
    case "reply":
      sendMessage({ message: (props?.label || props?.children || props?.text || props?.title || props?.name) });
      break;
    case "sendDataToFrontEnd":
      emitEventToParent(
        'FRONT_END_ACTION',
        actionData?.variables || actionData?.variable || actionData?.data || actionData?.dataToSend || {}
      );
      break;
    case "sendDataToFrontend":
      emitEventToParent(
        'FRONT_END_ACTION',
        actionData?.variables || actionData?.variable || actionData?.data || actionData?.dataToSend || {}
      );
      break;
    default:
      break;
  }
};

export const toggleSidebar = (sidebarId: string) => {
  const sidebar = document.getElementById(sidebarId);
  const handleClickOutside = (event: MouseEvent) => {
    const sidebar = document.getElementById(sidebarId);
    const button = (event.target as HTMLElement)?.closest('button');

    if (sidebar && event.target && !sidebar.contains(event.target as Node) && !button) {
      sidebar.classList.add('-translate-x-full');
      document.removeEventListener('click', handleClickOutside as any);
      document.removeEventListener('keydown', handleEscPress as any);
    }
  };

  const handleEscPress = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (sidebar) {
        sidebar.classList.add('-translate-x-full');
      }
      document.removeEventListener('click', handleClickOutside as any);
      document.removeEventListener('keydown', handleEscPress as any);
    }
  };

  if (sidebar) {
    sidebar.classList.toggle('-translate-x-full');

    if (!sidebar.classList.contains('-translate-x-full')) {
      document.addEventListener('click', handleClickOutside as any);
      document.addEventListener('keydown', handleEscPress as any);
    } else {
      document.removeEventListener('click', handleClickOutside as any);
      document.removeEventListener('keydown', handleEscPress as any);
    }
  }
};