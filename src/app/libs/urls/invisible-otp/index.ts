import { createUrl } from '@msg91/service';

export const InvisibleOTPAdminUrls = {
    getLogs: (baseUrl) => createUrl(baseUrl, 'admin/logs'),
    getDialPlans: (baseUrl) => createUrl(baseUrl, 'admin/getDialPlans'),
    showDialPlan: (baseUrl) => createUrl(baseUrl, 'admin/showDialPlan/'),
    updateDialPlan: (baseUrl) => createUrl(baseUrl, 'admin/updateDialPlan/'),
    createDialPlan: (baseUrl) => createUrl(baseUrl, 'admin/createDialPlan'),
    getCountries: (baseUrl) => createUrl(baseUrl, 'admin/getCountries'),
    getOperatorPrice: (baseUrl) => createUrl(baseUrl, 'admin/getOperatorPrice'),
    // updateOperatorPrice: (baseUrl) => createUrl(baseUrl, 'admin/operatorPrice'),
    updateOperatorPrice: (baseUrl) => createUrl(baseUrl, 'admin/country/:id/prefixes'),
    sekuraCredentials: (baseUrl) => createUrl(baseUrl, 'admin/sekuraCredentials'),
    deleteDialPlanPricing: (baseUrl) => createUrl(baseUrl, 'admin/deleteDialPlanCountry/'),
};
