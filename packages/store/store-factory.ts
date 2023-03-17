import { Injectable } from '@angular/core';
import { InternalStoreFactory } from './internals/internal-store-factory';
import { Store } from './store';

@Injectable({ providedIn: 'root' })
export class StoreFactory {
    constructor() {}

    getStores<T = Store>(names: string | string[]): T[] {
        return InternalStoreFactory.instance.getStoresByNames(names) as unknown as T[];
    }
}
