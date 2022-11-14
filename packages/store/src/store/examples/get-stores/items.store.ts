import { Injectable } from '@angular/core';
import { Action, EntityState, EntityStore } from '@tethys/store';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Item {
    id: number;
    title: string;
    editing?: boolean;
}

interface ItemsState extends EntityState<Item> {}

let id: number;

@Injectable({ providedIn: 'root' })
export class ItemsStore extends EntityStore<ItemsState, Item> {
    static itemsSelector(state: ItemsState) {
        return state.entities;
    }

    constructor(private itemsApiService: ItemsApiService) {
        super(
            {
                entities: [],
                activeId: ''
            },
            { idKey: 'id' }
        );
    }

    @Action()
    fetchItems() {
        return this.itemsApiService.fetchItems().pipe(
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
                    title: title
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
export class ItemsApiService {
    fetchItems(): Observable<Item[]> {
        const initialItems: Item[] = [
            {
                id: 1,
                title: 'Item1'
            },
            {
                id: 2,
                title: 'Item2'
            },
            {
                id: 3,
                title: 'Item3'
            }
        ];
        return of(initialItems);
    }
}
