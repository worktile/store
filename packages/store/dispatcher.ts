import { Injectable } from '@angular/core';
import { ActionRef } from './action/action-definition';
import { isObject, isUndefinedOrNull } from '@tethys/cdk';
import { InternalStoreFactory } from './internals/internal-store-factory';
import { InternalDispatcher } from './internals/dispatcher';
import { StoreMetaInfo } from './inner-types';
import { META_KEY } from './types';
import { Store } from './store';
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
        const actionMeta = findActionMetaFromStore(store, action['id']);
        if (!actionMeta) {
            return;
        }
        InternalDispatcher.instance.dispatch(store.defaultStoreInstanceId, actionMeta, () => {
            return actionMeta.originalFn.call(store, ...action.payload);
        });
    });
}

function findActionMetaFromStore(store: Store, actionId: string) {
    var currentObj = store;
    while (currentObj !== null) {
        if (currentObj.hasOwnProperty(META_KEY)) {
            const meta = currentObj[META_KEY] as StoreMetaInfo;
            if (meta.actions && meta.actions[actionId]) {
                return meta.actions[actionId];
            }
        }
        currentObj = Object.getPrototypeOf(currentObj);
    }
    return undefined;
}
