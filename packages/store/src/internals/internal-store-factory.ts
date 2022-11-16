import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Store } from '../store';
import { coerceArray, flatten } from '../utils';

@Injectable()
export class InternalStoreFactory implements OnDestroy {
    private static factory = new InternalStoreFactory();

    static get instance() {
        return this.factory;
    }

    private storeInstancesMap = new Map<string, Store>();

    private storeInstancesMapByName = new Map<string, Store[]>();

    public state$ = new Subject<{ storeId: string; state: unknown }>();

    register(store: Store) {
        this.storeInstancesMap.set(store.getStoreInstanceId(), store);
        const name = store.getName();
        if (this.storeInstancesMapByName.has(name)) {
            this.storeInstancesMapByName.set(name, [...this.storeInstancesMapByName.get(name), store]);
        } else {
            this.storeInstancesMapByName.set(name, [store]);
        }
    }

    unregister(store: Store) {
        this.storeInstancesMap.delete(store.getStoreInstanceId());
        this.storeInstancesMapByName.delete(store.getName());
    }

    get(id: string) {
        return this.storeInstancesMap.get(id);
    }

    getStores(names: string | string[]) {
        const stores = coerceArray(names).map((name) => {
            return this.storeInstancesMapByName.get(name);
        });
        return flatten(stores, []);
    }

    getAllState() {
        return Array.from(this.storeInstancesMap.entries()).reduce((state, [storeId, store]) => {
            state[storeId] = store.getState();
            return state;
        }, {});
    }

    // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
    ngOnDestroy(): void {}
}
