import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThyStoreModule } from '@tethys/store';
import { CounterStore } from './counter/counter.store';
import { ThyStoreCounterExampleComponent } from './counter/counter.component';
import { ThyStoreTodosExampleComponent } from './todos/todos.component';
import { ThyStoreTasksExampleComponent } from './tasks/tasks.component';

@NgModule({
    declarations: [ThyStoreCounterExampleComponent, ThyStoreTodosExampleComponent, ThyStoreTasksExampleComponent],
    imports: [CommonModule, FormsModule, ThyStoreModule.forRoot([CounterStore])],
    exports: [],
    providers: []
})
export class ThyStoreExamplesModule {}
