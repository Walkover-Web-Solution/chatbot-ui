import { IChannel, IMessage } from '../model';
import dayjs from 'dayjs';
import { ConvertToDigitTimeToken } from '@msg91/utils';

export function setCookie(cname: string, cvalue: string, exdays: number = 28) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

export function removeCookie(cname: string) {
    document.cookie = cname + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT';
}

export function getCookie(cname: string) {
    const name = cname + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}

export const sortByTimeToken = (a: IMessage, b: IMessage) => {
    return dayjs(ConvertToDigitTimeToken(a?.timetoken)).diff(dayjs(ConvertToDigitTimeToken(b?.timetoken)));
};

export const sortByTimeTokenChannel = (a: IChannel, b: IChannel) => {
    const aDate = ConvertToDigitTimeToken(a?.last_message?.timetoken);
    const bDate = ConvertToDigitTimeToken(b?.last_message?.timetoken);
    if (!aDate || !bDate) {
        return 0;
    }
    return isNaN(dayjs(bDate).diff(dayjs(aDate))) ? 0 : dayjs(bDate).diff(dayjs(aDate));
};
