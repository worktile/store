import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Store } from '../store';
import { coerceArray } from '../utils';
import { newWeakRef, WeakRef } from '../weak-ref';

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
        this.storeInstancesMap.set(store.getStoreInstanceId(), newWeakRef(store));
    }

    unregister(store: Store) {
        this.storeInstancesMap.delete(store.getStoreInstanceId());
    }

    get(id: string) {
        const storeWeakRef = this.storeInstancesMap.get(id);
        if (storeWeakRef) {
            const store = storeWeakRef.deref();
            if (store) {
                return store;
            } else {
                this.storeInstancesMap.delete(id);
                return null;
            }
        } else {
            return null;
        }
    }

    getStores(predicate: (storeId: string, name: string, store?: string) => boolean) {
        const stores = [];
        this.storeInstancesMap.forEach((storeWeakRef, id) => {
            const store = storeWeakRef.deref();
            if (!store) {
                this.storeInstancesMap.delete(id);
                return;
            }
            if (predicate(id, store.getName())) {
                stores.push(store);
            }
        });
        return stores;
    }

    getAllStores() {
        return this.getStores((storeId: string, name: string) => {
            return true;
        });
    }

    getStoresByNames(names: string | string[]) {
        names = coerceArray(names);
        return this.getStores((storeId: string, name: string) => {
            return names.includes(name);
        });
    }

    getAllState() {
        return this.getAllStores().reduce((state, store) => {
            state[store.getStoreInstanceId()] = store.getState();
            return state;
        }, {});
    }

    // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
    ngOnDestroy(): void {}
}
