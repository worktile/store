import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ThyStoreModule } from '@tethys/store';
import { StoreFormPluginModule } from '@tethys/store/form';
import { CounterStore } from './counter/counter.store';
import { DoubleCountStore } from './counter/doubleCount.store';

export default {
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        StoreFormPluginModule,
        ThyStoreModule.forFeature([CounterStore, DoubleCountStore])
    ]
};
