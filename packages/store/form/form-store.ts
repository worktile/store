import { Injectable } from '@angular/core';
import { Store, setObjectValue } from '@tethys/store';

export interface FormModelState<T> {
    model: T;
    dirty: boolean;
    status: string;
    errors: {};
}

@Injectable()
export class FormStore<T = unknown> extends Store<T> {
    updateDirty(dirty: boolean, propertyKey: string) {
        this.update((state) => {
            return setObjectValue(state, `${propertyKey}.dirty`, true);
        });
    }
}
