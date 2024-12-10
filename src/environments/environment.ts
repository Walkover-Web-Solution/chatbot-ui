import { envVariables } from './env-variables';
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    server: 'https://test.msg91.com',
    adminServer: 'https://allu.msg91.com',
    env: 'local',
    basePath: '',
    ...envVariables,
};
