export * from './intl-phone-lib.class';
export * from './email-variable-check';
export * from './rename-key-recursively';
export * from './convert-to-utc';
export * from './loading-chunk-error-handler';
export * from './curl-to-json';
export * from './random-string';
export * from './intl-tel-countries';

import { Result, getHostNameDetail } from '@msg91/ui/handle-domain';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import { cloneDeep, differenceWith, isEqual, pickBy, uniqBy } from 'lodash-es';
import { Validators } from '@angular/forms';
import { ONLY_INTEGER_REGEX } from '@msg91/regex';

export interface Domain {
    is_parent_domain: boolean;
    value: string;
}

export function ConvertToDigitTimeToken(value, length = 13) {
    if (value) {
        value = value.toString();

        if (value.length !== length) {
            const muultiplyer = Math.pow(10, length - value.length);
            value = (+value * muultiplyer).toFixed(0);
        }
        return +value;
    }
    return null;
}

/**
 *
 * @param datetime: string | Date.
 * @param timeZone: string[], ["05", "30"] ["hour", "minute"]
 * @param add: boolean, true if want to add
 * @returns string
 */
export function addSubTractDependOnTimeZone(
    datetime: string | Date,
    timeZone: string[],
    add: boolean,
    format: string = 'YYYY-M-DD HH:mm:ss'
) {
    if (add) {
        return dayjs(datetime).add(+timeZone[0], 'h').add(+timeZone[1], 'm').format(format);
    } else {
        return dayjs(datetime).subtract(+timeZone[0], 'h').subtract(+timeZone[1], 'm').format(format);
    }
}

export function extractAllVariables(value, regex): string[] {
    let newContent = cloneDeep(value || '');
    let matchContent = newContent.match(regex);
    let allVariables = [];
    if (!matchContent) {
        return [];
    }
    while (matchContent) {
        allVariables.push(matchContent[1]);
        newContent = newContent.replace(regex, matchContent[1]);
        matchContent = newContent.match(regex);
    }
    return allVariables;
}

export function extractLatestVariable(value, regex): string {
    let newContent = cloneDeep(value || '');
    let matchContent = newContent.match(regex);
    if (!matchContent) {
        return null;
    }
    let maxNumber = 0;
    while (matchContent) {
        if (matchContent[1].slice(0, 3).toLowerCase() === 'var') {
            const currNumber = +matchContent[1].slice(3);
            maxNumber = maxNumber < currNumber ? currNumber : maxNumber;
        }
        newContent = newContent.replace(regex, matchContent[1]);
        matchContent = newContent.match(regex);
    }
    return 'VAR' + maxNumber.toString();
}

export function RemoveEmptyParam(param: Object) {
    return pickBy(param, (value, key) => {
        //@ts-ignore
        return !(value === undefined || value === null || value === '');
    });
}

export function formatBytes(bytes: number | string, withSpace: boolean = true) {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let l = 0,
        n = parseInt(bytes.toString(), 10) || 0;
    while (n >= 1024 && ++l) {
        n = n / 1024;
    }
    return n.toFixed(n < 10 && l > 0 ? 1 : 0) + (withSpace ? ' ' : '') + units[l];
}

/**
 * Extracts the parent domain from a sub-domain
 *
 * @param {Array<string>} domains List of domains obtained from API
 * @return {Array<Domain>} List of all the parent and sub-domains
 */
export const extractParentDomain = (domains: Array<string>): Array<Domain> => {
    let filteredDomains: Array<Domain> = [];
    domains.forEach((domain, index) => {
        const domainDetails: Result | Error = getHostNameDetail(domain);
        if (!(domainDetails instanceof Error) && domainDetails.domain) {
            if (domainDetails.domain !== domain) {
                // Parent domain obtained is not the same as domain only then insert both parent and sub-domain
                filteredDomains.push({ is_parent_domain: false, value: domain }); // Sub-domain
                // Check if the obtained parent domain is present in rest of the un-traversed domains in array
                // If present then is_parent_domain should be set to false for API
                const isParent = !domains.slice(index + 1)?.includes(domainDetails.domain);
                filteredDomains.push({ is_parent_domain: isParent, value: domainDetails.domain }); // Parent domain
            } else {
                // Parent domain obtained is the same as domain, just insert single entry
                filteredDomains.push({ is_parent_domain: false, value: domain });
            }
        }
    });
    filteredDomains = uniqBy(filteredDomains, 'value');
    return filteredDomains;
};

export function checkFileExtension(file: File, type = null): boolean {
    const allowedExtension = [
        'aif',
        'cda',
        'mid',
        'midi',
        'mp3',
        'mpa',
        'ogg',
        'oga',
        'ogv',
        'ogx',
        'wav',
        'wma',
        'wpl',
        '7z',
        'arj',
        'deb',
        'pkg',
        'rar',
        'rpm',
        'tar',
        'gz',
        'z',
        'zip',
        'dmg',
        'iso',
        'vcd',
        'csv',
        'xml',
        'email',
        'eml',
        'emlx',
        'msg',
        'oft',
        'ost',
        'pst',
        'vcf',
        'fnt',
        'fon',
        'otf',
        'ttf',
        'ai',
        'bmp',
        'gif',
        'ico',
        'jpeg',
        'jpg',
        'png',
        'ps',
        'psd',
        'svg',
        'tif',
        'tiff',
        'cer',
        'cfm',
        'html',
        'ods',
        'xls',
        'xlsm',
        'xlsx',
        '3g2',
        '3gp',
        'avi',
        'flv',
        'h264',
        'm4v',
        'mkv',
        'mov',
        'mp4',
        'mpg',
        'mpeg',
        'rm',
        'swf',
        'vob',
        'wmv',
        'doc',
        'docx',
        'odt',
        'pdf',
        'rtf',
        'tex',
        'txt',
        'wpd',
        'ppt',
        'pptx',
        'ppt',
        'json',
    ];

    const allowedExtensionForFB = [
        'jpeg',
        'jpg',
        'png',
        'gif',
        'mp4',
        'ogg',
        'avi',
        'mov',
        'webm',
        'aac',
        'm4a',
        'wav',
        'pdf',
        'doc',
        'docx',
        'ppt',
        'pptx',
        'xls',
        'xlsx',
    ];
    const allowedExtensionForInsta = ['aac', 'm4a', 'wav', 'png', 'jpeg', 'jpg', 'gif', 'mp4', 'avi', 'mov', 'webm'];

    return (type === 'fb'
        ? allowedExtensionForFB
        : type === 'instagram'
          ? allowedExtensionForInsta
          : allowedExtension
    ).find((e) => e === file.name.split('.')[file.name.split('.').length - 1].toLocaleLowerCase())
        ? true
        : false;
}

export function fileNotSupportAtUI(url: string): boolean {
    const supportedExtension = ['mkv', '3gp', 'tiff', 'ico'];

    return url
        ? supportedExtension.find((e) => e === url.split('.')[url.split('.').length - 1])
            ? true
            : false
        : true;
}

export function normalizeCommonJSImport<T>(importPromise: Promise<T>): Promise<T> {
    // CommonJS's `module.exports` is wrapped as `default` in ESModule.
    return importPromise.then((m: any) => (m.default || m) as T);
}

function buildFormData(formData, data, parentKey) {
    if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
        Object.keys(data).forEach((key) => {
            buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
        });
    } else {
        const value = data == null ? '' : data;

        formData.append(parentKey, value);
    }
}

export function jsObjectToFormData(data) {
    const formData = new FormData();

    buildFormData(formData, data, '');

    return formData;
}

export function makeFilterPayloadBySelectedFilter(res) {
    return {
        agent: res?.assignees?.all ? '*' : (res?.assignees?.agents ?? '*'),
        team: res?.assignees?.all ? '*' : (res?.assignees?.teams ?? '*'),
        unassigned: (res?.assignees?.all || res?.assignees?.unassigned) ?? true,
        bot: (res?.assignees?.all || res?.assignees?.bot) ?? true,
        filter_id: res?._id,
        from_date: res?.last_modified_between?.from_date
            ? dayjs(+res.last_modified_between.from_date * 1000).format('DD-MM-YYYY')
            : null,
        to_date: res?.last_modified_between?.to_date
            ? dayjs(+res.last_modified_between.to_date * 1000).format('DD-MM-YYYY')
            : null,
        lastReplyBy:
            res?.last_reply_by?.length === (res?.origin === 'mail' ? 2 : 3) || res?.last_reply_by?.length === 0
                ? 'all'
                : res?.last_reply_by?.join(','),
        ...(res?.inboxes?.length && { inbox_id: res?.inboxes }),
    };
}

export function makeSavedFilterPayloadByAppliedFilter(res, isEmail?: boolean) {
    const all = res?.agent === '*' && res?.team === '*' && res.unassigned && res.bot;
    return {
        inboxes: res?.inbox_id ?? [],
        assignees: {
            unassigned: all ? false : (res?.unassigned ?? false),
            bot: all ? false : (res?.bot ?? false),
            agents: all ? [] : ((res?.agent === '*' ? [] : res?.agent) ?? []),
            teams: all ? [] : ((res?.team === '*' ? [] : res?.team) ?? []),
            all,
        },
        last_reply_by:
            res.lastReplyBy === 'all'
                ? isEmail
                    ? ['agent', 'client']
                    : ['agent', 'client', 'bot']
                : res.lastReplyBy?.split(','),
        last_modified_between: {
            from_date: res?.from_date ? dayjs(res?.from_date + ' 00:00:00', 'DD-MM-YYYY HH:mm:ss')?.unix() : null,
            to_date: res?.to_date ? dayjs(res?.to_date + ' 23:59:59', 'DD-MM-YYYY HH:mm:ss')?.unix() : null,
        },
    };
}

export function downloadFile(fileUrl: string, fileName?: string): void {
    // Create an invisible A element
    const a = document.createElement('a');
    a.style.display = 'none';
    document.body.appendChild(a);

    // Set the HREF to a Blob representation of the data to be downloaded
    a.href = fileUrl;
    // Use download attribute to set set desired file name
    a.setAttribute('download', fileName ?? fileUrl.split('/')[fileUrl.split('/').length - 1]);
    // a.setAttribute('target','_blank')
    // Trigger the download by simulating click
    a.click();
    // Cleanup
    // window.URL.revokeObjectURL(a.href);
    document.body.removeChild(a);
}

export function downloadCSVFile(content, fileName): void {
    let csvContent = 'data:text/csv;charset=utf-8,' + content;
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Find differences between two objects
 *
 * @export
 * @param {{ [key: string]: any }} object1 First object to compare
 * @param {{ [key: string]: any }} object2 Second object to compare
 * @param {(value: any, other: any) => boolean} [comparatorFunction=isEqual] Function to compare objects with
 * @return {{ [key: string]: any }} { [key: string]: any }
 */
export function objectDifference(
    object1: { [key: string]: any },
    object2: { [key: string]: any },
    comparatorFunction: (value: any, other: any) => boolean = isEqual
): { [key: string]: any } {
    return Object.fromEntries(differenceWith(Object.entries(object1), Object.entries(object2), comparatorFunction));
}

/**
 * check element is in view-port or not
 * @param {Element} element
 * @param {number} number
 * @returns {Promise<boolean>}
 */
export function elementIsVisibleInViewport(element: Element, disconnectAfter: number = null): Promise<boolean> {
    if (!element) return Promise.resolve(false);
    return new Promise((resolve) => {
        const isVisible = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
        isVisible.observe(element);
        if (disconnectAfter) {
            setTimeout(() => {
                isVisible.disconnect();
            }, disconnectAfter);
        }
    });
}

export function isMobileDevice() {
    const w = document.documentElement.clientWidth;
    const breakpoint = 992;
    return w <= breakpoint;
}

/**
 * get Regex for type checking for input type file
 *
 * @export
 * @param {string} acceptString accept string provided in input
 * @return {*}  {string}
 */
export function getAcceptedTypeRegex(acceptString: string): string {
    return acceptString
        .replaceAll(/\s*,\s*/g, '|')
        .replaceAll('/', '\\/')
        .replaceAll('.', '\\.')
        .replaceAll('*', '.*');
}

/**
 * Returns whether the given file is allowed in provided regex
 *
 * @export
 * @param {File} file
 * @param {string} fileRegex
 * @return {*}  {boolean}
 */
export function isFileAllowed(file: File, fileRegex: string): boolean {
    if (file?.type) {
        return Boolean(file?.type?.match(fileRegex));
    } else {
        const nameSplit = file?.name?.split('.');
        return Boolean(('.' + nameSplit[nameSplit?.length - 1])?.match(fileRegex));
    }
}

/**
 * top and self are both window objects (along with parent), so you're seeing if your window is the top window.
 * @returns {boolean}
 */
export function inIframe(): boolean {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

/**
 *
 * @returns {boolean}
 */
export function iframeDetection(): boolean {
    return window !== window.parent;
}

/**
 * Fetch All Paths in JSON Recursively
 *
 * @export
 * @param {({ [key: string | number]: any })} json - JSON to fetch paths from
 * @param {boolean} [consolidate] - To Consolidate identical keys
 * @param {{ [key: string | number]: any }} keyValue - Key value pair of path and values
 * @param {string} [parentPath] - Parent path used for recursion
 */
export function recursivelyFetchAllPaths(
    json: { [key: string | number]: any },
    consolidate?: boolean,
    keyValue: { [key: string | number]: any } = {},
    parentPath?: string
): { [key: string | number]: any } {
    if (typeof json === 'object') {
        if (consolidate) {
            const path = parentPath ? parentPath + '.' + '*' : '*';
            keyValue[path] = JSON.stringify(json);
        }
        Object.keys(json ?? {})?.forEach((key) => {
            const modifiedKey = consolidate && !isNaN(+key) ? '*' : key;
            const path = parentPath ? parentPath + '.' + modifiedKey : modifiedKey;
            if (typeof json[key] === 'object') {
                recursivelyFetchAllPaths(json[key], consolidate, keyValue, path);
            } else {
                keyValue[path] = json[key];
            }
        });
    }
    return keyValue;
}

export function getValidations(fieldValidations: any): any[] {
    let validators = [];

    if (fieldValidations.required === true) {
        validators.push(Validators.required);
    }

    if (fieldValidations.min) {
        validators.push(Validators.minLength(fieldValidations.min));
    }

    if (fieldValidations.max) {
        validators.push(Validators.maxLength(fieldValidations.max));
    }

    if (fieldValidations.regex) {
        validators.push(Validators.pattern(new RegExp(fieldValidations.regex.replaceAll('/', ''))));
    }

    if (fieldValidations.type === 'numeric') {
        validators.push(Validators.pattern(new RegExp(ONLY_INTEGER_REGEX)));
    }

    return validators;
}
