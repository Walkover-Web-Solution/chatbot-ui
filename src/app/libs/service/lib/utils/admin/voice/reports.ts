import { createUrl } from '../../base-url';

export const AdminVoiceReportsUrls = {
    // getAdminVoiceReports: (baseUrl) => createUrl(baseUrl, 'call-logs/'),
    getAdminVoiceReports: (baseUrl) => createUrl(baseUrl, 'logs/voice'),
    getAdminVoiceCallRecording: (baseUrl) => createUrl(baseUrl, 'call-logs/recording/:id'),
    getCallServersList: (baseUrl) => createUrl(baseUrl, 'call-server/'),
    columnsFilter: (baseUrl) => createUrl(baseUrl, 'call-logs/columns/'),
};
