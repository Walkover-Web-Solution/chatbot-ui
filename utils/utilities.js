import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Box, Typography } from "@mui/material";
import dayjs from "dayjs";
import linkifyHtml from "linkify-html";
import { customAlphabet } from "nanoid";
import { GetSessionStorageData } from "./ChatbotUtility";

export const generateNewId = (length = 8) => {
  const nanoid = customAlphabet(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
    length
  );
  return nanoid();
};

function getDomain() {
  const hostname = window.location.hostname;
  const parts = hostname?.split(".");
  if (parts.length >= 2) {
    parts.shift(); // Remove the subdomain part
    return `.${parts.join(".")}`;
  }
  return hostname;
}

export const getSubdomain = () => {
  return window.location.hostname;
};

export const getCurrentEnvironment = () =>
  process.env.REACT_APP_API_ENVIRONMENT;

export const setInCookies = (key, value) => {
  const domain = getDomain();
  let expires = "";

  const date = new Date();
  date.setTime(date.getTime() + 2 * 24 * 60 * 60 * 1000);
  expires = `; expires= ${date.toUTCString()}`;
  document.cookie = `${key}=${value || ""}${expires}; domain=${domain}; path=/`;
};

function splitFromFirstEqual(str) {
  // Handle empty string or string without an equal sign gracefully
  if (!str || str.indexOf("=") === -1) {
    return [str, ""]; // Return the original string as both parts
  }

  // Find the index of the first equal sign
  const index = str.indexOf("=");

  // Handle cases where the equal sign is at the beginning or end of the string
  if (index === 0) {
    return ["", str.slice(1)]; // Empty key, value is the rest of the string
  }
  if (index === str.length - 1) {
    return [str.slice(0, -1), ""]; // Key is the entire string except the last character (equal sign)
  }

  // Split the string into key and value parts
  const key = str.slice(0, index);
  const value = str.slice(index + 1);

  return [key, value];
}

export const getFromCookies = (cookieId) => {
  // Split cookies string into individual cookie pairs and trim whitespace
  const cookies = document.cookie?.split(";").map((cookie) => cookie.trim());
  // Loop through each cookie pair
  for (let i = 0; i < cookies.length; i++) {
    // const cookiePair = cookies[i]?.split('=');
    // If cookie name matches, return its value
    const [key, value] = splitFromFirstEqual(cookies[i]);
    if (cookieId === key) {
      return value;
    }
  }
  // If the cookie with the given name doesn't exist, return null
  return null;
};

export const removeCookie = (cookieName) => {
  const domain = getDomain();
  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
};

export const setLocalStorage = (key, value = '') => {
  const widgetToken = GetSessionStorageData('widgetToken')
  let updatedKey = key
  if (widgetToken) {
    updatedKey = `${widgetToken}_${key}`
  }
  localStorage.setItem(updatedKey, value);
  if (key === 'WidgetId' || key === 'k_clientId' || key === 'a_clientId' || key === 'is_anon' || key === 'clientInfo') {
    if (key === 'k_clientId') window.parent.postMessage({ type: 'setDataInLocal', data: { key: 'hello-widget-uuid', payload: value } }, '*');
    if (key === 'a_clientId') window.parent.postMessage({ type: 'setDataInLocal', data: { key: 'hello-widget-anonymoud-uuid', payload: value } }, '*');

    window.dispatchEvent(new CustomEvent("localstorage-updated", {
      detail: { key, value }
    }));
  }
}

export const getLocalStorage = (key) => {
  let updatedKey = key
  const widgetToken = GetSessionStorageData('widgetToken')
  if (widgetToken) {
    updatedKey = `${widgetToken}_${key}`
  }
  return key ? localStorage.getItem(updatedKey) : null;
}


export const linkify = (str) => {
  return str ? linkifyHtml(str, {
    className: 'link-text',
    target: {
      url: '_blank',
    },
  }) : str;
}


export const playMessageRecivedSound = () => {
  const notificationSound = new Audio('/notification-sound.mp3');
  notificationSound.volume = 0.2;
  notificationSound.play().catch(error => {
    console.log("Failed to play notification sound:", error);
  });
}

/**
 * Converts a timestamp to various formatted date/time strings
 * @param {number} value - The timestamp to convert
 * @param {'longDate'|'shortDate'|'timeAgo'|'shortTime'|'longtime'|'hrMinSec'} format - The desired output format
 * @returns {string} The formatted date/time string
 */
export const formatTime = (value, format) => {
  if (!value) {
    return format === 'hrMinSec' ? '0 hr 0 min 0 sec' : '';
  }

  const timeToken = value;

  switch (format) {
    case 'longDate': {
      if (
        dayjs(timeToken).date() === dayjs().date() &&
        dayjs(timeToken).month() === dayjs().month() &&
        dayjs(timeToken).year() === dayjs().year()
      ) {
        return 'Today';
      } else if (
        dayjs(timeToken).date() === dayjs().date() - 1 &&
        dayjs(timeToken).month() === dayjs().month() &&
        dayjs(timeToken).year() === dayjs().year()
      ) {
        return 'Yesterday';
      }
      return dayjs(timeToken).format('LL');
    }
    case 'longtime': {
      return dayjs(timeToken).format('hh:mm a z');
    }
    case 'shortDate': {
      if (
        dayjs(timeToken).date() === dayjs().date() &&
        dayjs(timeToken).month() === dayjs().month() &&
        dayjs(timeToken).year() === dayjs().year()
      ) {
        return 'Today';
      } else if (
        dayjs(timeToken).date() === dayjs().date() - 1 &&
        dayjs(timeToken).month() === dayjs().month() &&
        dayjs(timeToken).year() === dayjs().year()
      ) {
        return 'Yesterday';
      }
      return dayjs(timeToken).format('DD MMM, YYYY');
    }
    case 'shortTime': {
      return dayjs(timeToken).format('hh:mm a');
    }
    case 'timeAgo': {
      return dayjs(timeToken).fromNow();
    }
    case 'hrMinSec': {
      if (value < 60) return value + ' Seconds';

      const h = Math.floor(value / 3600);
      const m = Math.floor((value % 3600) / 60);
      const s = Math.floor((value % 3600) % 60);

      let str = '0 hr 0 min 0 sec';

      if (h > 0) {
        str = h + ' hr';
        if (m > 0) str += ' ' + m + ' min';
        if (s > 0) str += ' ' + s + ' sec';
      } else if (m > 0) {
        str = m + ' min';
        if (s > 0) str += ' ' + s + ' sec';
      }

      return str;
    }
    default: {
      return dayjs(timeToken).fromNow();
    }
  }
};

export function cleanObject(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value != null)
  );
}