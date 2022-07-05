import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThyStoreModule } from '@tethys/store';
import { CounterStore } from './counter/counter.store';

export default {
    imports: [CommonModule, FormsModule, ThyStoreModule.forRoot([CounterStore])]
};
