import { Action, EntityState, EntityStore } from '@tethys/store';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface Todo {
    title: string;
}

interface TodosState extends EntityState<Todo> {}

export class TodosStore extends EntityStore<TodosState, Todo> {
    constructor() {
        super({
            entities: []
        });
    }

    @Action()
    fetchTodos() {
        const initialTodos = [
            {
                title: 'Todo1'
            }
        ];
        return of(initialTodos).pipe(
            tap((todos) => {
                this.initialize(todos, { pageIndex: 1, pageCount: 2, pageSize: 20 });
            })
        );
    }
}
