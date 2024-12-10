export interface Rule {
    field: string;
    value?: any;
    operator?: string;
    isValid?: boolean;
    configurations?: any;
    type: string;
    isSubOperator?: boolean;
    suboperator?: string;
    path?: string;
}

export interface RuleSet {
    condition?: string;
    rules?: Array<RuleSet | Rule>;
    collapsed?: boolean;
}
