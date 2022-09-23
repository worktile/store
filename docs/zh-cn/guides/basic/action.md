---
title: Action
order: 20
---

`Action`就是`Store`中的一个普通函数，通过`@Action()`函数装饰器标记，Action 函数同时支持同步和异步，异步需要返回`Observable`。

## 自动订阅
`Action`函数如果返回的是`Observable`，调用时会自动订阅，发生错误时调用错误处理函数。

对于如下示例代码来说，当在组件中调用`todosStore.fetchTodos()`函数时会自动订阅并通过`shareReplay`操作符转成多播流。

```ts
import { Action, EntityState, EntityStore } from '@tethys/store';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface Todo {
   id: number;
   title: string;
}

interface TodosState extends EntityState<Todo> {}

export class TodosStore extends EntityStore<TodosState, Todo> {
    constructor() {
        super({ entities: [] });
    }

    @Action()
    fetchTodos() {
        const initialTodos = [{id: 1, title: 'Todo1'}];
        return of(initialTodos).pipe(
            tap((todos) => {
                this.initialize(todos, { pageIndex: 1, pageCount: 2, pageSize: 20 });
            })
        );
    }
}
```
## 高级功能
`Action`函数除了上述的自动订阅的功能外，还会统一处理一些插件，比如 Redux Devtool, 状态流转记录等。
其次还可以通过`@Action()`装饰器传参实现自动取消未完成流的特性，参考: [Cancellation 取消未完成的流](guides/advanced/cancellation)
