import { createUrl } from '@msg91/service';

export const dmarcUrls = {
    getDMARCDomainUrl: (baseUrl) => createUrl(baseUrl, 'dmarc-domains/'),
    createDMARCDomainUrl: (baseUrl) => createUrl(baseUrl, 'dmarc-domains/'),
    updateDMARCDomainUrl: (baseUrl) => createUrl(baseUrl, 'dmarc-domains-settings/:id'),
    getDMARCAnalyticsUrl: (baseUrl) => createUrl(baseUrl, 'dmarc-analytics'),
    getDMARCVolumeDistributionUrl: (baseUrl) => createUrl(baseUrl, 'volume-distribution-by-compliance'),
    verifyDMARCDomainUrl: (baseUrl) => createUrl(baseUrl, 'dmarc-domains/verify'),
    fetchDMARCFilterDataUrl: (baseUrl) => createUrl(baseUrl, 'dmarc-analytics-filters'),
};
