import { createUrl } from '@msg91/service';

export const SegmentoUrls = {
    getAllPhoneBooksUrl: (baseUrl) => createUrl(baseUrl, 'phonebooks'),
    getSegmentoCampaignListsUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/campaign/api/campaigns'),
    createPhoneBook: (baseUrl) => createUrl(baseUrl, 'phonebooks'),
    updatePhoneBook: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phoneBookId'),
    restorePhoneBook: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phoneBookId/restore'),
    purchaseCredits: (baseUrl) => createUrl(baseUrl, 'companyPlanServices/purchaseCredits'),
};
