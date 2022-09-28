import { CommonModule } from '@angular/common';
import { isDevMode } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PLUGINS_TOKEN, ReduxDevtoolsPlugin, ThyStoreModule } from '@tethys/store';
import { CounterStore } from './counter/counter.store';

export default {
    imports: [CommonModule, FormsModule, ThyStoreModule.forFeature([CounterStore])]
};
