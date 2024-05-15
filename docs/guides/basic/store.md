---
title: Store
order: 10
---

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
        super({ count: 0 });
    }
}
```

## update

We can call the `update()` method to transfer in the new state.


```ts
@Injectable()
export class CounterStore extends Store<CounterState> {
    
    ...

    @Action()
    increase() {
        this.update({ count: this.snapshot.count + 1 });
    }
}
```
`update` support multiple parameter types:
- New fully `State` object
- Partial `State` updated objects
- The function return the new `State` object

```ts
@Injectable()
export class CounterStore extends Store<CounterState> {
    @Action()
    increase() {
        this.update((state)=> {
          return { count: state.count + 1 };
        });
    }
}
```

## snapshot
提供存当前`Store`状态的快照，方便在模版中通过`store.snapshot`表达式直接访问, 使用`snapshot`的时候需要注意:
- 尽量只在模版中使用，数据变化后非`OnPush`模式的组件可以通过变更检测实时响应
- 在代码中使用时确定当前时刻一定是你需要的值, 且是一次性使用, 数据变更后不影响当前逻辑
- 严禁在`Store`外直接修改`snapshot`中的数据
- `OnPush`组件禁止使用`snapshot`, 否则数据变更后无法同步视图
<alert>使用 snapshot 的时候一定要了解 Angular 数据变更机制，否则非常容易造成数据不同步的缺陷。</alert>

## getState
alias function return snapshot.

```ts
const state = store.getState();
```

## select
一个`Store`可以存储多个数据集，当某个组件只需要获取部分数据时，可以通过`select()`函数过滤需要的数据，这样只有过滤的数据变化才会收到变化订阅，提高应用程序的性能。

```ts
@Component({
    selector: 'thy-store-counter',
    templateUrl: './counter.component.html',
    styleUrls: ['./counter.component.scss']
})
export class ThyStoreCounterExampleComponent implements OnInit {
    count$: Observable<number>;

    constructor(public counter: CounterStore) {}

    ngOnInit(): void {
      this.count$ = this.counter.select$((state)=> { return state.count; }))
    }
}
```

注意事项：
- 推荐使用`select`返回需要的`Observable`, 在模版中使用`async`管道订阅使用, 如果模版中多处使用可以使用`as`关键字保存为临时对象
- 一旦在代码中订阅使用, 一定要取消订阅, 推荐`takeUntil`操作符取消订阅
- `selector`推荐统一定义到`Store`的静态函数中, 提高性能的话在最后添加`shareReplay`管道是一个不错的好习惯

## StoreOptions

The first parameter of the Store constructor is the initial state, and the second parameter is `StoreOptions`. currently, the configuration name and the maximum number of instances are supported:

- `name: string`: Define name of store, default name is generated according to the class name, e.g. class ZoomStore name is `ZoomStore`, In production environment, js will be compressed and confused, so it is recommended to give each store a unique name.
- `instanceMaxCount: number`: The max number of instances for the current store, default 20, set to 0 means unlimited, Note: only throw error in devMode, unlimited in production environment.

```ts
@Injectable()
export class CounterStore extends Store<CounterState> {

    constructor() {
        super({ count: 0 }, { name: "CounterStore",  instanceMaxCount: 100 });
    }
}
```

## getStores
`StoreFactory`的`getStores(names: string | string[])`方法，可以通过`Store`名字，取到注册过的所有`Store`。
```ts
import { StoreFactory } from '@tethys/store';

constructor(private storeFactory: StoreFactory) {
    stores = this.storeFactory.getStores(['ItemsStore', 'AnotherItemsStore']);
}
```

