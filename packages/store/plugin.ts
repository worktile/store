import { Store } from './store';
import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';

export interface PluginContext<TState = unknown> {
    /**
     * 调用此 Action 的 Store
     */
    store: Store<TState>;
    /**
     * Action 名称
     */
    action: string;
    /**
     * 当前 Store 调用此 Action 之前的状态
     */
    state: TState;
    /**
     * 获取当前 Store 的状态
     */
    getState: () => TState;
    /**
     * 获取当前所有 Store 实例的状态
     */
    getAllState: () => Record<string, TState>;
}

export type StorePluginNextFn<T> = (ctx: PluginContext) => Observable<T>;

export type StorePluginFn<T = unknown> = (ctx: PluginContext, next: StorePluginNextFn<T>) => Observable<T>;

export interface StorePlugin {
    handle<T>(ctx: PluginContext, next: StorePluginNextFn<T>): Observable<T>;
}

export const PLUGINS_TOKEN = new InjectionToken('TETHYS_STORE_PLUGINS');
