import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { CounterStore } from './counter.store';
import { DoubleCountStore } from './doubleCount.store';

@Component({
    selector: 'thy-store-counter-example',
    templateUrl: './counter.component.html',
    styleUrls: ['./counter.component.scss']
})
export class ThyStoreCounterExampleComponent implements OnInit {
    count$: Observable<number> = this.counterStore.select(CounterStore.countSelector);

    doubleCount$: Observable<number> = this.doubleCountStore.doubleCount$;

    constructor(public counterStore: CounterStore, public doubleCountStore: DoubleCountStore) {}

    // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
    ngOnInit(): void {}

    increase() {
        this.counterStore.increase();
    }

    decrease() {
        this.counterStore.decrease();
    }
}
