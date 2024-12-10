import { InjectionToken } from '@angular/core';
/** Defines the injection token for providing 'environment' variables of a project to a
 * lib
 */
export const ENVIRONMENT_TOKEN = new InjectionToken('environment');

export const ENVIRONMENT_TOKEN_NOT_PROVIDED_ERROR = `No environment found: AppModule module initialized without providing 'ENVIRONMENT_TOKEN' token. `;
