import { envVariables } from './env-variables';

export const environment = {
    production: true,
    server: 'https://control.msg91.com',
    env: 'prod',
    basePath: '',
    ...envVariables,
};
