## @tethys/store

A mini, yet powerful state management library for Angular.

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

## Features
- Angular Styled, Store as a Service
- DDD, multi-store model, each store belongs to a domain, state storage and actions are together, just property and methods of class
- Easy to use API without excessive learning cost

## Installation

```
npm install @tethys/store --save
# or if you are using yarn
yarn add @tethys/store
```

## Simple Usage

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
## Documentation

- [Introduce](https://tethys-org.github.io/store/guides/intro)
- [Getting Started](https://tethys-org.github.io/store/guides/getting-started)
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
