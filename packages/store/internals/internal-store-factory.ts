import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { SafeAny } from '../inner-types';
import { Store } from '../store';
import { coerceArray } from '../utils';
import { newWeakRef, WeakRef } from '../weak-ref';

@Injectable()
export class InternalStoreFactory implements OnDestroy {
    private static factory: InternalStoreFactory;

    private currentId: number = 0;

    static get instance() {
        if (!this.factory) {
            this.factory = new InternalStoreFactory();
        }
        return this.factory;
    }

    private storeInstancesMap = new Map<string, WeakRef<Store<SafeAny>>>();

    public state$ = new Subject<{ storeId: string; state: unknown }>();

    generateId(): number {
        this.currentId += 1;
        return this.currentId;
    }

    register(store: Store<SafeAny>) {
        this.storeInstancesMap.set(store.getStoreInstanceId(), newWeakRef(store));
    }

    unregister(store: Store<SafeAny>) {
        this.storeInstancesMap.delete(store.getStoreInstanceId());
    }

    get(id: string): Store<SafeAny> | null {
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

    getStores(predicate: (storeId: string, name: string, store?: string) => boolean): Store<SafeAny>[] {
        const stores: Store<SafeAny>[] = [];
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

    getAllState(): Record<string, SafeAny> {
        return this.getAllStores().reduce(
            (state, store) => {
                state[store.getStoreInstanceId()] = store.getState();
                return state;
            },
            {} as Record<string, SafeAny>
        );
    }

    // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
    ngOnDestroy(): void {}
}
