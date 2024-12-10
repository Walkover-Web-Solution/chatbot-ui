import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { from, Observable, take } from 'rxjs';
import { DBMode, INDEX_DB_CONFIG } from './config';
import { openDatabase } from './db';
import { InitService } from './init.service';
import { ServicesMsg91IndexDbModule } from './services-msg91-index-db.module';
import { IndexDbConfig } from './types';
import { createTransaction, optionsGenerator, validateBeforeTransaction } from './utils';

// import { select, Store } from '@ngrx/store';
// import { IAppState } from 'apps/msg91/src/app/store/reducers/app.state';
// import { selectRootCompanySetting } from 'apps/msg91/src/app/store/selectors';

@Injectable({
    providedIn: ServicesMsg91IndexDbModule,
})
export class IndexDBService extends InitService {
    private companySetting: any;
    private popKeyToNotAllowToIN = ['deleteDatabase', 'DBExist', 'companyDetail'];

    /**
     * we are using here optional to not throw error while using this service in
     * place
     * 1. TemplateFormModule (error here)
     * this service module is already added to SharedComponentsModule thats why it was not
     * give error on run in mail-chat-footer which use TemplateFormModule, but it give error if we use it in mail
     * compose wrapper because TemplateFormModule also part of MailComposeModule.
     */
    constructor(
        @Optional() @Inject(INDEX_DB_CONFIG) public config: IndexDbConfig,
        @Inject(PLATFORM_ID) public platformId: Object // private store: Store<IAppState>
    ) {
        super(config, platformId);
        // this.companySetting = this.companyDetail();
        return this.setUpProxy();
    }

    /**
     * need to remove company detail related changes because on prod not need.
     * @returns {any}
     */
    // private companyDetail() {
    //     let detail = null;
    //     this.store.pipe(select(selectRootCompanySetting), take(1)).subscribe((res) => (detail = res));
    //     return detail;
    // }

    /**
     * setting proxy to current class so we can add middleware which can call before any class method call,
     * so in middleware we can check db is expired or not.
     * we choose this approach instead of individually go to each class method and add.
     * @returns
     */
    private setUpProxy() {
        /**
         * The handler.get() method is a trap for the [[Get]] object internal method,
         * which is used by operations such as property accessors
         * example: new Proxy(target, handler)
         * @param target A target object to wrap with Proxy
         * @param handler An object whose properties are functions that define the behavior of
         *                the proxy when an operation is performed on it.
         */
        return new Proxy(this, {
            /**
             * The handler.get() method is a trap for the [[Get]] object internal method,
             * which is used by operations such as
             * @param target The target object
             * @param propKey The name or Symbol of the property to get.
             * @param receiver Either the proxy or an object that inherits from the proxy.
             * @returns
             */
            get(target: any, propKey: string, receiver): any {
                /**
                 * Returns the value of the property. Works like getting a property from an object,
                 * It is an alternative to using the dot notation or square bracket notation for property access.
                 */
                const propValue = Reflect.get(target, propKey, receiver);
                // If the property value is a function (method), apply middleware
                if (typeof propValue === 'function' && !target.popKeyToNotAllowToIN.includes(propKey)) {
                    /**
                     * call middle ware function.
                     */
                    const middleware = target.middleware(propValue);
                    return function (...args: any[]): any {
                        return middleware.call(this, ...args);
                    };
                }
                return propValue;
            },
        });
    }

    /**
     * Calls each time class method calls.
     *
     * @param next
     * @returns {function}
     */
    public middleware(next: Function): Function {
        return function async(...args) {
            // if db is not expired, ashishj 2 company hardcode check.
            if (this.proceedFurther) {
                // && +this.companySetting.id !== 278731
                return next.call(this, ...args); // Call the next method in the chain
            } else {
                // if database exist then we have to delete it here.
                return new Observable((obs) => {
                    this.DBExist(this.dbConfigs.name).subscribe({
                        next: (dataBase) => {
                            if (dataBase?.name) {
                                this.deleteDatabase().subscribe({
                                    next: (deleted: boolean) => {
                                        if (deleted) {
                                            obs.next({});
                                            console.warn('Data base is expired.');
                                            obs.complete();
                                        }
                                    },
                                    error: (error) => {
                                        obs.error(error);
                                    },
                                });
                            } else {
                                obs.next(null);
                                obs.complete();
                            }
                        },
                        error: (error) => obs.error(error),
                    });
                });
            }
        };
    }

    /**
     * Return all elements from one store
     * @param storeName The name of the store to select the items
     */
    getAll(storeName): Observable<any> {
        return new Observable((obs) => {
            openDatabase(this.indexedDB, this.dbConfigs.name, this.dbConfigs.version)
                .then((db: any) => {
                    validateBeforeTransaction(db, storeName, (e) => obs.error(e));
                    const transaction = createTransaction(
                        db,
                        optionsGenerator(DBMode.readonly, storeName, obs.error, obs.next)
                    );
                    const objectStore = transaction.objectStore(storeName);
                    const request = objectStore.getAll();
                    request.onerror = (evt) => {
                        db.close();
                        obs.error(evt);
                    };
                    request.onsuccess = ({ target: { result: ResultAll } }) => {
                        db.close();
                        obs.next(ResultAll);
                        obs.complete();
                    };
                })
                .catch((error) => {
                    obs.error(error);
                });
        });
    }

    /**
     * Returns the number of rows in a store.
     * @param storeName The name of the store to query
     * @param keyRange  The range value and criteria to apply.
     */
    count(storeName, keyRange): Observable<number> {
        return new Observable((obs) => {
            openDatabase(this.indexedDB, this.dbConfigs.name, this.dbConfigs.version)
                .then((db: any) => {
                    validateBeforeTransaction(db, storeName, (e) => obs.error(e));
                    const transaction = createTransaction(
                        db,
                        optionsGenerator(DBMode.readonly, storeName, obs.error, obs.next)
                    );
                    const objectStore = transaction.objectStore(storeName);
                    const request = objectStore.count(keyRange);
                    request.onerror = (e) => {
                        db.close();
                        obs.error(e);
                    };
                    request.onsuccess = (e) => {
                        db.close();
                        obs.next(e.target.result);
                        obs.complete();
                    };
                })
                .catch((reason) => obs.error(reason));
        });
    }

    /**
     * Adds new entry in the store and returns its key
     * @param storeName The name of the store to add the item
     * @param value The entry to be added
     * @param key The optional key for the entry
     */
    add(storeName, value, key): Observable<any> {
        return new Observable((obs) => {
            openDatabase(this.indexedDB, this.dbConfigs.name, this.dbConfigs.version)
                .then((db: any) => {
                    const transaction = createTransaction(
                        db,
                        optionsGenerator(
                            DBMode.readwrite,
                            storeName,
                            (e) => obs.error,
                            () => {}
                        )
                    );
                    const objectStore = transaction.objectStore(storeName);
                    const request = Boolean(key) ? objectStore.add(value, key) : objectStore.add(value);
                    request.onsuccess = async (evt) => {
                        const result = evt.target.result;
                        const getRequest = objectStore.get(result);
                        getRequest.onsuccess = (event) => {
                            db.close();
                            obs.next(event.target.result);
                            obs.complete();
                        };
                        getRequest.onerror = (event) => {
                            obs.error(event);
                        };
                    };
                    request.onerror = (event) => {
                        obs.error(event);
                    };
                })
                .catch((error) => obs.error(error));
        });
    }

    /**
     * Returns entry by key.
     * @param storeName The name of the store to query
     * @param key The entry key
     */
    getByKey(storeName, key): Observable<any> {
        return new Observable((obs) => {
            openDatabase(this.indexedDB, this.dbConfigs.name, this.dbConfigs.version)
                .then((db: any) => {
                    const transaction = createTransaction(
                        db,
                        optionsGenerator(DBMode.readonly, storeName, obs.error, obs.next)
                    );
                    const objectStore = transaction.objectStore(storeName);
                    const request = objectStore.get(key);
                    request.onsuccess = (event) => {
                        db.close();
                        obs.next(event.target.result);
                        obs.complete();
                    };
                    request.onerror = (event) => {
                        obs.error(event);
                    };
                })
                .catch((error) => obs.error(error));
        });
    }

    /**
     * Adds or updates a record in store with the given value and key. Return all items present in the store
     * @param storeName The name of the store to update
     * @param value The new value for the entry
     */
    update(storeName, value, key?: any): Observable<any> {
        return new Observable((obs) => {
            openDatabase(this.indexedDB, this.dbConfigs.name, this.dbConfigs.version)
                .then((db: any) => {
                    validateBeforeTransaction(db, storeName, (e) => obs.error(e));
                    const transaction = createTransaction(
                        db,
                        optionsGenerator(
                            DBMode.readwrite,
                            storeName,
                            (e) => obs.error(e),
                            (e) => obs.next(e)
                        )
                    );
                    const objectStore = transaction.objectStore(storeName);
                    const request = Boolean(key) ? objectStore.put(value, key) : objectStore.put(value);
                    request.onsuccess = async (evt) => {
                        const result = evt.target.result;
                        const getRequest = objectStore.get(result);
                        getRequest.onsuccess = (event) => {
                            db.close();
                            obs.next(event.target.result);
                            obs.complete();
                        };
                    };
                })
                .catch((reason) => obs.error(reason));
        });
    }

    /**
     * Returns all items from the store after delete.
     * @param storeName The name of the store to have the entry deleted
     * @param key The key of the entry to be deleted
     */
    delete(storeName, key): Observable<any> {
        return new Observable((obs) => {
            openDatabase(this.indexedDB, this.dbConfigs.name, this.dbConfigs.version)
                .then((db: any) => {
                    validateBeforeTransaction(db, storeName, (e) => obs.error(e));
                    const transaction = createTransaction(
                        db,
                        optionsGenerator(
                            DBMode.readwrite,
                            storeName,
                            (e) => obs.error(e),
                            (s) => obs.next(s)
                        )
                    );
                    const objectStore = transaction.objectStore(storeName);
                    objectStore.delete(key);
                    transaction.oncomplete = () => {
                        this.getAll(storeName)
                            .pipe(take(1))
                            .subscribe((newValues) => {
                                db.close();
                                obs.next(newValues);
                                obs.complete();
                            });
                    };
                })
                .catch((reason) => obs.error(reason));
        });
    }

    /**
     * Returns true from the store after a successful delete.
     * @param storeName The name of the store to have the entry deleted
     * @param key The key of the entry to be deleted
     */
    deleteByKey(storeName, key): Observable<boolean> {
        return new Observable((obs) => {
            openDatabase(this.indexedDB, this.dbConfigs.name, this.dbConfigs.version)
                .then((db: any) => {
                    validateBeforeTransaction(db, storeName, (e) => obs.error(e));
                    const transaction = createTransaction(
                        db,
                        optionsGenerator(
                            DBMode.readwrite,
                            storeName,
                            (e) => obs.error(e),
                            () => {}
                        )
                    );
                    const objectStore = transaction.objectStore(storeName);
                    transaction.oncomplete = () => {
                        db.close();
                        obs.next(true);
                        obs.complete();
                    };
                    objectStore.delete(key);
                })
                .catch((reason) => obs.error(reason));
        });
    }

    /**
     * Returns true if successfully delete the DB.
     */
    deleteDatabase(): Observable<boolean> {
        return new Observable((obs) => {
            openDatabase(this.indexedDB, this.dbConfigs.name, this.dbConfigs.version)
                .then(async (db: any) => {
                    await db.close();
                    const deleteDBRequest = this.indexedDB.deleteDatabase(this.dbConfigs.name);
                    deleteDBRequest.onsuccess = () => {
                        obs.next(true);
                        obs.complete();
                    };
                    deleteDBRequest.onerror = (error) => obs.error(error);
                    deleteDBRequest.onblocked = () => {
                        throw new Error(`Unable to delete database because it's blocked`);
                    };
                })
                .catch((error) => obs.error(error));
        });
    }

    /**
     * Delete entries in the store and returns current entries in the store
     * @param storeName The name of the store to add the item
     * @param keys The keys to be deleted
     */
    bulkDelete(storeName, keys) {
        const promises = keys.map((key) => {
            return new Promise((resolve, reject) => {
                openDatabase(this.indexedDB, this.dbConfigs.name, this.dbConfigs.version)
                    .then((db) => {
                        const transaction = createTransaction(
                            db,
                            optionsGenerator(DBMode.readwrite, storeName, reject, resolve)
                        );
                        const objectStore = transaction.objectStore(storeName);
                        objectStore.delete(key);
                        transaction.oncomplete = () => {
                            this.getAll(storeName)
                                .pipe(take(1))
                                .subscribe((newValues) => {
                                    resolve(newValues);
                                });
                        };
                    })
                    .catch((reason) => reject(reason));
            });
        });
        return from(Promise.all(promises));
    }
}
