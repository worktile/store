import { Injectable } from '@angular/core';
import { Action, Store } from '@tethys/store';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface CounterState {
    count: number;
}

@Injectable()
export class CounterStore extends Store<CounterState> {
    static countSelector(state: CounterState) {
        return state.count;
    }

    constructor() {
        super({
            count: 0
        });
    }

    @Action()
    increase() {
        return of(true).pipe(
            tap(() => {
                this.setState({ count: this.snapshot.count + 1 });
            })
        );
    }

    @Action()
    decrease() {
        return of(true).pipe(
            tap(() => {
                this.setState((state) => {
                    return {
                        count: state.count - 1
                    };
                });
            })
        );
    }
}
