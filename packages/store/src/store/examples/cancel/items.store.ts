import { Injectable } from '@angular/core';
import { Action, Store } from '@tethys/store';
import { of } from 'rxjs';
import { tap, delay } from 'rxjs/operators';

interface ItemsState {
    items: string[];
}

@Injectable()
export class ItemsStore extends Store<ItemsState> {
    constructor() {
        super({
            items: []
        });
    }

    @Action({ cancelUncompleted: 'self' })
    fetchItems() {
        return of(['Item 1', 'Item 2']).pipe(
            delay(1000),
            tap((data) => {
                // throw new Error(`sss`);
                this.setState({ items: data });
            })
        );
    }

    @Action()
    hello() {
        throw new Error('xx');
    }
}
