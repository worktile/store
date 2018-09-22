import { Component, OnInit, OnDestroy } from '@angular/core';
import { TasksStore, TaskInfo } from '../tasks-store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit, OnDestroy {

  addTaskTitle = '';

  tasks$: Observable<TaskInfo[]>;

  unSubscription$ = new Subject();

  constructor(public store: TasksStore) {
    this.tasks$ = this.store.select((state) => {
      return state.tasks;
    });
    // this.tasks$ = this.store.select<TaskInfo[]>('tasks');

    this.tasks$
      .pipe(takeUntil(this.unSubscription$))
      .subscribe((tasks) => {
        console.log(`tasks stream, length: ${tasks.length}, tasks: ${JSON.stringify(tasks)}`);
      });

    this.store.select('task.title')
      .pipe(takeUntil(this.unSubscription$))
      .subscribe((title: string) => {
        console.log(`task title stream: ${title || 'None'}`);
      });
  }

  ngOnInit(): void {
    this.store.fetchTasks();
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

  patchTask() {
    this.store.patchTask({
      id: 100,
      title: `this is patch task`
    });
  }

  ngOnDestroy() {
    this.unSubscription$.next();
    this.unSubscription$.complete();
  }
}
