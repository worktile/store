import { Component, OnInit, inject } from '@angular/core';
import { TasksStore } from './tasks.store';

@Component({
    selector: 'thy-store-tasks-example',
    templateUrl: './tasks.component.html',
    styleUrls: ['./tasks.component.scss'],
    standalone: false
})
export class ThyStoreTasksExampleComponent implements OnInit {
    tasksStore = inject(TasksStore);

    newTaskTitle!: string;

    ngOnInit(): void {
        this.tasksStore.fetchTasks();
    }

    addTask() {
        this.tasksStore.addTask(this.newTaskTitle);
        this.newTaskTitle = '';
    }
}
