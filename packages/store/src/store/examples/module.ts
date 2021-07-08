import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThyStoreModule } from '@tethys/store';
import { CounterStore } from './counter/counter.store';
import { ThyStoreCounterExampleComponent } from './counter/counter.component';

@NgModule({
    declarations: [ThyStoreCounterExampleComponent],
    imports: [CommonModule, ThyStoreModule.forRoot([CounterStore])],
    exports: [],
    providers: []
})
export class ThyStoreExamplesModule {}
