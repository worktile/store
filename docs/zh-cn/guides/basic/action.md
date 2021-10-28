---
title: Action
order: 20
---

`Action`是一个函数装饰器，`Action`标识的函数调用时会自动订阅，发生错误时调用错误处理函数。

对于如下示例代码来说，当在组件中调用`todosStore.fetchTodos()`函数时会自动订阅并通过`shareReplay`操作符转成多播流。

```ts
import { Action, EntityState, EntityStore } from '@tethys/store';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface Todo {
   _id: number;
   title: string;
}

interface TodosState extends EntityState<Todo> {}

export class TodosStore extends EntityStore<TodosState, Todo> {
    constructor() {
        super({ entities: [] });
    }

    @Action()
    fetchTodos() {
        const initialTodos = [{_id: 1, title: 'Todo1'}];
        return of(initialTodos).pipe(
            tap((todos) => {
                this.initialize(todos, { pageIndex: 1, pageCount: 2, pageSize: 20 });
            })
        );
    }
}
```
