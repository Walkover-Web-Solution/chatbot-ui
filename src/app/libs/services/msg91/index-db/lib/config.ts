import { InjectionToken } from '@angular/core';

export const INDEX_DB_CONFIG = new InjectionToken(null);
export var DBMode;
(function (DBMode) {
    DBMode['readonly'] = 'readonly';
    DBMode['readwrite'] = 'readwrite';
})(DBMode || (DBMode = {}));
