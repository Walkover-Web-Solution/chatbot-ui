import { envVariables } from './env-variables';

export const environment = {
    production: false,
    server: 'https://test.msg91.com',
    adminServer: 'https://allu.msg91.com',
    env: 'development',
    basePath: '',
    ...envVariables,
};
