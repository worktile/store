import { Injectable } from '@angular/core';
import { Action, EntityState, EntityStore } from '@tethys/store';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { groupActions } from './actions';

export interface Page {
    _id: string;
    title: string;
}

interface PagesState extends EntityState<Page> {}

@Injectable({ providedIn: 'root' })
export class PagesStore extends EntityStore<PagesState, Page> {
    constructor() {
        super({ entities: [] }, {});
    }

    @Action()
    fetchPages() {
        const data = {
            pages: [
                { _id: '1', title: 'First Page Title' },
                { _id: '2', title: 'Second Page Title' },
                { _id: '3', title: 'Third Page Title' },
                { _id: '4', title: 'Fourth Page Title' }
            ]
        };
        return of(data).pipe(
            tap((data) => {
                this.initialize(data.pages);
            })
        );
    }

    @Action(groupActions.updateTitle)
    pureUpdateTitle(_id: string, payload: { title: string }) {
        this.update(_id, { title: payload.title });
    }
}
