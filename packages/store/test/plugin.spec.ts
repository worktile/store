import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Action } from '../action';
import { ThyStoreModule } from '../module';
import { PluginContext, StorePlugin, StorePluginNextFn } from '../plugin';
import { StorePluginManager } from '../plugin-manager';
import { Store } from '../store';

@Injectable()
class CounterStore extends Store<number> {
    constructor() {
        super(0, { name: 'counter' });
    }
    @Action()
    increment() {
        this.next(this.getState() + 1);
    }
}

describe('plugin', () => {
    let counterStore: CounterStore;
    let pluginInvoked = 0;

    @Injectable()
    class MyPlugin implements StorePlugin {
        handle<T>(ctx: PluginContext<unknown>, next: StorePluginNextFn<T>): Observable<T> {
            pluginInvoked = pluginInvoked + 1;
            return next(ctx);
        }
    }

    beforeEach(() => {
        pluginInvoked = 0;
        StorePluginManager['pluginManager'] = null;
        TestBed.configureTestingModule({
            imports: [ThyStoreModule.forRoot([CounterStore], { plugins: [MyPlugin] })]
        });
        counterStore = TestBed.inject(CounterStore);
    });

    afterEach(() => {
        StorePluginManager['pluginManager'] = null;
    });

    it('should invoked plugin when store init', () => {
        expect(pluginInvoked).toBe(1);
    });

    it('should invoked plugin when store invoke', () => {
        counterStore.increment();
        expect(pluginInvoked).toBe(2);
    });
});
