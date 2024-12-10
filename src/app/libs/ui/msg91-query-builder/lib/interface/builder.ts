export interface FieldMap {
    [key: string]: Field;
}

export interface QueryBuilderConfig {
    fields: FieldMap;
}

export interface Field {
    id: number;
    phonebook_id: number;
    field_type_id: number;
    name: string;
    short_name: string;
    seq: number;
    is_custom_field: number;
    is_unique: number;
    deleted_at?: any;
    created_at: string;
    updated_at: string;
    is_visible: number;
    column_size: number;
    alignment: string;
    configurations?: any;
    is_ui_deletable: number;
    is_secured: number;
    permanently_deleted_on?: any;
    operators: Operator[];
    type: Type | string;
    value?: any;
}

export interface Type {
    id: number;
    name: string;
    configurations: any[];
    actual_type: string;
}

export interface Operator {
    label: string;
    mathematical_symbol: string;
    meta?: any;
}
