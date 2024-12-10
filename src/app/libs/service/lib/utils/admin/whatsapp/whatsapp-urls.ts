import { createUrl } from '../../base-url';

export const WhatsappUrls = {
    getDashboardData: (baseUrl) => createUrl(baseUrl, `whatsapp-admin-panel/dashboard/`),
    getClients: (baseUrl) => createUrl(baseUrl, `whatsapp-admin-panel/client/`),
    deleteClients: (baseUrl) => createUrl(baseUrl, `whatsapp-activation/:id/`),
    exportClients: (baseUrl) => createUrl(baseUrl, `whatsapp-admin-panel/client/export/`),
    getLogs: (baseUrl) => createUrl(baseUrl, `logs/wa`),
    createWhatsAppClient: (baseUrl) => createUrl(baseUrl, `whatsapp-activation/`),
    updateWhatsAppClient: (baseUrl) => createUrl(baseUrl, `whatsapp-activation/:id/`),
    exportLog: (baseUrl) => createUrl(baseUrl, `exports/:serviceType/`),
    getLogsDropdown: (baseUrl) => createUrl(baseUrl, `admin-panel-log-dropdown/`),
    getClientsDropdown: (baseUrl) => createUrl(baseUrl, `admin-panel-client-dropdown/`),
    // getFailedLogs: (baseUrl) => createUrl(baseUrl, 'admin-panel-failed-logs/'),
    getFailedLogs: (baseUrl) => createUrl(baseUrl, 'logs/:serviceType?status=failed'),
    getLogDropDownData: (baseUrl) => createUrl(baseUrl, `admin-panel-log-dropdown/`),
    exportFailedLogs: (baseUrl) => createUrl(baseUrl, `exports/:serviceType/`),
    getBusinessDetails: (baseUrl) => createUrl(baseUrl, `get-business-report/`),
    getTemplates: (baseUrl) => createUrl(baseUrl, `v2/get-template/`),
    changeDisplayName: (baseUrl) => createUrl(baseUrl, `register-number/:number`),
    exportBusinessDetails: (baseUrl) => createUrl(baseUrl, `get-business-report/export`),
};
