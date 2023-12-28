import { Injectable } from '@angular/core';
import { Action, EntityState, EntityStore } from '@tethys/store';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { groupActions } from './actions';

export interface Catalog {
    _id: string;
    title?: string;
    summary?: string;
    update_at?: string;
}

interface CatalogsState extends EntityState<Catalog> {}

@Injectable()
export class CatalogsStore extends EntityStore<CatalogsState, Catalog> {
    constructor() {
        super({ entities: [] }, {});
    }

    @Action()
    fetchCatalogs() {
        const data = [
            {
                _id: '1',
                title: '📄 Flux详解',
                summary: 'Flux 是一种架构思想，专门解决软件结构问题，它和MVC架构师同一类东西，但是更加简单和清晰。',
                update_at: '2023-11-1'
            },
            {
                _id: '2',
                title: '📄 不可变数据',
                summary: '不可变数据概念来源于函数式编程。函数式编程中，对已初始化的“变量”是不可以更改的，每次更改都要创建一个新的“变量”。',
                update_at: '2023-10-11'
            }
        ];

        return of(data).pipe(
            tap((data) => {
                this.initialize(data);
            })
        );
    }

    @Action(groupActions.updateTitle)
    pureUpdateTitle(_id: string, payload: { title: string }) {
        this.update(_id, { title: payload.title });
    }
}
