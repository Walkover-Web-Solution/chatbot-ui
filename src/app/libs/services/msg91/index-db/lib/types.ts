export interface IndexDbConfig {
    name: string;
    version: number;
    storeConfig?: {
        keyPath: string; // is the name of the field on the object that IndexedDB will use to identify it. Typically this is a unique number.
        autoIncrement: boolean; // by default false
    };
    // defaultTable: string
    objectStoresMeta?: ObjectStoreMeta[];
    expireIt?: Date;
}

export interface ObjectStoreMeta {
    store: string;
    storeConfig: {
        keyPath?: string | string[];
        autoIncrement: boolean;
        [key: string]: any;
    };
}

export interface IndexStoreConfig {
    indexName: string;
    keyPath: string;
    options?: {
        unique: boolean;
    };
}
