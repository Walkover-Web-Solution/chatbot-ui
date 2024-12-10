import { Component, Input, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { IGetCustomAttributeResModel } from '@msg91/models/segmento-models';
import { BaseComponent } from '@msg91/ui/base-component';
import * as dayjs from 'dayjs';
import { cloneDeep } from 'lodash';
import { Observable, of } from 'rxjs';
import {
    EXTERNALLY_SHOW_DROP_DOWN,
    EXTERNALLY_SHOW_INPUT_NUMBER,
    HIDE_INPUT,
    SHOW_INPUT_TEXT_FORCEFULLY,
} from '../constant';
import { Operator, QueryBuilderConfig } from '../interface/builder';
import { Field } from '../interface/builder';
import { Rule, RuleSet } from '../interface/rule';
import { createForm, rulesObject } from '../util';

@Component({
    selector: 'msg91-query-builder',
    templateUrl: './msg91-query-builder.component.html',
    styleUrls: ['./msg91-query-builder.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class Msg91QueryBuilderComponent extends BaseComponent implements OnInit, OnDestroy {
    /** Form, which is use to create editor. */
    @Input() form: FormGroup;
    /** Use to get values from parent */
    @Input() config: QueryBuilderConfig;
    /** if it is greater than 0 then we have to hit addRuleSet function. */
    @Input() addRuleSetToRoot: number;
    /** if it is greater than 0 then we have to hit addRule function. */
    @Input() addRuleToRoot: number;
    @Input() showAsString: boolean = false;

    /** Hold option to not emit event on control changes. */
    private controlEmitEvent = { emitEvent: false };
    /** Hold key/value pair for condition between query. */
    protected conditionOptions = [
        { label: 'and', value: 'and' },
        { label: 'or', value: 'or' },
    ];
    /** Hide input field based on operator values. */
    protected hideInput = HIDE_INPUT;
    /** Externally show input type number if operator is bellow for date type field. */
    protected externallyShowInputNumber = EXTERNALLY_SHOW_INPUT_NUMBER;
    /** Externally show drop down if operator is bellow for date type field. */
    protected externallyShowDropDown = EXTERNALLY_SHOW_DROP_DOWN;
    /** Show input text forcefully if operator is bellow. */
    protected showInputTextForcefully = SHOW_INPUT_TEXT_FORCEFULLY;
    /** Hold meta key object available in any operator. */
    protected metaKeyValue = {};

    protected openSpan = "<span class='fw-bolder'>";
    protected closeSpan = '</span>';

    /** Hold array of config.fields. */
    public fields$: Observable<Field[]> = of([]);

    constructor() {
        super();
    }

    ngOnInit(): void {}

    ngOnChanges(simpleChanges: SimpleChanges): void {
        if (simpleChanges.config?.currentValue) {
            const config = this.config;
            if (typeof config === 'object') {
                const fields = Object.keys(config?.fields ?? {})
                    .map((value) => {
                        const field = config.fields[value];
                        field.value = field.value || value;
                        if (field.type === 'date') {
                            field.operators.forEach((e) => {
                                if (e.meta) {
                                    this.metaKeyValue = {
                                        ...this.metaKeyValue,
                                        [e.mathematical_symbol]: this.objToArrayKeyName(
                                            e.meta.operator_configurations,
                                            'label',
                                            'value'
                                        ),
                                    };
                                }
                            });
                        }
                        return field;
                    })
                    .sort((a: Field, b: Field) => a.seq - b.seq);
                this.fields$ = of(fields);
                // this.addRule(this.getRootRulesFormArray())
            }
        }
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    private updateValueAndValidity(control: AbstractControl) {
        control.updateValueAndValidity({ onlySelf: true });
    }

    private getRootRulesFormArray(): FormGroup {
        return (this.form.get('rules') as FormArray)?.at(0)?.get('rules') as FormGroup;
    }

    protected objToArrayKeyName(obj: { [key: string]: any }, keyName: string, valueKeyName: string) {
        return Object.keys(obj).reduce((acc, value) => {
            acc.push({
                [keyName]: value,
                [valueKeyName]: obj[value],
            });
            return acc;
        }, []);
    }

    protected fieldChange(event: { latest: string; old: string }, control: FormGroup, setOperator: boolean = true) {
        const field = this.config.fields[event.latest];
        const oldField = this.config.fields[event.old];
        if (field.type) {
            control.get('type').setValue(field.type);
            if (field.type === 'object') {
                this.addControlForObjectTypeField(control, true);
            } else {
                this.addControlForObjectTypeField(control, false);
            }
            // do not set operator value again if this function call from ts file.
            // and old and latest field type must be different.
            if (setOperator && oldField?.type !== field.type) {
                const whichIndexValueTook = field.type === 'object' ? 2 : 0;
                const operatorMathematicalSymbol = this.getDefaultOperatorValue(field.operators, whichIndexValueTook);
                control.get('operator').setValue(operatorMathematicalSymbol);
                this.operatorChange(operatorMathematicalSymbol, control);
            }
            if (oldField?.type !== field.type) {
                if (control.get('value')) {
                    control.get('value').setValue(undefined);
                }
            }
            control.updateValueAndValidity();
        }
    }

    protected operatorChange(event: any, control: FormGroup): void {
        // need to add check because on type of object we have to add/remove
        // two more control in form .
        if (control.get('type').value.toLowerCase() === 'object') {
            if (event !== '') {
                this.addControlForObjectTypeField(control, false);
            } else if (event === '') {
                this.addControlForObjectTypeField(control, true);
            }
        }

        if (control.get('type').value === 'date') {
            if (this.externallyShowDropDown.includes(control.get('operator').value)) {
                control.addControl(
                    'secondaryoperator',
                    new FormControl('', [Validators.required]),
                    this.controlEmitEvent
                );
            } else {
                control.removeControl('secondaryoperator', this.controlEmitEvent);
            }
        }

        // based on operator value we have to add/remove value control and add required validator.
        if (this.hideInput.includes(event)) {
            control.removeControl('value');
            this.updateValueAndValidity(control);
        } else {
            const value = control.get('value');
            if (value && !value?.hasValidator(Validators.required)) {
                value.addValidators(Validators.required);
                this.updateValueAndValidity(value);
            } else if (!value) {
                control.addControl('value', new FormControl(null, [Validators.required]));
            }
        }

        control.updateValueAndValidity();
    }

    protected onDateChange(event: MatDatepickerInputEvent<unknown, unknown>, control: FormGroup) {
        const stringDate: string = dayjs(event.value as string).format('YYYY-MM-DD HH:mm:ss');
        const value = control.get('value');
        value.setValue(stringDate, this.controlEmitEvent);
        this.updateValueAndValidity(value);
    }

    public addRule(parent: FormGroup) {
        const rule = this.getDefaultRuleValue();
        const rulesFormArray = parent?.get('rules') as FormArray;
        if (rulesFormArray) {
            const formGroup = createForm(rulesObject(rule)) as FormGroup;
            rulesFormArray.push(formGroup);
            this.fieldChange({ latest: rule.field, old: null }, formGroup, false);
            // we need this because we have to give time to FormControl to settle before get.
            // setTimeout(() => {
            //     this.fieldChange(rule.field, rulesFormArray.at(rulesFormArray.length - 1) as FormGroup)
            // }, 200);
        }
    }

    protected getDefaultRuleValue() {
        const value = this.getValueFromObservable(this.fields$)?.[0] ?? {};
        return {
            type: value.type,
            field: value.short_name,
            // operator: value.operators[0].mathematical_symbol ?? undefined,
            operator: this.getDefaultOperatorValue(value.operators, value.type === 'object' ? 2 : 0),
        };
    }

    protected getDefaultOperatorValue(operators: Operator[], index: number = 0) {
        return operators[index]?.mathematical_symbol ?? '';
    }

    public addRuleSet(parent: FormGroup) {
        (parent.get('rules') as FormArray).push(createForm({ condition: 'and', isRuleSet: true, rules: [] }));
    }

    protected removeRuleSet(formArray: FormArray, index: number) {
        (formArray as FormArray).removeAt(index);
    }

    protected removeRule(formArray: FormArray, index: number) {
        (formArray as FormArray).removeAt(index);
    }

    protected addControlForObjectTypeField(control: FormGroup, addOrRemove: boolean) {
        if (addOrRemove) {
            // setting empty so path operator select automatically.
            control.patchValue(
                {
                    operator: '',
                },
                this.controlEmitEvent
            );
            control.addControl('path', new FormControl('', [Validators.required]), this.controlEmitEvent);
            control.addControl('suboperator', new FormControl('', [Validators.required]), this.controlEmitEvent);
            control.addControl('isSubOperator', new FormControl(true), this.controlEmitEvent);
            // because path operator has empty value.
            const operator = control.get('operator');
            operator.removeValidators(Validators.required);
            this.updateValueAndValidity(operator);
        } else {
            control.removeControl('path', this.controlEmitEvent);
            control.removeControl('suboperator', this.controlEmitEvent);
            control.removeControl('isSubOperator', this.controlEmitEvent);
            // set again validator on change of operator.
            const operator = control.get('operator');
            operator.addValidators(Validators.required);
            this.updateValueAndValidity(operator);
        }
    }

    public subOperatorChange(event: string, control: FormGroup) {
        if (event === 'is null' || event === 'is not null') {
            control.removeControl('value', this.controlEmitEvent);
        } else {
            control.addControl('value', new FormControl('', [Validators.required]));
        }
        this.updateValueAndValidity(control);
    }

    public getStringQuery(rules?: RuleSet) {
        let localRules = rules ?? this.form.value;
        const newStr = this.openSpan + 'Where ' + this.closeSpan + this.recursiveFilterQueryCreate(localRules, []);
        return newStr;
    }

    private recursiveFilterQueryCreate(query: any, startWith = [], isRuleSet = false) {
        let space = ' ';
        let condition = query.condition;
        const newStr = query.rules.reduce((acc: string[], cur: any, index: number, array) => {
            let str = '';
            if (isRuleSet && index === 0) {
                str += this.openSpan + condition + ' Where ' + this.closeSpan;
            }
            if (cur.rules) {
                this.recursiveFilterQueryCreate(cur, startWith, cur.isRuleSet ? true : false);
            } else {
                if (index > 0) {
                    str += space + this.openSpan + condition + this.closeSpan + space;
                }
                const field = this.getFieldName(this.config.fields, cur?.field);
                str += field?.name;
                if (cur.isSubOperator) str += '.' + cur.path;
                str += space;
                let operator;
                if (cur.isSubOperator && cur.suboperator) {
                    const pathOperator = this.getOperator(field.operators, 'label', 'Path Operators');
                    operator = this.getOperator(pathOperator.operators, 'mathematical_symbol', cur.suboperator);
                } else {
                    operator = this.getOperator(field.operators, 'mathematical_symbol', cur.operator);
                }
                str += operator?.label + space;
                if (cur.value) {
                    str += cur.value + space;
                }
                if (cur.secondaryoperator && operator.meta?.operator_configurations) {
                    const configurations = operator.meta.operator_configurations;
                    const findKeyByValue = Object.keys(configurations).find(
                        (key) => configurations[key] === cur.secondaryoperator
                    );
                    str += findKeyByValue;
                }
            }
            if (str.length) {
                acc.push(str);
            }
            return acc;
        }, startWith);
        // return newStr.join(condition + space);
        return newStr.join('');
    }

    private getFieldName(fields, keyToCheck) {
        return fields[keyToCheck];
    }

    private getOperator(operators, keyToCheck, value) {
        const findOperator = operators.find((operator) => operator[keyToCheck] === value);
        return findOperator;
    }
}
