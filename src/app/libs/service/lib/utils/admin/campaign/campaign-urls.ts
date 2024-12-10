import { createUrl } from '../../base-url';

export const CampaignUrls = {
    getClientsData: (baseUrl) => createUrl(baseUrl, `admin/clientList`),
    getClientCountsData: (baseUrl) => createUrl(baseUrl, `admin/clientCounts`),
    getProcessedRecordData: (baseUrl) => createUrl(baseUrl, `admin/recordProcessed`),
};
