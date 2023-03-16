import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Store } from '../store';
import { coerceArray } from '../utils';

@Injectable()
export class InternalStoreFactory implements OnDestroy {
    private static factory: InternalStoreFactory;

    static get instance() {
        if (!this.factory) {
            this.factory = new InternalStoreFactory();
        }
        return this.factory;
    }

    private storeInstancesMap = new Map<string, WeakRef<Store>>();

    public state$ = new Subject<{ storeId: string; state: unknown }>();

    register(store: Store) {
        this.storeInstancesMap.set(store.getStoreInstanceId(), new WeakRef(store));
    }

    unregister(store: Store) {
        this.storeInstancesMap.delete(store.getStoreInstanceId());
    }

    get(id: string) {
        if (this.storeInstancesMap?.get(id)?.deref()) {
            return this.storeInstancesMap?.get(id)?.deref();
        } else {
            this.storeInstancesMap.delete(id);
            return null;
        }
    }

    getStores(names: string | string[]) {
        const stores = [];
        Array.from(this.storeInstancesMap.values()).forEach((store) => {
            if (coerceArray(names).includes(store.deref()?.getName())) {
                stores.push(store.deref());
            }
        });
        return stores;
    }

    getAllState() {
        return Array.from(this.storeInstancesMap.entries()).reduce((state, [storeId, store]) => {
            state[storeId] = store.deref()?.getState();
            return state;
        }, {});
    }

    // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
    ngOnDestroy(): void {}
}
