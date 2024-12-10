import { createUrl } from '@msg91/service';

export const ConnectionsUrls = {
    getConnections: (baseUrl) => createUrl(baseUrl, 'integrations/'),
};
