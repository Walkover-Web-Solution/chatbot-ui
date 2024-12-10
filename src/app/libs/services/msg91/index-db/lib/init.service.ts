import { isPlatformBrowser } from '@angular/common';
import * as dayjs from 'dayjs';
import { Observable } from 'rxjs';
import { createStore, createIndex, openDatabase, objectStoreExist } from './db';
import { IndexDbConfig, IndexStoreConfig } from './types';

export class InitService {
    /** when to expire database */
    private expireDate: dayjs.Dayjs;
    /** whether platform is browser or not */
    private isBrowser: boolean;
    /** db reference */
    protected indexedDB: any;
    /** include db name and version */
    protected dbConfigs: IndexDbConfig = {} as IndexDbConfig;
    /** hold current date dayjs object */
    private currentDate: dayjs.Dayjs = dayjs(new Date());

    constructor(
        public config: IndexDbConfig,
        public platformId: Object
    ) {
        if (config?.name && config?.version) {
            this.instantiateConfig(config);
        }
    }

    get expireOn(): dayjs.Dayjs {
        return this.expireDate;
    }

    get getCurrentDate(): dayjs.Dayjs {
        return this.currentDate;
    }

    get proceedFurther() {
        return this.currentDate.format('YYYY-MM-DD') < this.expireDate.format('YYYY-MM-DD');
    }

    /**
     * Init configuration by checking is current platform is browser,
     * checking that module receive database name and version
     *
     * @param {IndexDbConfig} dbConfig
     */
    private instantiateConfig(dbConfig: IndexDbConfig) {
        this.dbConfigs = dbConfig;
        this.dbConfigs.storeConfig = {
            autoIncrement: dbConfig?.storeConfig?.autoIncrement ?? false,
            ...(dbConfig?.storeConfig?.keyPath && {
                keyPath: dbConfig?.storeConfig?.keyPath,
            }),
        };
        if (dbConfig.expireIt) {
            this.setExpiry(dbConfig.expireIt);
        }
        this.isThisBrowser();
        this.initDbRef();
    }

    /**
     * is this is browser.
     */
    private isThisBrowser() {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    public recreateIndexDb(): void {
        indexedDB.deleteDatabase('hello_message_store');
        this.initDbRef();
    }

    private initDbRef() {
        if (this.isBrowser) {
            this.indexedDB =
                window.indexedDB ||
                window['mozIndexedDB'] ||
                window['webkitIndexedDB'] ||
                window['msIndexedDB'] ||
                window['shimIndexedDB'];

            if (!this.indexedDB) {
                console.error('IndexedDB could not be found in this browser.');
                return;
            }
            createStore(this.indexedDB, this.config.name, this.config.version, this.dbConfigs.objectStoresMeta);
            openDatabase(this.indexedDB, this.dbConfigs.name).then((db: any) => {
                if (db.version !== this.dbConfigs.version) {
                    this.dbConfigs.version = db.version;
                }
                db.close();
            });
        } else {
            console.warn('We only support browser.');
        }
    }

    private setExpiry(date: Date) {
        this.expireDate = dayjs(date);
    }

    public createTable(storeSchemas: any[]): void {
        if (!this.indexedDB) {
            return;
        }
        createStore(this.indexedDB, this.config.name, ++this.config.version, storeSchemas);
    }

    public createIndex(storeRef, indexStoreConfig: IndexStoreConfig) {
        if (!indexStoreConfig.indexName) {
            console.warn('Index name required to create index on table');
            return;
        }
        if (!indexStoreConfig.keyPath) {
            console.warn('keyPath required to create index on table');
            return;
        }
        createIndex(storeRef, indexStoreConfig.indexName, indexStoreConfig.keyPath, indexStoreConfig.options);
    }

    public tableExist(tableName: string) {
        return new Observable((obs) => {
            openDatabase(this.indexedDB, this.dbConfigs.name, this.dbConfigs.version)
                .then((dataBaseRef: IDBDatabase) => {
                    obs.next(objectStoreExist(dataBaseRef, tableName));
                    obs.complete();
                })
                .catch((e) => obs.error(e));
        });
    }

    protected DBExist(dataBaseName: string): Observable<IDBDatabaseInfo> {
        return new Observable((obs) => {
            this.indexedDB
                .databases()
                .then((res) => {
                    if (res?.length) {
                        obs.next(res.find((name) => name.name === dataBaseName));
                        obs.complete();
                    } else {
                        obs.next({});
                        obs.complete();
                    }
                })
                .catch((error) => obs.error(error));
        });
    }
}
