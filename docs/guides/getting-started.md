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

`Store`是一个包含状态和行为的单一对象，也是一个普通的服务，创建`Store`需要继承`Store<TState>`，并通过泛型传入当前`Store`存储的状态类型，同时通过构造函数传入初始化状态。

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

## Import module with stores

通过`ThyStoreModule.forRoot`函数设置`Stores`。

```ts
import { ThyStoreModule } from '@tethys/store';

@NgModule({
  imports: [ThyStoreModule.forRoot([CounterStore])]
})
export class AppModule {}
```

## Add Action
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

## Use Store in Component

在组件或者任何服务中通过依赖注入注入`Store`，注入后可以通过`select`选择需要的数据流，模板中通过`async`管道订阅并展示。
<alert>当然也可以手动订阅保存数据到组件实例中，请一定要记得在组件销毁时取消订阅。</alert>

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

## Example
<example name="thy-store-counter-example" />
