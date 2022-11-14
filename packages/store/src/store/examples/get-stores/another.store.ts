import { Injectable } from '@angular/core';
import { Action, EntityState, EntityStore } from '@tethys/store';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Item } from './items.store';

interface AnotherItemsState extends EntityState<Item> {}

let id: number;

@Injectable({ providedIn: 'root' })
export class AnotherItemsStore extends EntityStore<AnotherItemsState, Item> {
    static itemsSelector(state: AnotherItemsState) {
        return state.entities;
    }

    constructor(private anotherItemsApiService: AnotherItemsApiService) {
        super(
            {
                entities: []
            },
            { idKey: 'id' }
        );
    }

    @Action()
    fetchItems() {
        return this.anotherItemsApiService.fetchItems().pipe(
            tap((items) => {
                id = items.length;
                this.initialize(items);
            })
        );
    }

    @Action()
    addItem(title: string) {
        return of(true).pipe(
            tap(() => {
                this.add({
                    id: ++id,
                    title: 'Another ' + title
                });
            })
        );
    }

    @Action()
    updateItem(item: Item, title: string) {
        if (title.length === 0) {
            return this.remove(item.id);
        }
        this.update(item.id, {
            editing: false,
            title: title
        });
    }

    @Action()
    removeItem(item: Item) {
        this.remove(item.id);
    }
}

@Injectable({ providedIn: 'root' })
export class AnotherItemsApiService {
    fetchItems(): Observable<Item[]> {
        const initialItems: Item[] = [
            {
                id: 1,
                title: 'Another Item1'
            },
            {
                id: 2,
                title: 'Another Item2'
            },
            {
                id: 3,
                title: 'Another Item3'
            }
        ];
        return of(initialItems);
    }
}
