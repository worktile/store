import { Injectable } from '@angular/core';
import { Action, EntityState, EntityStore, OnCombineRefs, ReferencesIdDictionary } from '@tethys/store';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
    _id: string;
    name: string;
}

export interface Task {
    _id: string;
    title: string;
    assignee: string;
    created_by: string;
    refs?: {
        assignee: User;
        created_by: User;
    };
}

export interface TasksReferences {
    users: User[];
}

interface TasksState extends EntityState<Task, TasksReferences> {}

let taskIndex: number;
@Injectable({ providedIn: 'root' })
export class TasksStore extends EntityStore<TasksState, Task, TasksReferences> implements OnCombineRefs<Task, TasksReferences> {
    constructor() {
        super({ entities: [] }, {});
    }

    onCombineRefs(entity: Task, referencesIdMap: ReferencesIdDictionary<TasksReferences>, references?: TasksReferences): void {
        entity.refs.assignee = referencesIdMap.users[entity.assignee];
        entity.refs.created_by = referencesIdMap.users[entity.created_by];
    }

    @Action()
    fetchTasks() {
        const data = {
            tasks: [{ _id: 'task1', title: 'Task 1', assignee: 'user1', created_by: 'user1' }],
            references: {
                users: [
                    { _id: 'user1', name: 'why520crazy' },
                    { _id: 'user2', name: 'peter' }
                ]
            }
        };
        return of(data).pipe(
            tap((data) => {
                this.initializeWithReferences(data.tasks, data.references);
            })
        );
    }

    @Action()
    addTask(title: string) {
        this.addWithReferences(
            {
                _id: `task${++taskIndex}`,
                title: title,
                created_by: 'user3',
                assignee: 'user3'
            },
            {
                users: [
                    {
                        _id: 'user3',
                        name: 'Terry'
                    }
                ]
            }
        );
    }
}
