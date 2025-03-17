import { Observable } from 'rxjs';
import { Component, OnInit, Signal, effect } from '@angular/core';
import { CounterStore } from './counter.store';

@Component({
    selector: 'thy-store-counter-example',
    templateUrl: './counter.component.html',
    styleUrls: ['./counter.component.scss'],
    standalone: false
})
export class ThyStoreCounterExampleComponent implements OnInit {
    count$: Observable<number> = this.counterStore.select$(CounterStore.countSelector);

    count: Signal<number> = this.counterStore.select(CounterStore.countSelector);

    constructor(public counterStore: CounterStore) {
        effect(() => {
            console.log(`The count is: ${this.count()}`);
        });
    }

    // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
    ngOnInit(): void {}

    increase() {
        this.counterStore.increase();
    }

    decrease() {
        this.counterStore.decrease();
    }
}
