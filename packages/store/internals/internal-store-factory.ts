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

    private storeInstancesMap = new Map<string, Store>();

    public state$ = new Subject<{ storeId: string; state: unknown }>();

    register(store: Store) {
        this.storeInstancesMap.set(store.getStoreInstanceId(), store);
    }

    unregister(store: Store) {
        this.storeInstancesMap.delete(store.getStoreInstanceId());
    }

    get(id: string) {
        return this.storeInstancesMap.get(id);
    }

    getStores(names: string | string[]) {
        return Array.from(this.storeInstancesMap.values()).filter((store) => {
            return coerceArray(names).includes(store.getName());
        });
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
