import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Action, Store } from '@tethys/store';
import { of } from 'rxjs';
import { tap, delay } from 'rxjs/operators';

export interface Todo {
    _id?: string;
    title: string;
    created_by?: string;
}

interface TodosState {
    items: Todo[];
}

@Injectable()
export class TodosStore extends Store<TodosState> {
    private http = inject(HttpClient);

    constructor() {
        super({
            items: []
        });
    }

    @Action({ cancelUncompleted: 'self' })
    fetchItems() {
        return this.http.get<Todo[]>('https://62f70d4273b79d015352b5e5.mockapi.io/items').pipe(
            tap((data) => {
                this.update({ items: data });
            })
        );
    }

    @Action()
    hello() {
        throw new Error('xx');
    }
}
