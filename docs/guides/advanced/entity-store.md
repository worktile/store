---
title: Entity Store
order: 10
---

前端应用程序中，展示`Entity`实体列表并对`Entity`进行增删改是一个高频的场景，那么就需要存储`Entity`，我们可以将`Entity`存储视为数据库中的表，其中每张表表示实体的平面集合。`EntityStore`提供了管理实体列表的功能简化业务。

## 创建 EntityStore
我们创建一个`todos`的`EntityStore`管理`Todo`实体，需要继承`EntityStore`，同时传入继承泛型为`Todo`的`EntityState`。

```ts
// todos.store.ts
import { EntityState, EntityStore } from '@tethys/store';

interface Todo {
    _id: number;
    title: string;
}

interface TodosState extends EntityState<Todo> {}

export class TodosStore extends EntityStore<TodosState, Todo> {
    constructor() {
        super({ entities: [] });
    }
}
```

<alert>对于实体的增删改查需要明确唯一标识的键，默认为`_id`，如果实体列表的唯一标识是`id`或者其他，那么就需要通过构造函数的第二个参数传入`idKey`进行设置</alert>

```ts
export class TodosStore extends EntityStore<TodosState, Todo> {
    constructor() {
        super({ entities: [] }, { idKey: "id" });
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

## 获取列表数据
可以通过`store.entities$`获取实体数据流，同时也可以通过`store.entities`获取实体数据快照。

## 添加
可以通过`add`函数添加单个或者多个实体，并通过`addOptions`控制添加行为，比如：追加的位置和调整分页。
```ts
/**
 * Add an entity or entities to the store.
 *
 * @example
 * this.store.add(Entity);
 * this.store.add([Entity, Entity]);
 * this.store.add(Entity, { prepend: true });
*/
this.add(entity: TEntity | TEntity[], addOptions?: EntityAddOptions);
```
**EntityAddOptions**:

- `prepend`: 是否向前插入，默认在数据最后插入
- `afterId`: 插入某个Id的后面
- `autoGotoLastPage`: 是否自动跳转到最后一页，默认`false`
- `addByPagination`: 是否根据分页数量追加

## 更新
使用`update`函数修改单个或者多个实体。
```ts
/**
* @example
* this.store.update(3, {
*   name: 'New Name'
* });
*
*  this.store.update(3, entity => {
*    return {
*      ...entity,
*      name: 'New Name'
*    }
*  });
*
* this.store.update([1,2,3], {
*   name: 'New Name'
* });
*/
update(idsOrFn: Id | Id[] | null, newStateOrFn: ((entity: Readonly<TEntity>) => Partial<TEntity>) | Partial<TEntity>): void
```

## 移除
使用`remove`函数移除单个或者多个实体。
```ts
/**
* @example
* this.store.remove(5);
* this.store.remove([1, 2, 3]);
* this.store.remove(entity => entity.id === 1);
*/
remove(id: Id | Id[]): void;
remove(predicate: (entity: Readonly<TEntity>) => boolean): void;
remove(idsOrFn?: Id | Id[] | ((entity: Readonly<TEntity>) => boolean)): void
```

## clear
使用`clear`函数清除所有列表数据。
```ts
this.store.clear();
```
## trackBy
提供内置的`trackBy`函数方便在模版中循环`entities`使用。
