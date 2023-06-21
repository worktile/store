import { Injectable } from '@angular/core';
import { FormControlStatus, ValidationErrors } from '@angular/forms';
import { Store, setObjectValue } from '@tethys/store';

export interface FormModelState<T> {
    model: T;
    dirty: boolean | null;
    // 字段类型和angular保持一致
    status: FormControlStatus | null;
    errors: ValidationErrors | null;
}

/**
 * 使用该方法在store中构建一个表单对象
 * @example
 * ````
 * class A extends Store<{ a: string, form: FormModelState<string> }>{
 *  constructor(){
 *      super({
 *          a: 'str',
 *          form: createFormModel('myForm')
 *      })
 *  }
 * }
 * ````
 *
 */
export function createFormModel<T>(
    model: T,
    options: {
        dirty: boolean | null,
        status: FormControlStatus | null,
        errors: ValidationErrors | null;
    } = {
        dirty: null,
        status: null,
        errors: null
    }
): FormModelState<T>{
    return {
        model,
        dirty: options.dirty,
        status: options.status,
        errors: options.errors
    }
}

@Injectable()
export class FormStore<T = unknown> extends Store<T> {
    updateDirty(dirty: boolean, propertyKey: string) {
        this.update((state) => {
            return setObjectValue(state, `${propertyKey}.dirty`, true);
        });
    }
}
