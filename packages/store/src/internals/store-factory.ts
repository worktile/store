import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Store } from '../store';

@Injectable()
export class StoreFactory implements OnDestroy {
    private static factory = new StoreFactory();

    static get instance() {
        return this.factory;
    }

    private storeInstancesMap = new Map<string, Store>();

    private storeInstancesMap$ = new BehaviorSubject<Map<string, Store>>(this.storeInstancesMap);

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

    ngOnDestroy(): void {}
}
