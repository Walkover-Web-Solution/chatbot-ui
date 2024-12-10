import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { HIDE_INPUT } from './constant';

export function inputRequiredReference() {
    return Validators.required;
}

export function rulesObject(value: any) {
    return {
        // entity: undefined,
        field: value.field ?? '',
        // isValid: false,
        operator: value.operator ?? undefined,
        type: value.type ?? 'text',
        value: value.value ?? undefined,
    };
}

export function createForm(query: any): FormGroup {
    if (query.condition === 'and' || query.condition === 'or') {
        const rulesArray = query.rules.map((rule) => createForm(rule));
        return new FormGroup({
            condition: new FormControl(query.condition),
            ...(query.isRuleSet && {
                isRuleSet: new FormControl(true),
            }),
            rules: new FormArray(rulesArray, [Validators.required]),
        });
    } else {
        const formGroup = Object.entries(query).reduce((acc, [key, value]) => {
            // console.log('key, value', query)
            const validations = decideToAddValidatorsOrNot(query, key);
            acc.addControl(key, new FormControl(value, validations));
            return acc;
        }, new FormGroup({}));
        return formGroup;
    }
}

function decideToAddValidatorsOrNot(rule: any, key: string) {
    if (HIDE_INPUT.includes(rule.operator) && key === 'value') {
        return [];
    }
    if (rule.operator === '') {
        return [];
    }
    return [Validators.required];
}
