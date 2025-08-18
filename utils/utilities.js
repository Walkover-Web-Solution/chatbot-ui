import dayjs from "dayjs";
import linkifyHtml from "linkify-html";
import { customAlphabet } from "nanoid";
import { GetSessionStorageData } from "./ChatbotUtility";
import relativeTime from 'dayjs/plugin/relativeTime'
import updateLocale from 'dayjs/plugin/updateLocale'
dayjs.extend(relativeTime);
dayjs.extend(updateLocale)

/**
 * Updates the locale for the dayjs instance.
 * @param {string} locale - The locale to update.
 */
dayjs.updateLocale('en', {
  relativeTime: {
    future: (str) => (str === 'Just now' ? str : `in ${str}`),
    past: (str) => (str === 'Just now' ? str : `${str} ago`),
    s: 'Just now',
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    w: "1w",
    ww: "%dw",
    M: "1mo",
    MM: "%dmo",
    y: "1y",
    yy: "%dy"
  }
});

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
  if (key === 'WidgetId' || key === 'k_clientId' || key === 'a_clientId') {
    if (key === 'k_clientId') window.parent.postMessage({ type: 'setDataInLocal', data: { key: 'hello-widget-uuid', payload: value } }, '*');
    if (key === 'a_clientId') window.parent.postMessage({ type: 'setDataInLocal', data: { key: 'hello-widget-anonymoud-uuid', payload: value } }, '*');

    window.dispatchEvent(new CustomEvent("localstorage-updated", {
      detail: { key, value }
    }));
  }
}

/**
 * Gets the value of a local storage item.
 * @param {string} key - The key of the local storage item to get.
 * @returns {string|null} The value of the local storage item, or null if the key does not exist.
 */
export const getLocalStorage = (key) => {
  let updatedKey = key
  const widgetToken = GetSessionStorageData('widgetToken')
  if (widgetToken) {
    updatedKey = `${widgetToken}_${key}`
  }
  return key ? localStorage.getItem(updatedKey) : null;
}

export const removeFromLocalStorage = (key) => {
  let updatedKey = key
  const widgetToken = GetSessionStorageData('widgetToken')
  if (widgetToken) {
    updatedKey = `${widgetToken}_${key}`
  }
  localStorage.removeItem(updatedKey);
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
      return dayjs(timeToken).format('hh:mm A');
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

export function splitNumber(value) {
  const country_codes = ["+1-876", "+1-869", "+1-868", "+1-809", "+1-787", "+1-784", "+1-767", "+1-758", "+1-721", "+1-684", "+1-671", "+1-670", "+1-664", "+1-649", "+1-473", "+1-441", "+1-345", "+1-340", "+1-284", "+1-268", "+1-264", "+1-246", "+1-242", "+44-1624", "+44-1534", "+44-1481", "+998", "+996", "+995", "+994", "+993", "+992", "+977", "+976", "+975", "+974", "+973", "+972", "+971", "+970", "+968", "+967", "+966", "+965", "+964", "+963", "+962", "+961", "+960", "+886", "+880", "+856", "+855", "+853", "+852", "+850", "+692", "+691", "+690", "+689", "+688", "+687", "+686", "+685", "+683", "+682", "+681", "+680", "+679", "+678", "+677", "+676", "+675", "+674", "+673", "+672", "+670", "+599", "+598", "+597", "+595", "+593", "+592", "+591", "+590", "+509", "+508", "+507", "+506", "+505", "+504", "+503", "+502", "+501", "+500", "+423", "+421", "+420", "+389", "+387", "+386", "+385", "+383", "+382", "+381", "+380", "+379", "+378", "+377", "+376", "+375", "+374", "+373", "+372", "+371", "+370", "+359", "+358", "+357", "+356", "+355", "+354", "+353", "+352", "+351", "+350", "+299", "+298", "+297", "+291", "+290", "+269", "+268", "+267", "+266", "+265", "+264", "+263", "+262", "+261", "+260", "+258", "+257", "+256", "+255", "+254", "+253", "+252", "+251", "+250", "+249", "+248", "+246", "+245", "+244", "+243", "+242", "+241", "+240", "+239", "+238", "+237", "+236", "+235", "+234", "+233", "+232", "+231", "+230", "+229", "+228", "+227", "+226", "+225", "+224", "+223", "+222", "+221", "+220", "+218", "+216", "+213", "+212", "+211", "+98", "+95", "+94", "+93", "+92", "+91", "+90", "+86", "+84", "+82", "+81", "+66", "+65", "+64", "+63", "+62", "+61", "+60", "+58", "+57", "+56", "+55", "+54", "+53", "+52", "+51", "+49", "+48", "+47", "+46", "+45", "+44", "+43", "+41", "+40", "+39", "+36", "+34", "+33", "+32", "+31", "+30", "+27", "+20", "+7", "+1"];

  value = value?.trim();

  if (!value?.includes("+")) {
    return { "code": "", "number": value };
  }

  for (let i = 0; i < country_codes.length; i++) {
    if (value?.includes(country_codes[i])) {
      let code_size = country_codes[i].length;
      return { "code": value.substring(0, code_size), "number": value.substring(code_size) };
    }
  }
}