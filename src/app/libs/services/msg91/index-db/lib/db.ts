import { Observable } from 'rxjs';
import { ObjectStoreMeta } from './types';

export function openDatabase(
    indexedDB: any,
    dbName: string,
    version?: number,
    upgradeCallback?: (event: any, db: any) => any | void
) {
    return new Promise((resolve, reject) => {
        if (!indexedDB) {
            reject('IndexedDB not available');
        }
        const request = indexedDB.open(dbName, version);
        request.onsuccess = (event) => {
            const db = event.target.result;
            // db.onversionchange = () => {
            //     db.close();
            // };
            resolve(db);
        };
        request.onerror = (event) => {
            reject(`IndexedDB error: ${request.error}`);
        };
        if (typeof upgradeCallback === 'function') {
            /**
             * event is triggered when we are trying to create a new database
             * or trying to upgrade the database with a new version.
             * @param event
             */
            request.onupgradeneeded = (event) => {
                upgradeCallback(event, event.target.result);
            };
        }
    });
}

export function createStore(indexedDB: any, dbName: string, version: string | number, storeSchemas: ObjectStoreMeta[]) {
    const request: IDBOpenDBRequest = indexedDB.open(dbName, version);
    request.onupgradeneeded = (event: any) => {
        const database = event.target.result;
        storeSchemas.forEach((storeSchema) => {
            if (!database.objectStoreNames.contains(storeSchema.store)) {
                database.createObjectStore(storeSchema.store, storeSchema.storeConfig);
            }
        });
        database.close();
    };
    request.onsuccess = (e: any) => {
        e.target.result.close();
    };
}

export function createIndex(store: any, indexName: string, keyPath: string = 'id', options: any = {}): IDBIndex {
    return store.createIndex(indexName, keyPath, options);
}

export function deleteObjectStore(dbName: string, version: number, storeName: string) {
    if (!dbName || !version || !storeName) {
        throw Error('Params: "dbName", "version", "storeName" are mandatory.');
    }
    return new Observable((obs) => {
        try {
            const newVersion = version + 1;
            const request = indexedDB.open(dbName, newVersion);
            request.onupgradeneeded = (event: any) => {
                const database = event.target.result;
                database.deleteObjectStore(storeName);
                database.close();
                obs.next(true);
                obs.complete();
            };
            request.onerror = (e) => obs.error(e);
        } catch (error) {
            obs.error(error);
        }
    });
}

export function objectStoreExist(database: IDBDatabase, storeNameToCheck: string) {
    return database.objectStoreNames.contains(storeNameToCheck);
}
