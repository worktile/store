import { Injectable } from '@angular/core';
import { Action, dispatch, Store } from '@tethys/store';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { groupActions } from './actions';

interface PageDetailState {
    detail: { _id: string; title: string; content: string };
}

@Injectable()
export class PageDetailStore extends Store<PageDetailState> {
    static detailSelector(state: PageDetailState) {
        return state.detail;
    }

    constructor() {
        super({});
    }

    @Action(groupActions.updateTitle)
    pureUpdateTitle(_id: string, payload: { title: string }) {
        if (_id === this.snapshot.detail._id) {
            this.update({
                detail: {
                    ...this.snapshot.detail,
                    ...payload
                }
            });
        }
    }

    @Action()
    fetchPageDetail(id: string) {
        let data;
        if (id === '1') {
            data = {
                pageDetail: {
                    _id: '1',
                    title: 'Flux详解',
                    content: `Flux 应用程序具有三个主要部分：调度程序、存储和视图（React 组件）。
                    这些不应与模型-视图-控制器混淆。控制器确实存在于 Flux 应用程序中，但它们是控制器视图——通常位于层次结构顶部的视图，
                    它们从存储中检索数据并将这些数据传递给它们的子级。此外，操作创建器（调度程序帮助器方法）用于支持描述应用程序中可能发生的所有更改的语义 API。
                    将它们视为 Flux 更新周期的第四部分可能会很有用。Flux 避开 MVC，转而支持单向数据流。当用户与 React 视图交互时，该视图通过中央调度程序将操作传播到保存应用程序数据和业务逻辑的各个存储，
                    从而更新所有受影响的视图。这对于 React 的声明式编程风格尤其有效，它允许存储发送更新而无需指定如何在状态之间转换视图。`
                }
            };
        } else {
            data = {
                pageDetail: {
                    _id: '2',
                    title: '不可变数据',
                    content: `不可变数据作为函数式编程的重要组成部分，在很多熟知的模块中都广泛运用，比如 React、Redux。因此也出现了许多操作不可变数据的库，
                    如 immutable.js、immer、immutability-helper 等。不可变数据 就是一旦创建，就不能再被更改的数据。对该对象的任何修改或添加删除操作都会返回一个新的对象。
                    要避免深拷贝把所有数据都复制一遍带来的性能损耗，使用 Structural Sharing（结构共享），即如果对象树中一个节点发生变化，只修改这个节点和受它影响的父节点，其它节点则进行共享。
                    不可变数据每次返回的数据都是不同的，每次修改后将这些数据记录在队列中，修改指针指向就能轻松实现时间旅行。Immer 简化了对不可变数据结构的处理。使用 Immer，将所有更改应用于临时草稿，它是 currentState 的代理。
                    一旦完成了所有的变更，Immer 将根据对草稿状态的变更生成 nextState。这意味着可以通过简单地修改数据来与数据交互，同时保留不可变数据的所有好处。`
                }
            };
        }

        return of(data).pipe(
            tap((data) => {
                this.update({
                    detail: {
                        ...this.snapshot.detail,
                        ...data.pageDetail
                    }
                });
            })
        );
    }

    @Action()
    updateTitle(id: string) {
        let title;
        if (id === '1') {
            title = 'Flux详解 —— New Title';
        } else {
            title = '不可变数据 —— New Title';
        }
        return of(true).pipe(
            tap(() => {
                dispatch(groupActions.updateTitle(id, { title }));
            })
        );
    }

    @Action()
    resetTitle(id: string) {
        let title;
        if (id === '1') {
            title = 'Flux详解';
        } else {
            title = '不可变数据';
        }
        return of(true).pipe(
            tap(() => {
                dispatch(groupActions.updateTitle(id, { title }));
            })
        );
    }
}
