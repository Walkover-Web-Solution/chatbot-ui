import { createUrl } from '../../base-url';

export const AdminEmailUniqueRecipientsUrls = {
    getMonthlyData: (baseUrl) => createUrl(baseUrl, 'domain-recipient-analytics'),
    getCustomRangeData: (baseUrl) => createUrl(baseUrl, 'analytics/mail/unique'),
};
