## @tethys/store

[![GitHubActionCI](https://img.shields.io/github/workflow/status/tethys-org/store/ci-tethys-store-test)](https://github.com/tethys-org/store/actions/workflows/main.yml)
[![Coverage Status][coveralls-image]][coveralls-url]
![](https://img.shields.io/badge/Made%20with%20Angular-red?logo=angular)
[![npm (scoped)](https://img.shields.io/npm/v/@tethys/store?style=flat)](https://www.npmjs.com/package/@tethys/store)
[![npm](https://img.shields.io/npm/dm/@tethys/store)](https://www.npmjs.com/package/@tethys/store)
[![release](https://img.shields.io/github/release-date/tethys-org/store.svg?style=flat
)](https://github.com/atinc/ngx-tethys)
[![docgeni](https://img.shields.io/badge/docs%20by-docgeni-348fe4)](https://github.com/docgeni/docgeni)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)


[coveralls-image]: https://coveralls.io/repos/github/tethys-org/store/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/tethys-org/store

一个小巧且强大的 Angular 状态管理类库.
[English](https://github.com/worktile/store/blob/master/README.md) | 中文文档

## 特性
- 完美结合 Angular 的设计理念，`Store` 即服务
- 领域驱动，多 Store 模型，每个 Store 属于一个领域，状态存储和操作聚合一起，
- 简单易上手的 API，无需过多学习成本

## 安装

```
npm install @tethys/store --save
# or if you are using yarn
yarn add @tethys/store
```

## 简单使用

```ts
import { Injectable } from '@angular/core';
import { Action, Store } from '@tethys/store';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface CounterState {
    count: number;
}

@Injectable()
export class CounterStore extends Store<CounterState> {
    static countSelector(state: CounterState) {
        return state.count;
    }

    constructor() {
        super({
            count: 0
        });
    }

    @Action()
    increase() {
        return of(true).pipe(
            tap(() => {
                this.setState({ count: this.snapshot.count + 1 });
            })
        );
    }

    @Action()
    decrease() {
        return of(true).pipe(
            tap(() => {
                this.setState((state) => {
                    return {
                        count: state.count - 1
                    };
                });
            })
        );
    }
}
```

```ts
@Component({
    selector: 'thy-store-counter-example',
    template: `<div>Count: {{ count$ | async }}</div>
               <button class="dg-btn dg-btn-primary dg-btn-sm" (click)="increase()">+</button>
               <button class="dg-btn dg-btn-primary dg-btn-sm" (click)="decrease()">-</button>
`,
    styleUrls: ['./counter.component.scss']
})
export class ThyStoreCounterExampleComponent implements OnInit {
    count$: Observable<number> = this.counterStore.select(CounterStore.countSelector);

    constructor(public counterStore: CounterStore) {}

    ngOnInit(): void {}

    increase() {
        this.counterStore.increase();
    }

    decrease() {
        this.counterStore.decrease();
    }
}
```
## 文档

- [介绍](https://tethys-org.github.io/store/guides/intro)
- [快速开始](https://tethys-org.github.io/store/guides/getting-started)
- [Store](https://tethys-org.github.io/store/guides/basic/store)
- [Entity Store](https://tethys-org.github.io/store/guides/advanced/entity-store)
- [Entity Store with References](https://tethys-org.github.io/store/guides/advanced/entity-store-references)
- [FAQ](https://tethys-org.github.io/store/guides/faq)

## Development
```base
$ git clone https://github.com/tethys-org/store
$ cd store && yarn
$ yarn start:docs // open http://localhost:8887
```

## Release & Publish

```
yarn release
yarn pub
```
## LICENSE

[MIT License](https://github.com/worktile/store/blob/master/LICENSE)
