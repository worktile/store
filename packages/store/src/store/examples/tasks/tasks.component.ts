import { Component, OnInit } from '@angular/core';
import { TasksStore } from './tasks.store';

@Component({
    selector: 'thy-store-tasks-example',
    templateUrl: './tasks.component.html',
    styleUrls: ['./tasks.component.scss']
})
export class ThyStoreTasksExampleComponent implements OnInit {
    newTaskTitle!: string;

    constructor(public tasksStore: TasksStore) {}

    ngOnInit(): void {
        this.tasksStore.fetchTasks();
    }

    addTask() {
        this.tasksStore.addTask(this.newTaskTitle);
        this.newTaskTitle = '';
    }
}
