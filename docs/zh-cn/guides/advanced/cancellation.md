---
title: Cancellation
order: 30
---

如果定义了一个异步的 Action，当再次调用这个异步 Action 的时候我们希望取消之前未结束的 Observable，那么很高兴`@tethys/store`自带了此功能，只需要简单配置一下即可。


## 基本使用

通过`@Action`装饰器设置`cancelUncompleted`参数为`self`即可，再次调用`fetchItems`函数会自动取消之前未完成的请求。
```ts

export interface Todo {
    _id?: string;
    title: string;
    created_by?: string;
}

interface TodosState {
    items: Todo[];
}

@Injectable()
export class TodosStore extends Store<TodosState> {
    constructor(private http: HttpClient) {
        super({
            items: []
        });
    }

    @Action({ cancelUncompleted: 'self' })
    fetchItems() {
        return this.http.get<Todo[]>('https://62f70d4273b79d015352b5e5.mockapi.io/items').pipe(
            tap((data) => {
                this.update({ items: data });
            })
        );
    }
}
```

## 参数说明
`cancelUncompleted` 参数除了上述示例中的`self`外还有以下选项:
- `false`: 什么都不做，默认值
- `store`: 取消当前 Store 中的所有未完成 Actions
- `all`: 取消所有 Store 中的未完成 Actions
- `self`: 只取消当前未完成的 Action 

## 手动取消

一般场景下我们通过`@Action`装饰器设置参数即可，`Store`基类中提供了一个`cancelUncompleted`函数方便取消当前 Store 中所有未完成的 Actions。

```ts
@Component({
    selector: 'thy-store-cancellation',
    templateUrl: './cancellation.component.html',
    styleUrls: ['./cancellation.component.scss'],
    providers: [TodosStore]
})
export class ThyStoreCancellationExampleComponent implements OnInit, OnDestroy {

    constructor(public todosStore: TodosStore) {}

    ngOnInit(): void {
        this.todosStore.fetchItems()
    }

    cancel() {
        this.todosStore.cancelUncompleted();
    }
}
```

<alert>当 Store 实例销毁时会自动取消未完成的 Actions，此特性对于组件级别的 Store Provider 特别有用，无需在组件销毁生命周期中手动调用`cancelUncompleted`。</alert>

## 示例

<example name="thy-store-cancellation-example" />
