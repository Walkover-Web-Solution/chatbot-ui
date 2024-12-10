import { createUrl } from '@msg91/service';

export const SearchWithAiUrls = {
    getEventTypes: (baseUrl: string) => createUrl(baseUrl, 'suggestions/:phoneBookId/event_types'),
    getProducts: (baseUrl: string) => createUrl(baseUrl, 'suggestions/:phoneBookId/products'),
    getOperators: (baseUrl: string) => createUrl(baseUrl, 'operations'),
    getAllContactsSearchByAiQuery: (baseUrl: string) => createUrl(baseUrl, 'event/filter/:phoneBookId'),
    getUserJourney: (baseUrl: string) => createUrl(baseUrl, 'userEvents/:phoneBookId'),
};
