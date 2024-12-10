import { createUrl } from '@msg91/service';

export const DemoUrls = {
    sendDemoOtp: (baseUrl) => createUrl(baseUrl, 'api/v5/otp/sendDemoOtp'),
    verifyDemoOtp: (baseUrl) => createUrl(baseUrl, 'api/v5/otp/verifyDemoOtp'),
    resendDemoOtpViaCall: (baseUrl) => createUrl(baseUrl, 'api/v5/otp/resendDemoOtpViaCall'),
    getAllWidgetIntegrations: (baseUrl) => createUrl(baseUrl, 'api/v5/otpwidget/api/widgetIntegration'),
    addWidgetIntegraion: (baseUrl) => createUrl(baseUrl, 'api/v5/otpwidget/api/widgetIntegration'),
    enableDisableWidgetIntegration: (baseUrl) =>
        createUrl(baseUrl, 'api/v5/otpwidget/api/enableDisableWidgetIntegration'),
    getWidgetProcess: (baseUrl) => createUrl(baseUrl, 'api/v5/otpwidget/api/widgetIntegration?widgetId='),
    getChannels: (baseUrl) => createUrl(baseUrl, 'api/v5/otpwidget/api/getChannels'),
    updateWidgetIntegraion: (baseUrl) => createUrl(baseUrl, 'api/v5/otpwidget/api/widgetIntegration/:widgetId'),
    getCountries: (baseUrl) => createUrl(baseUrl, 'api/v5/otpwidget/api/getCountries'),
    demoIdentifiers: (baseUrl, widgetId) => createUrl(baseUrl, `api/v5/otpwidget/api/${widgetId}/demoIdentifiers`),
    deleteDemoIdentifiers: (baseUrl, widgetId, demoId) =>
        createUrl(baseUrl, `api/v5/otpwidget/api/${widgetId}/demoIdentifiers/${demoId}`),
    otpWebhook: (baseUrl, widgetId) => createUrl(baseUrl, `api/v5/otpwidget/api/${widgetId}/webhook`),
    deleteOTPWebhook: (baseUrl, widgetId, webhookId) =>
        createUrl(baseUrl, `api/v5/otpwidget/api/${widgetId}/webhook/${webhookId}`),
};
