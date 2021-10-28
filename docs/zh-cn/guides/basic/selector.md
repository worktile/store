---
title: Selector
order: 30
---

`Store`存储的状态完全由使用者根据业务的需求划分，如果业务简单可以把所有的状态都存储在一个`Store`中，那么对于某个组件或者服务来说，建议过滤需要的状态，这样做的好处为：
- 通过组件的选择状态可以确定当前组件的依赖状态
- 只有需要的数据更新才会被订阅，提高应用程序的性能

在`Store`中，提供了`select()`函数选择需要的状态：

```ts
const todos$ = store.select((state)=> { return state.todos; });
```

函数定义如下：

```ts
select<TResult>(selector: (state: T) => TResult): Observable<TResult> | Observable<TResult>;
```


