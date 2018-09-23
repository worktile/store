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

  editTask: TaskInfo;

  tasks$: Observable<TaskInfo[]>;

  projectMessage: string;

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

    this.store.select('project.detail.name')
      .pipe(takeUntil(this.unSubscription$))
      .subscribe((name: string) => {
        this.projectMessage = `project name is [${name || 'None'}]`;
      });
  }

  ngOnInit(): void {
    this.store.fetchTasks();
  }

  showTaskEdit(task: TaskInfo) {
    this.editTask = { ...task };
  }

  updateTask(task: TaskInfo) {
    if (!task.title) {
      return;
    }
    this.store.updateTask(task.id, task.title);
  }

  addTask(title: string) {
    if (title) {
      this.store.addTask(title);
      this.addTaskTitle = '';
    }
  }

  initializeProject() {
    this.store.initializeProjectDetail({
      id: 100,
      name: `ngx-mini-store`
    });
  }

  ngOnDestroy() {
    this.unSubscription$.next();
    this.unSubscription$.complete();
  }
}
