---
title: Entity Store with References
order: 20
---

在 [Entity Store](guides/advanced/entity-store) 章节中我们提供了`EntityStore`方便实体列表的管理，那么实体列表一般都需要引用数据，那么`EntityStore`内置了`References`功能简化真实业务场景的开发。

## API 数据格式
当前后端分离后，服务端只提供 RESTful API，那么对于 API 返回的 JSON 数据格式有两种类型：
- 具有深度嵌套对象的 JSON 数据，引用对象嵌套在内部
- 规范化数据结构，相当于数据库表结构，引用对象通过 References 存储，并通过外键查找

比如我们要返回一个任务列表，每个任务有_id、标题、负责人和创建者属性。

第一种类型返回的格式如下:
```js
{
    data: [
        { 
          _id: 'task1',
          title: 'Task 1',
          assignee: { _id: 'user1', name: 'why520crazy' }，
          created_by: { _id: 'user1', name: 'why520crazy' } },
        {
          _id: 'task2',
          title: 'Task 2',
          assignee:  { _id: 'user2', name: 'peter' }，
          created_by: { _id: 'user1', name: 'why520crazy' } 
        }
    ]
};
```
这种格式的好处是：简单、前端拿来直接绑定到视图即可，无需组合，缺点就是数据冗余和数据更新操作复杂。

<alert>对于实时性要求较高的产品，除了任务本身的数据变化外还包括引用数据的变化，比如某个用户的用户名变化了，需要查找任务的 assignee 和 created_by 等所有成员数据，更新为最新的用户名。</alert>

第二种类型返回的格式如下:
```js
{
    data: [
        { _id: 'task1'，title: 'Task 1'，assignee: 'user1'，created_by: 'user1' },
        { _id: 'task2'，title: 'Task 2'，assignee: 'user2'，created_by: 'user1' }
    ],
    references: {
        users: [
            { _id: 'user1'，name: 'why520crazy' },
            { _id: 'user2'，name: 'peter' }
        ]
    }
};
```
用一张简单的类图表示为:
<img src="assets/images/entity-store-references.png" width="80%" height="80%" style="padding-left: 10%;"  />

这种数据格式解决了数据冗余的问题，同时更新数据变得更容易，缺点就是引用数据需要组合才可以在视图中展示，现代的状态管理框架更推荐使用规范化数据结构，即使服务端返回的是嵌套对象，我们也可以通过 [normalizr](https://github.com/paularmstrong/normalizr) 等工具进行转换。


## 创建带 References 的 EntityStore
通过上述的示例可以看出，规范化数据结构的缺点是需要组合才可以使用，同时增删改查都需要更新引用数据，那么`EntityStore`可以很好的帮助我们处理相关工作，首先需要定义一个`TasksReferences`，此示例中任务的引用对象只有用户，不管是创建者还是负责人都指向用户，和创建`EntityStore`一样，需要继承`EntityStore`，同时需要传入`TasksReferences`的泛型。

```ts
// tasks.store.ts
import { Injectable } from '@angular/core';
import { Action，EntityState，EntityStore，OnCombineRefs，ReferencesIdDictionary } from '@tethys/store';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
    _id: string;
    name: string;
}

export interface Task {
    _id: string;
    title: string;
    assignee: string;
    created_by: string;
}

export interface TasksReferences {
    users: User[];
}

interface TasksState extends EntityState<Task，TasksReferences> {}

@Injectable({ providedIn: 'root' })
export class TasksStore extends EntityStore<TasksState, Task, TasksReferences> {
    constructor() {
        super({ entities: [] });
    }
}
```

## 初始化

与`EntityStore`的初始化相似，唯一区别就是获取数据后，通过`store.initializeWithReferences()`完成数据的初始化，传入任务列表和引用对象。

```ts
import { Injectable } from '@angular/core';
import { Action, EntityState, EntityStore, OnCombineRefs, ReferencesIdDictionary } from '@tethys/store';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
    _id: string;
    name: string;
}

export interface Task {
    _id: string;
    title: string;
    assignee: string;
    created_by: string;
}

export interface TasksReferences {
    users: User[];
}

interface TasksState extends EntityState<Task, TasksReferences> {}

@Injectable({ providedIn: 'root' })
export class TasksStore extends EntityStore<TasksState, Task, TasksReferences> {
    constructor() {
        super({ entities: [] });
    }

    @Action()
    fetchTasks() {
        const data = {
            tasks: [{ _id: 'task1', title: 'Task 1', assignee: 'user1', created_by: 'user1' }],
            references: {
                users: [
                    { _id: 'user1', name: 'why520crazy' },
                    { _id: 'user2', name: 'peter' }
                ]
            }
        };
        return of(data).pipe(
            tap((data) => {
                this.initializeWithReferences(data.tasks, data.references);
            })
        );
    }
}

```

## 获取带引用的列表数据
可以通过提供了`store.entitiesWithRefs$`获取带引用实体数据流，对于本示例来说，视图需要展示任务的负责人名称而不是一个用户唯一标识，那么组合数据需要实现`OnCombineRefs`接口的`onCombineRefs`函数，推荐把数据存放在`task.refs: { assignee: User; created_by: User;}`对象上，这样在模板中即可使用`task.refs.assignee.name`进行数据的绑定。


<alert>当然我们也可以单独把引用数据的 map 存储起来，然后在模板中通过绑定 map 数据。</alert>

```ts
import { Injectable } from '@angular/core';
import { Action, EntityState, EntityStore, OnCombineRefs, ReferencesIdDictionary } from '@tethys/store';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
    _id: string;
    name: string;
}

export interface Task {
    _id: string;
    title: string;
    assignee: string;
    created_by: string;
    refs?: {
        assignee: User;
        created_by: User;
    };
}

export interface TasksReferences {
    users: User[];
}

interface TasksState extends EntityState<Task, TasksReferences> {}

@Injectable({ providedIn: 'root' })
export class TasksStore extends EntityStore<TasksState, Task, TasksReferences> implements OnCombineRefs<Task, TasksReferences> {
    constructor() {
        super({entities: [] });
    }

    onCombineRefs(entity: Task, referencesIdMap: ReferencesIdDictionary<TasksReferences>, references?: TasksReferences): void {
        entity.refs.assignee = referencesIdMap.users[entity.assignee];
        entity.refs.created_by = referencesIdMap.users[entity.created_by];
    }

    @Action()
    fetchTasks() {
        ...
    }
}
```

<alert>为了提升前端组合 Reference 数据的性能，Entity 内部会维护所有引用列表数据的 Map 和 原始数据，onCombineRefs 函数的第二个参数存储的是所有引用数据的 Map，第三个参数是原始的 References 数据。</alert>

## 引用数据 Id Key 设置

对于`Reference`的获取和查找需要明确唯一标识的键，默认为`_id`，如果用户列表的唯一标识是`uid`或者其他字段，那么就需要通过构造函数的第二个参数传入`referencesIdKeys`进行设置

```ts
@Injectable({ providedIn: 'root' })
export class TasksStore extends EntityStore<TasksState, Task, TasksReferences> implements OnCombineRefs<Task, TasksReferences> {
    constructor() {
        super({ entities: []}, { referencesIdKeys: { users: 'uid' } });
    }
    ...
```

## 添加
通过`addWithReferences`函数添加单个或者多个实体，第二个参数传入 References。
```ts
/**
  * Add an entity or entities to the store with references.
  *
  * @example
  * this.store.addWithReferences(Entity, EntityReferences);
  * this.store.addWithReferences([Entity, Entity], EntityReferences);
  * this.store.addWithReferences(Entity, EntityReferences, { prepend: true });
*/
addWithReferences(entity: TEntity | TEntity[], references: Partial<TReferences>, addOptions?:EntityAddOptions)
```
## 更新
使用`updateWithReferences`函数修改单个或者多个实体。
```ts
/**
  *
  * Update an entity or entities in the store with references.
  *
  * @example
  * this.store.updateWithReferences(3, {
  *   name: 'New Name'
  * }, references);
  *
  *  this.store.updateWithReferences(3, entity => {
  *    return {
  *      ...entity,
  *      name: 'New Name'
  *    }
  *  }, references);
  *
  * this.store.updateWithReferences([1,2,3], {
  *   name: 'New Name'
  * }, references);
*/
updateWithReferences(idsOrFn: Id | Id[] | null, newStateOrFn: ((entity: Readonly<TEntity>) => Partial<TEntity>) | Partial<TEntity>, references: TReferences): void
```
