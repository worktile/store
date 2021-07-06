## @tethys/store

A mini, yet powerful state management library for Angular.

[![GitHubActionCI](https://img.shields.io/github/workflow/status/tethys-org/store/ci-tethys-store-test)](https://github.com/tethys-org/store/actions/workflows/main.yml)
[![Coverage Status][coveralls-image]][coveralls-url]
![](https://img.shields.io/badge/Made%20with%20Angular-red?logo=angular)
[![npm (scoped)](https://img.shields.io/npm/v/@tethys/store?style=flat)](https://www.npmjs.com/package/@tethys/store)
[![npm](https://img.shields.io/npm/dm/@tethys/store)](https://www.npmjs.com/package/@tethys/store)
[![release](https://img.shields.io/github/release-date/tethys-org/store.svg?style=flat-square
)](https://github.com/atinc/ngx-tethys)
[![docgeni](https://img.shields.io/badge/docs%20by-docgeni-348fe4)](https://github.com/docgeni/docgeni)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)


[coveralls-image]: https://coveralls.io/repos/github/tethys-org/store/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/tethys-org/store

## Installation

```
npm install @tethys/store --save
# or if you are using yarn
yarn add @tethys/store
```

## Usage & Example
### 1. Define Store and State
```
import { Store, Action } from '@tethys/store';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface TaskInfo {
    id: number;
    title: string;
}

interface TasksState {
    tasks: TaskInfo[];
}

export class TasksStore extends Store<TasksState> {

    constructor() {
        super({
            tasks: []
        });
    }

    @Action()
    fetchTasks() {
        const apiMockTasks: TaskInfo[] = [{ id: 1, title: 'Todo 1' }];
        return of(apiMockTasks)
            .pipe(tap((tasks) => {
                const state = this.snapshot;
                state.tasks = tasks;
                this.next(state);
            }));
    }

    @Action()
    addTask(title: string) {
        return of({ id: 100, title: title }).pipe(tap((task) => {
            const state = this.snapshot;
            state.tasks = [...state.tasks, task];
            this.next(state);
        }));
    }
}

```

### 2. Import and use NgxMiniStoreModule in you AppModule, and use `forRoot` set stores

```
import { NgxMiniStoreModule } from '@tethys/store';
import { TasksStore } from './tasks.store.ts'; 

@NgModule({
  imports: [
    NgxMiniStoreModule.forRoot([TasksStore])
  ]
})
export class AppModule {}
```

### 3. Component inject TasksStore and use store select get observable data.

```
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TasksStore, TaskInfo } from '../tasks-store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-tasks',
  templateUrl: `
<div>Tasks:</div>
<div *ngFor="let task of this.tasks$ | async">
  {{task.id}} - {{task.title}}
  <button (click)="updateTask(task)">Change</button>
</div>

<hr>
<input [(ngModel)]="addTaskTitle" placeholder="please input task title" (keydown.enter)="addTask(addTaskTitle)">
<button (click)="addTask(addTaskTitle)">Submit</button>

  `
})
export class TasksComponent implements OnInit, OnDestroy {

  tasks$: Observable<TaskInfo[]>;

  unsubscribe$ = new Subject();

  constructor(public store: TasksStore) {
    this.tasks$ = this.store.select((state) => {
       return state.tasks;
    });
  }

  ngOnInit(): void {
    this.store.fetchTasks().subscribe((tasks) => {

    });
  }

  updateTask(task: TaskInfo) {
    task.title += `1`;
  }

  addTask(title: string) {
    if (title) {
      this.store.addTask(title);
      this.addTaskTitle = '';
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}

```


