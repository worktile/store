import { Injectable } from '@angular/core';
import { InternalStoreFactory } from './internals/internal-store-factory';

@Injectable({ providedIn: 'root' })
export class StoreFactoryService {
    constructor() {}

    getStores(names: string | string[]) {
        return InternalStoreFactory.instance.getStores(names);
    }
}
