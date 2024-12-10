import { createUrl } from '@msg91/service';

export const HelloUrls = {
    createInteractiveMessage: (baseUrl: string) => createUrl(baseUrl + '/isHelloAPI', 'saved-replies/'),
    updateInteractiveMessage: (baseUrl: string) => createUrl(baseUrl + '/isHelloAPI', 'saved-replies/'),
};

export const OneInboxUrls = {
    getOneInboxList: (baseUrl: string) => createUrl(baseUrl + '/isHelloAPI', 'one-inbox/list'),
    addOneInbox: (baseUrl: string) => createUrl(baseUrl + '/isHelloAPI', 'one-inbox/'),
    getWhatsAppTemplateDetails: (baseUrl: string) =>
        createUrl(baseUrl + '/isHelloAPI', 'proxy/whatsapp/get-template/:phoneNumber'),
    getWhatsappTemplateDetails: (baseUrl: string) =>
        createUrl(baseUrl + '/isHelloAPI', 'proxy/whatsapp/get-template/:phoneNumber'),
    getTemplateJsonDetails: (baseUrl: string) =>
        createUrl(baseUrl + '/isHelloAPI', 'proxy/whatsapp/get-template-curl/'),
};
