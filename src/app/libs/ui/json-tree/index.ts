export * from './lib/ui-json-tree.module';

export interface KeyValuePairSelectionEvent {
    path: string;
    key: string;
    value: string;
    checked: boolean;
}
