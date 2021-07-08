import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { CounterStore } from './counter.store';

@Component({
    selector: 'thy-store-counter-example',
    templateUrl: './counter.component.html',
    styleUrls: ['./counter.component.scss']
})
export class ThyStoreCounterExampleComponent implements OnInit {
    count$: Observable<number> = this.counterStore.select(CounterStore.countSelector);

    constructor(public counterStore: CounterStore) {}

    ngOnInit(): void {}

    increase() {
        this.counterStore.increase();
    }

    decrease() {
        this.counterStore.decrease();
    }
}
