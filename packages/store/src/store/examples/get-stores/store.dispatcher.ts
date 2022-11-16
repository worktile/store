import { Injectable } from '@angular/core';
import { EntityStore, StoreFactoryService } from '@tethys/store';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Item } from './items.store';

export interface StoreUpdatable extends EntityStore<any, Item> {
    addItem(title: string): Observable<boolean>;

    updateItem(item: Item, title: string): Observable<boolean>;

    removeItem(item: Item): Observable<boolean>;
}

let stores: StoreUpdatable[] = [];

@Injectable({ providedIn: 'root' })
export class StoreDispatcher {
    constructor(private storeFactory: StoreFactoryService) {
        stores = this.storeFactory.getStores(['ItemsStore', 'AnotherItemsStore']) as StoreUpdatable[];
    }

    addItem(title: string) {
        return of(true).pipe(
            tap(() => {
                stores.forEach((store: StoreUpdatable) => {
                    store.addItem(title);
                });
            })
        );
    }

    updateItem(item: Item, title: string) {
        return of(true).pipe(
            tap(() => {
                stores.forEach((store: StoreUpdatable) => {
                    store.updateItem(item, title);
                });
            })
        );
    }

    removeItem(item: Item) {
        return of(true).pipe(
            tap(() => {
                stores.forEach((store: StoreUpdatable) => {
                    store.removeItem(item);
                });
            })
        );
    }
}
