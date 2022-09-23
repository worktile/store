---
title: Selector
order: 30
---

`Store`存储的状态完全由使用者根据业务的需求划分，如果业务简单可以把所有的状态都存储在一个`Store`中，当然不建议这么做，推荐按照领域划分`Store`，不管`Store`如何划分，对于组件或者服务来说，建议根据需要选择状态，这样做的好处为：
- 通过组件的状态选择器可以确定当前组件的状态依赖关系，提高代码可读性
- 只订阅组件依赖的数据触发脏检查，提高应用程序的性能

在`Store`中，提供了`select()`函数选择需要的状态：

```ts
const todos$ = store.select((state)=> { return state.todos; });
```

函数定义如下：

```ts
select<TResult>(selector: (state: T) => TResult): Observable<TResult> | Observable<TResult>;
```

如果选择器有复杂的计算逻辑，可能会有多处订阅，建议添加`shareReplay`管道。

```ts
const todos$ = store.select((state)=> { return state.todos; }).pipe(shareReplay());
```
