import { createUrl } from '@msg91/service';

export const AutomationUrls = {
    getAutomationsUrl: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phonebookId/automations'),
};
