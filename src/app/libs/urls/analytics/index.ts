import { createUrl } from '@msg91/service';

export const AdminAnalyticsUsersUrls = {
    getUsersData: (baseUrl) => createUrl(baseUrl, 'analytics/:serviceType/'),
    getEmailEvents: (baseUrl) => createUrl(baseUrl, 'events'),
    exportLogs: (baseUrl) => createUrl(baseUrl, 'exports/:serviceType/'),
    exportReport: (baseUrl) => createUrl(baseUrl, 'analytics/:serviceType/export/'),
    getWhatsappNumbers: (baseUrl) => createUrl(baseUrl, 'whatsapp-status/'),
    exportNotificationLogs: (baseUrl) => createUrl(baseUrl, 'exports/notification/'),
    fetchPushNotificationLogs: (baseUrl) => createUrl(baseUrl, 'logs/notification/'),
};

export const AdminAnalyticsVendorsUrls = {
    getVendorsData: (baseUrl) => createUrl(baseUrl, 'analytics/sms/'),
    getVendorsSMSCData: (baseUrl) => createUrl(baseUrl, 'admin/sms/'),
    exportVendorsSMSCData: (baseUrl) => createUrl(baseUrl, 'analytics/admin/export/'),
};

export const AdminAnalyticsProfitUrls = {
    getVendorsProfitData: (baseUrl) => createUrl(baseUrl, 'profits/vendors'),
    // getAllUsersProfitData: (baseUrl) => createUrl(baseUrl, 'profits/sms'),
    // getUserProfitData: (baseUrl, type) => createUrl(baseUrl, 'profits/sms'),
    getUserProfitData: (baseUrl, type) => createUrl(baseUrl, `revenue/${type}`),
    getUserProfitExportData: (baseUrl, type) => createUrl(baseUrl, `revenue/${type}/export`),
};

export const AutoFTPUrls = {
    autoFTPUrls: (baseUrl) => createUrl(baseUrl, 'cron/sms/:type'),
};
