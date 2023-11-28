import { Injectable, inject } from '@angular/core';
import { Action, dispatch, Store } from '@tethys/store';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { updateCounter } from './actions';

interface CounterState {
    count: number;
}

@Injectable()
export class CounterStore extends Store<CounterState> {
    static countSelector(state: CounterState) {
        return state.count;
    }

    constructor() {
        super({ count: 0 });
    }

    @Action(updateCounter)
    customUpdateCounter(type: string, count: number) {
        this.update({ count: this.snapshot.count + count });
    }

    @Action()
    increase() {
        return of(true).pipe(
            tap(() => {
                dispatch(updateCounter('increase', 1));
            })
        );
    }

    @Action()
    decrease() {
        return of(true).pipe(
            tap(() => {
                dispatch(updateCounter('decrease', -1));
            })
        );
    }
}
