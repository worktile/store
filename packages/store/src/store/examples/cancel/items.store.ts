import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Action, Store } from '@tethys/store';
import { of } from 'rxjs';
import { tap, delay } from 'rxjs/operators';

export interface TaskInfo {
    _id?: string;
    title: string;
    created_by?: string;
}

interface ItemsState {
    items: TaskInfo[];
}

@Injectable()
export class ItemsStore extends Store<ItemsState> {
    constructor(private http: HttpClient) {
        super({
            items: []
        });
    }

    @Action({ cancelUncompleted: 'self' })
    fetchItems() {
        return this.http.get<TaskInfo[]>('https://62f70d4273b79d015352b5e5.mockapi.io/items').pipe(
            tap((data) => {
                this.setState({ items: data });
            })
        );
    }

    @Action()
    hello() {
        throw new Error('xx');
    }
}
