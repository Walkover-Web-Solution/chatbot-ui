import { emitEventToParent } from "./emitEventsToParent/emitEventsToParent";

/**
 * Keys that are set during bootstrap / auth initialization and must remain
 * accessible before the user_id is known. These are stored as-is (no prefix).
 */
const UNNAMESPACED_KEYS = new Set([
  "interfaceUserId",
  "widgetToken",
]);

/**
 * Returns the storage key prefixed with the current user_id when available.
 * Falls back to the raw key for unnamespaced / bootstrap keys.
 */
const getNamespacedKey = (key: string): string => {
  if (UNNAMESPACED_KEYS.has(key)) return key;
  try {
    const userId = sessionStorage.getItem("interfaceUserId");
    if (userId) return `${userId}_${key}`;
  } catch {
    // ignore
  }
  return key;
};

export const SetSessionStorage = (key: string, value: string) => {
  sessionStorage.setItem(getNamespacedKey(key), value);
};

export const GetSessionStorageData = (key: string): string | null => {
  try {
    return sessionStorage.getItem(getNamespacedKey(key));
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