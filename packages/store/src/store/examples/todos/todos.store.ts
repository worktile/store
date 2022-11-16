import { Injectable } from '@angular/core';
import { Action, EntityState, EntityStore, StoreFactoryService } from '@tethys/store';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Todo {
    id: number;
    title: string;
    editing?: boolean;
    completed?: boolean;
}

interface TodosState extends EntityState<Todo> {
    someKey?: string;
}

let id: number;
@Injectable({ providedIn: 'root' })
export class TodosStore extends EntityStore<TodosState, Todo> {
    newTodoText: string;

    stores = [];

    static todosSelector(state: TodosState) {
        return state.entities;
    }

    constructor(private todosApiService: TodosApiService, private storeFactory: StoreFactoryService) {
        super(
            {
                entities: [],
                someKey: '1'
            },
            { idKey: 'id' }
        );
        this.stores = this.storeFactory.getStores(['ItemsStore', 'AnotherItemsStore']);
    }

    private getWithCompleted(completed: Boolean) {
        return this.entities.filter((todo: Todo) => todo.completed === completed);
    }

    getCompleted() {
        return this.getWithCompleted(true);
    }

    allCompleted() {
        return this.entities.length === this.getCompleted().length;
    }

    getRemaining() {
        return this.getWithCompleted(false);
    }

    @Action()
    fetchTodos() {
        return this.todosApiService.fetchTodos().pipe(
            tap((todos) => {
                id = todos.length;
                this.initialize(todos, { pageIndex: 1, pageCount: 2, pageSize: 20 });
            })
        );
    }

    @Action()
    addTodo(title: string) {
        return of(true).pipe(
            tap(() => {
                this.add({
                    id: ++id,
                    title: title,
                    completed: false
                });
            })
        );
    }

    @Action()
    updateTodo(todo: Todo, title: string) {
        if (title.length === 0) {
            return this.remove(todo.id);
        }
        this.update(todo.id, {
            editing: false,
            title: title
        });
    }

    @Action()
    toggleCompletion(todo: Todo) {
        this.update(todo.id, {
            completed: !todo.completed
        });
    }

    @Action()
    removeCompleted() {
        const todos = this.getCompleted();
        this.remove(
            todos.map((todo) => {
                return todo.id;
            })
        );
    }

    @Action()
    removeTodo(todo: Todo) {
        this.remove(todo.id);
    }

    @Action()
    setAllTo(completed: boolean) {
        this.update(
            this.entities.map((todo) => {
                return todo.id;
            }),
            {
                completed: completed
            }
        );
    }
}

@Injectable({ providedIn: 'root' })
export class TodosApiService {
    fetchTodos(): Observable<Todo[]> {
        const initialTodos: Todo[] = [
            {
                id: 1,
                title: 'Todo1',
                completed: false
            }
        ];
        return of(initialTodos);
    }
}
