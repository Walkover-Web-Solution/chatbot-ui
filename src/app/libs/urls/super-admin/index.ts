import { createUrl } from '@msg91/service';

export const SuperAdminUrls = {
    getUsersList: (baseUrl) => createUrl(baseUrl, 'users'),
    updateUser: (baseUrl) => createUrl(baseUrl, 'users/:userID'),
    getMicroservices: (baseUrl) => createUrl(baseUrl, 'microservices'),
    getPermissions: (baseUrl) => createUrl(baseUrl, 'permissions'),
    updatePermission: (baseUrl) => createUrl(baseUrl, 'permissions/:permissionId'),
    getLogs: (baseUrl) => createUrl(baseUrl, 'proxyLogs/:route'),
    getAuditLogs: (baseUrl) => createUrl(baseUrl, 'admin/audit-logs'),
    // New User Permissions
    getUsersPermissions: (baseUrl) => createUrl(baseUrl, 'getPermissions'),
    getRoles: (baseUrl) => createUrl(baseUrl, 'roles'),
    getDefaultPermissions: (baseUrl) => createUrl(baseUrl, 'getDefaultPermissions'),
    setDefaultPermissions: (baseUrl) => createUrl(baseUrl, 'setDefaultPermissions'),
};
