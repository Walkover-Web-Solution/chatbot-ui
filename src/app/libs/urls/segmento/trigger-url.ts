import { createUrl } from '@msg91/service';

export const TriggerUrls = {
    getTriggersUrl: (baseUrl) => createUrl(baseUrl, 'segments/:segmentId/triggers'),
    createTriggerUrl: (baseUrl) => createUrl(baseUrl, 'segments/:segmentId/triggers'),
    getUpdateDeleteTrigger: (baseUrl) => createUrl(baseUrl, 'segments/:segmentId/triggers/:triggerId'),
    getTriggersLogs: (baseUrl) => createUrl(baseUrl, 'segments/:segmentId/triggersLogs'),
    getTriggersIgnoreTimes: (baseUrl) => createUrl(baseUrl, 'triggersIgnoreTimes'),
    validateOrModifySegment: (baseUrl) =>
        createUrl(baseUrl, 'phonebooks/:phonebookId/segments/:segmentId/validateOrModifySegment'),
};
