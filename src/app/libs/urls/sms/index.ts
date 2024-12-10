import { createUrl } from '@msg91/service';

export const SmsTemplateUrls = {
    getSenderIds: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getSenderIds'),
    // Get Urls
    getAllSmsTemplateUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/getAllSmsTemplate'),
    getTemplateVersions: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/getTemplateVersions'),
    getTemplateVersionDetails: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/getTemplateVersionDetails'),

    // Post Urls
    addTemplate: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/addTemplate'),
    addTemplateVersion: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/addTemplateVersion'),
    updateTemplateVersion: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/updateTemplateVersion'),
    markVersionActive: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/markActive'),
    testDLT: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/testDLT'),

    // Delete Urls
    deleteTemplateVersion: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/deleteTemplateVersion'),
};

export const AuthKeyUrls = {
    getAllAuthenticationKeys: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getAllAuthenticationKeys'),
    generateAuthKey: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/generateAuthKey'),
    editNewAuthkey: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/editNewAuthkey'),
    deleteAuthkey: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/deleteAuthkey?authkey=:authkey'),
    getWhitelistedIPs: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getWhitelistedIPs'),
    enableDisableAuthkeyIPSecurity: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/enableDisableAuthkeyIPSecurity'),
    enableDisableAuthkey: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/enableDisableAuthkey'),
    addWhitelistIp: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/addWhitelistIp'),
    deleteWhitelistIP: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/deleteWhitelistIP'),
    getAllNonWhitelistedIPs: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getAllNonWhitelistedIPs'),
    apiPageAccessValidation: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/apiPageAccessValidation'),
    getIpSecuritySetting: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getIpSecuritySetting'),
    enableDisableIPSecurity: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/enableDisableIPSecurity'),
    getAuthenticationKeyActionDetails: (baseUrl) =>
        createUrl(baseUrl, 'api/v5/panel/getAuthenticationKeyActionDetails'),
    getAuthkeyUsecase: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/authkeyUsecase'),
    getMaskedOwnerContact: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getMaskedOwnerContact'),
    verifyAuthkeyPageAccess: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/verifyAuthkeyPageAccess'),
};

export const BlacklistNumbersUrls = {
    getBlockedNumbers: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getBlockedNumbers'),
    addBlockedNumbers: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/addBlockedNumbers'),
    deleteBlockedNumbers: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/deleteBlockedNumbers'),
    exportBlockedNumbers: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/exportBlockedNumbers'),
};

export const MessageDecodingUrls = {
    messageDecodingStatus: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/doubleDecode'),
};

export const ManageGroupUrls = {
    getAllMembersPaginatedUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getAllMembersPaginated'),
    getAllRoles: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getAllRoles'),
    addMemberUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/addMember'),
    getPermissionTemplatesUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getPermissionTemplates'),
    getMemberByIdUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getMemberById/:id'),
    getMemberPermissionsByIdUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getMemberPermission/:id'),
    updateMemberPermissionsUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/assignPermissionToMember'),
    getGroupListOfMember: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getGroupListOfMemeber/:id'),
    makeOwnerUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/makeOwner'),
    getReassignArticleAuthersUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getReassignArticleAuthors'),
    getReassignClientsUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getReassignClients'),
    removeAgentUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/removeAgent'),
    enableMemberUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/enableUser'),
    disableUser: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/disableUser'),
    resendInvite: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/resendInvite'),
    blockIp: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/blockIp'),
    getAllBlockedIps: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getAllBlockedIps'),
    enableMember: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/enableUser'),
    disableMember: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/disableUser'),
    updateMemberRoleUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/updateMemberRole'),
    getUserPermissionMappingById: (baseUrl) => createUrl(baseUrl, 'api/v5/access/getUserPermissionMappingById'),
};
