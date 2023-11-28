import { Injectable, inject } from '@angular/core';
import { Action, Store } from '@tethys/store';
import { updateCounter } from './actions';
interface DoubleCountState {
    count: number;
}
@Injectable()
export class DoubleCountStore extends Store<DoubleCountState> {
    doubleCountSelector(state: DoubleCountState) {
        return state.count;
    }

    doubleCount$ = this.select(this.doubleCountSelector);

    constructor() {
        super({ count: 0 });
    }

    @Action(updateCounter)
    updateCounter(type: string, count: number) {
        this.update({ count: this.snapshot.count + count * 2 });
    }
}
