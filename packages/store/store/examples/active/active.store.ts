import { Injectable } from '@angular/core';
import { Id } from '@tethys/cdk/immutable';
import { Action, EntityState, EntityStore } from '@tethys/store';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface ActiveItem {
    id: number;
    title: string;
}

interface ActiveItemsState extends EntityState<ActiveItem> {}

@Injectable({ providedIn: 'root' })
export class ActiveItemsStore extends EntityStore<ActiveItemsState, ActiveItem> {
    static itemsSelector(state: ActiveItemsState) {
        return state.entities;
    }

    static activeIdSelector(state: ActiveItemsState) {
        return state.activeId;
    }

    constructor(private activeItemsApiService: ActiveItemsApiService) {
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
        return this.activeItemsApiService.fetchItems().pipe(
            tap((items) => {
                this.initialize(items);
            })
        );
    }
}

@Injectable({ providedIn: 'root' })
export class ActiveItemsApiService {
    fetchItems(): Observable<ActiveItem[]> {
        const initialItems: ActiveItem[] = [
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
