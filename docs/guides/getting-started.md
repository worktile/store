---
title: Getting Started
order: 20
---
## Installation

```bash
npm i @tethys/store --save
// or
yarn add @tethys/store
```

## Define Store and State

`Store` is a single object containing state and behavior, and also a common service. to create a `Store`, you need to extends the `Store<TState>`, pass in the current Store's state type definition through generics, and call the parent class constructor through `super()` to set the initialization state.

```ts
import { Injectable } from '@angular/core';
import { Action, Store } from '@tethys/store';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface CounterState {
    count: number;
}

@Injectable()
export class CounterStore extends Store<CounterState> {

    constructor() {
        super({
            count: 0
        });
    }
}
```

## Import ThyStoreModule

Set stores through the `ThyStoreModule.forRoot` function.

```ts
import { ThyStoreModule } from '@tethys/store';

@NgModule({
  imports: [ThyStoreModule.forRoot([CounterStore])]
})
export class AppModule {}
```

<alert>The defined store can also be used normally without setting `ThyStoreModule.forRoot`. It is a common service.</alert>

## Add Action
Add normal functions in the `Store` and decorate them with the `@Action()` decorator. In the Action function, you can update the state by calling the `setState` function of the base class.
```ts
@Injectable()
export class CounterStore extends Store<CounterState> {

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
}
```

## Use Store in Component

Inject the required `Store` into the component or any service through the constructor. After injection, you can select the required data stream through `select`. The template is subscribed and displayed through the `async` pipeline.

<alert>Of course, you can also manually subscribe to save data to the component instance. Be sure to unsubscribe when the component is destroyed.</alert>

```ts
import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { CounterStore } from './counter.store';

@Component({
    selector: 'thy-store-counter-example',
    template: `
    <div>Count: {{ count$ | async}}</div>
      <button (click)="increase()">+</button>
      <button (click)="decrease()">-</button>
    <div>
    `,
    styleUrls: ['./counter.component.scss']
})
export class ThyStoreCounterExampleComponent implements OnInit {
    count$: Observable<number> = this.counterStore.select((state) => { return state.count });

    constructor(public counterStore: CounterStore) {}

    ngOnInit(): void {}

    increase() {
        this.counterStore.increase();
    }

    decrease() {
        this.counterStore.decrease();
    }
}
```

## Simple Example
<example name="thy-store-counter-example" />
