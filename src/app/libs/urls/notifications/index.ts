import { createUrl } from '@msg91/service';

export const NotificationsUrls = {
    postClientTemplate: (baseUrl) => createUrl(baseUrl, 'client-panel-template/'),
    getClientTemplate: (baseUrl) => createUrl(baseUrl, 'client-panel-template/'),
    sendNotification: (baseUrl) => createUrl(baseUrl, 'send-notification/'),
    updateClientTemplate: (baseUrl) => createUrl(baseUrl, 'client-panel-template/:id/'),
    exportLogs: (baseUrl) => createUrl(baseUrl, 'exports/notification/'),
    fetchPushNotificationLogs: (baseUrl) => createUrl(baseUrl, 'logs/notification/'),
};
