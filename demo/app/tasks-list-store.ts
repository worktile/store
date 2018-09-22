import { Store, Action } from 'projects/ngx-min-store/src/public_api';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface TaskInfo {
    id: number;
    title: string;
}

interface TaskListState {
    tasks: TaskInfo[];
}

export class TaskListStore extends Store<TaskListState> {

    private getTaskNewId(): number {
        const maxTaskId = (this.snapshot.tasks || []).reduce((maxId, task) => {
            if (task.id > maxId) {
                return task.id;
            } else {
                return maxId;
            }
        }, 0);
        return maxTaskId + 1;
    }

    constructor() {
        super({});
    }

    @Action()
    fetchTasks() {
        const apiMockTasks: TaskInfo[] = [{ id: 1, title: 'Todo 1' }];
        return of(apiMockTasks)
            .pipe(tap((tasks) => {
                this.snapshot.tasks = tasks;
                this.next();
            }));
    }

    @Action()
    addTask(title: string) {
        return of({ id: this.getTaskNewId(), title: title }).pipe(tap((task) => {
            const state = this.snapshot;
            state.tasks.push(task);
            this.next(state);
        }));
    }
}
