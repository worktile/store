---
title: Store
order: 10
---

`Store`是一个包含状态和行为的单一对象，也是一个普通的服务，创建`Store`只需继承`Store<TState>`，并通过泛型传入当前`Store`存储的状态类型定义，同时通过`super()`调用父类构造函数设置初始化状态。

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

当需要更新状态时可以通过调用`update()`方法传入新的状态。

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
`update` 可以支持多种参数类型
- 完整的`State`新对象
- 部分`State`更新的对象
- 返回新`State`的函数

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

<alert>在`14.2.0`版本之前，使用`setState`函数更新状态，`setState`在`14.2.0`版本被废弃，使用`update`函数代替。</alert>

## snapshot
提供存当前`Store`状态的快照，方便在模版中通过`store.snapshot`表达式直接访问, 使用`snapshot`的时候需要注意:
- 尽量只在模版中使用，数据变化后非`OnPush`模式的组件可以通过变更检测实时响应
- 在代码中使用时确定当前时刻一定是你需要的值, 且是一次性使用, 数据变更后不影响当前逻辑
- 严禁在`Store`外直接修改`snapshot`中的数据
- `OnPush`组件禁止使用`snapshot`, 否则数据变更后无法同步视图
<alert>使用 snapshot 的时候一定要了解 Angular 数据变更机制，否则非常容易造成数据不同步的缺陷。</alert>

## getState
snapshot 的别名函数。

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
      this.count$ = this.counter.select((state)=> { return state.count; }))
    }
}
```

注意事项：
- 推荐使用`select`返回需要的`Observable`, 在模版中使用`async`管道订阅使用, 如果模版中多处使用可以使用`as`关键字保存为临时对象
- 一旦在代码中订阅使用, 一定要取消订阅, 推荐`takeUntil`操作符取消订阅
- `selector`推荐统一定义到`Store`的静态函数中, 提高性能的话在最后添加`shareReplay`管道是一个不错的好习惯

## StoreOptions

Store 构造函数第一个参数是初始化状态，第二个参数是`StoreOptions`，目前支持配置名称和最大实例数：
- `name: string`: Store 的名称，默认根据类名生成，比如 `class ZoomStore`的名称是`ZoomStore`，在生产环境中，js 会被压缩混淆，所以建议给每个 Store 起一个唯一的名字。
- `instanceMaxCount: number`: 当前 Store 的最大实例数，默认是 20，设置 0 意味着不受限制，注意：只有在 Dev 环境才会报错，生产环境不受数量限制

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
