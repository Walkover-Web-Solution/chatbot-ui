import { createUrl } from '@msg91/service';

export const blackListNumbersUrls = {
    uploadFile: (baseUrl: string) => createUrl(baseUrl, 'api/v5/sms/uploadBlockedNumberCsv'),
    removeUploadedFile: (baseUrl: string) => createUrl(baseUrl, 'api/v5/sms/deleteBlockedNumberCsv'),
    sms: {
        typeMapping: (baseUrl: string) => createUrl(baseUrl, 'api/v5/sms/getBlockNumbersMappings'),
        get: (baseUrl: string) => createUrl(baseUrl, 'api/v5/sms/getBlockedNumbers'),
        getNumberInfo: (baseUrl: string) => createUrl(baseUrl, 'api/v5/sms/getBlockedNumberDetails'),
        add: (baseUrl: string) => createUrl(baseUrl, 'api/v5/sms/addBlockedNumbers'),
        update: (baseUrl: string) => createUrl(baseUrl, 'api/v5/sms/editBlockedNumbers'),
        delete: (baseUrl: string) => createUrl(baseUrl, 'api/v5/sms/unblockNumbers'),
        export: (baseUrl: string) => createUrl(baseUrl, 'api/v5/sms/exportBlockedNumbers'),
    },
    whatsapp: {
        typeMapping: (baseUrl: string) => createUrl(baseUrl, 'blacklist-numbers/template-types-mappings/'),
        get: (baseUrl: string) => createUrl(baseUrl, 'blacklist-numbers/'),
        getNumberInfo: (baseUrl: string) => createUrl(baseUrl, 'blacklist-numbers/'),
        add: (baseUrl: string) => createUrl(baseUrl, 'blacklist-numbers/'),
        update: (baseUrl: string) => createUrl(baseUrl, 'blacklist-numbers/'),
        delete: (baseUrl: string) => createUrl(baseUrl, 'blacklist-numbers/'),
        export: (baseUrl: string) => createUrl(baseUrl, 'blacklist-numbers/'),
    },
    rcs: {
        typeMapping: (baseUrl: string) => createUrl(baseUrl, 'block-list-template-mappings/'),
        get: (baseUrl: string) => createUrl(baseUrl, 'block-numbers/'),
        getNumberInfo: (baseUrl: string) => createUrl(baseUrl, 'block-numbers/'),
        add: (baseUrl: string) => createUrl(baseUrl, 'block-numbers/'),
        update: (baseUrl: string) => createUrl(baseUrl, 'block-numbers/'),
        delete: (baseUrl: string) => createUrl(baseUrl, 'block-numbers/'),
        export: (baseUrl: string) => createUrl(baseUrl, 'block-numbers/'),
    },
};
