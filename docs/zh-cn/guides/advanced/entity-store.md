---
title: Entity Store
order: 10
---

在大多数情况下，应用程序中需要存储`Entity`，可以将`Entity`存储视为数据库中的表，其中每张表表示实体的平面集合。EntityStore 为了简化了流程提供了管理实体列表的功能。

## 创建 EntityStore
我们创建一个`todos`的`EntityStore`管理`Todo`实体，需要继承`EntityStore`，同时传入继承泛型为`Todo`的`EntityState`。

```ts
// todos.store.ts
import { EntityState, EntityStore } from '@tethys/store';

interface Todo {
    title: string;
}

interface TodosState extends EntityState<Todo> {}

export class TodosStore extends EntityStore<TodosState, Todo> {
    constructor() {
        super({
            entities: []
        });
    }
}
```

## 初始化

对于`EntityStore`的初始化，一般会增加一个`fetch`方法获取数据，并添加`@Action()`装饰器，获取完数据后，通过`store.initialize()`完成数据的初始化，如果需要分页可以传入分页相关数据。

```ts
import { Action, EntityState, EntityStore } from '@tethys/store';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface Todo {
    title: string;
}

interface TodosState extends EntityState<Todo> {}

export class TodosStore extends EntityStore<TodosState, Todo> {
    constructor() {
        super({
            entities: []
        });
    }

    @Action()
    fetchTodos() {
        const initialTodos = [
            {
                title: 'Todo1'
            }
        ];
        return of(initialTodos).pipe(
            tap((todos) => {
                this.initialize(todos, { pageIndex: 1, pageCount: 2, pageSize: 20 });
            })
        );
    }
}
```

## 添加

## 更新

## 移除
