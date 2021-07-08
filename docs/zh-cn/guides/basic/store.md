---
title: Store
order: 10
---


## 定义 Store 和 State

`Store`是一个包含状态和行为的单一对象，也是一个普通的服务，创建`Store`需要继承 Tethys 的`Store<TState>`，并通过泛型传入当前`Store`存储的状态类型，可以通过构造函数传入初始化状态。

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

## 添加 Action
在`Store`中添加普通的函数，并使用`@Action()`装饰器装饰即可，可以通过基类的`setState`函数修改状态。
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

## 在组件中使用 Store

在组件或者任何服务中像普通服务一样注入，注入后可以通过`store.select`选择需要的状态流，模板中通过`async`管道订阅并展示。

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

## 最简单的示例如下
<example name="thy-store-counter-example" />

