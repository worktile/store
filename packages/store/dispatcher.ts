import { Injectable } from '@angular/core';
import { ActionRef } from './action/action-definition';
import { isObject, isUndefinedOrNull } from '@tethys/cdk';
import { InternalStoreFactory } from './internals/internal-store-factory';
import { InternalDispatcher } from './internals/dispatcher';
import { StoreMetaInfo } from './inner-types';
import { META_KEY } from './types';
@Injectable({
    providedIn: 'root'
})
export class Dispatcher {
    constructor() {}

    public dispatch(action: ActionRef) {
        dispatch(action);
    }
}

export function dispatch(action: ActionRef) {
    if (!isObject(action)) {
        throw new TypeError(`Action must be object`);
    } else if (isUndefinedOrNull(action.type)) {
        throw new TypeError(`Action must have a type property`);
    }
    invokeActions(action);
}

function invokeActions(action: ActionRef) {
    InternalStoreFactory.instance.getAllStores().forEach((store) => {
        const meta = store[META_KEY] as StoreMetaInfo;
        if (!meta || !meta.actions || !meta.actions[action.type]) {
            return;
        }
        const actionMeta = meta.actions[action.type];
        InternalDispatcher.instance.dispatch(store.defaultStoreInstanceId, actionMeta, () => {
            return actionMeta.originalFn.call(store, ...action.payload);
        });
    });
}
