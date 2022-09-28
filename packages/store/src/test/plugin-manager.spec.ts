import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ThyStoreModule } from '../module';
import { PluginContext, StorePlugin, StorePluginNextFn } from '../plugin';
import { StorePluginManager } from '../plugin-manager';

@Injectable()
class MyPlugin implements StorePlugin {
    handle<T>(ctx: PluginContext<unknown>, next: StorePluginNextFn<T>): Observable<T> {
        ctx['MyPlugin'] = true;
        return next(ctx);
    }
}

describe('plugin-manager', () => {
    it('should register plugins', () => {
        StorePluginManager['pluginManager'] = null;
        TestBed.configureTestingModule({
            imports: [ThyStoreModule.forRoot([], { plugins: [MyPlugin] })]
        });
        const pluginManager = TestBed.inject(StorePluginManager);
        expect(StorePluginManager.instance).toBe(pluginManager);
        expect(pluginManager.rootPluginHandlers).toBeTruthy();
        expect(pluginManager.rootPluginHandlers.length).toBe(1);
        let called = false;
        pluginManager.rootPluginHandlers[0]({} as unknown as PluginContext<unknown>, (ctx) => {
            called = true;
            expect(ctx['MyPlugin']).toBe(true);
            return of(ctx);
        });
        expect(called).toBe(true);
    });

    it('should use root StorePluginManager', () => {
        StorePluginManager['pluginManager'] = null;
        const plugins = [new MyPlugin()];
        const parentManager = new StorePluginManager(undefined, plugins);
        const childManager = new StorePluginManager(parentManager, []);
        expect(StorePluginManager.instance).toBe(parentManager);
        expect(childManager.rootPluginHandlers).toBe(parentManager.rootPluginHandlers);
    });
});
