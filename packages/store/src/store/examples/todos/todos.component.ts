import { Component, OnInit } from '@angular/core';
import { Id } from '@tethys/cdk/immutable';
import { Todo, TodosStore } from './todos.store';

@Component({
    selector: 'thy-store-todos-example',
    templateUrl: './todos.component.html',
    styleUrls: ['./todos.component.scss']
})
export class ThyStoreTodosExampleComponent implements OnInit {
    todos$ = this.todosStore.select(TodosStore.todosSelector);

    newTodoText!: string;

    activeId: Id;

    activeTodo: Todo;

    constructor(public todosStore: TodosStore) {}

    ngOnInit(): void {
        this.todosStore.fetchTodos().subscribe();

        this.todosStore.activeId$.subscribe((activeId) => {
            this.activeId = activeId;
        });

        this.todosStore.activeEntity$.subscribe((activeEntity) => {
            this.activeTodo = activeEntity;
        });
    }

    addTodo() {
        this.todosStore.addTodo(this.newTodoText).subscribe(() => {
            this.newTodoText = '';
        });
    }

    toggleCompletion(todo: Todo) {
        this.todosStore.toggleCompletion(todo);
    }

    editTodo(todo: Todo) {
        todo.editing = true;
    }

    remove(todo: Todo) {
        this.todosStore.removeTodo(todo);
    }

    update(todo: Todo, newTitle: string) {
        this.todosStore.updateTodo(todo, newTitle);
    }

    stopEditing(todo: Todo, editedTitle: string) {
        todo.title = editedTitle;
        todo.editing = false;
    }

    cancelEditing(todo: Todo) {
        todo.editing = false;
    }

    removeCompleted() {
        this.todosStore.removeCompleted();
    }

    setActiveTodo(id: number) {
        this.todosStore.setActiveTodo(id);
    }

    clearActiveTodo() {
        this.todosStore.clearActiveTodo();
    }
}
