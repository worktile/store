import { Injectable, isDevMode, OnDestroy } from '@angular/core';
import { isFunction, isNumber } from '@tethys/cdk/is';
import { BehaviorSubject, from, Observable, Observer, Subscription } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { Action } from './action';
import { StoreMetaInfo } from './inner-types';
import { InternalDispatcher } from './internals/dispatcher';
import { StoreFactory } from './store-factory';
import { META_KEY, StoreOptions } from './types';

/**
 * @dynamic
 */
@Injectable()
export class Store<T = unknown> implements Observer<T>, OnDestroy {
    private initialStateCache: T;

    public state$: BehaviorSubject<T>;

    private defaultStoreInstanceId: string;

    private storeOptions: StoreOptions;

    constructor(initialState: Partial<T>, options?: StoreOptions) {
        this.storeOptions = options;
        this.defaultStoreInstanceId = this.createStoreInstanceId();
        this.state$ = new BehaviorSubject<T>(initialState as T);
        this.initialStateCache = { ...initialState } as T;
        StoreFactory.instance.register(this);
        InternalDispatcher.instance.dispatch(
            this.getStoreInstanceId(),
            {
                type: `INIT`,
                originalFn: undefined
            },
            () => {}
        );
    }

    get snapshot() {
        return this.state$.getValue();
    }

    /**
     * @deprecated
     *
     * @template T
     * @param {string} type
     * @param {T} [payload]
     * @returns {Observable<any>}
     * @memberof Store
     */
    public dispatch<T = unknown>(type: string, payload?: T): Observable<any> {
        const result = this._dispatch({
            type: type,
            payload: payload
        });
        result.subscribe();
        return result;
    }

    private _dispatch(action: any): Observable<any> {
        const meta = this[META_KEY] as StoreMetaInfo;
        if (!meta) {
            throw new Error(`${META_KEY} is not found, current store has not action`);
        }
        const actionMeta = meta.actions[action.type];
        if (!actionMeta) {
            throw new Error(`${action.type} is not found`);
        }
        let result: any = actionMeta.originalFn.call(this, this.snapshot, action.payload);

        if (result instanceof Promise) {
            result = from(result);
        }

        if (result instanceof Observable) {
            result = result.pipe(map((r) => r));
        } else {
            result = new Observable((observer: Observer<any>) => {
                observer.next({});
            });
        }
        return result.pipe(shareReplay());
    }

    select<TResult>(selector: (state: T) => TResult): Observable<TResult> | Observable<TResult>;
    select(selector: string | any): Observable<any> {
        return this.state$.pipe(map(selector), distinctUntilChanged());
    }

    next(state: T) {
        this.state$.next(state);
    }

    error(error: any) {
        this.state$.error(error);
    }

    complete() {
        this.state$.complete();
    }

    subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Subscription {
        return this.state$.subscribe(next, error, complete);
    }

    /**
     * set store new state
     *
     * @example
     * this.setState(newState);
     * this.setState({ users: produce(this.snapshot.users).add(user) });
     * this.setState((state) => {
     *    return {
     *        users: produce(state.users).add(user)
     *    }
     * });
     * @param fn
     */
    setState(fn: Partial<T> | ((newState: T) => Partial<T>)): void {
        if (isFunction(fn)) {
            this.next({
                ...this.snapshot,
                ...(fn as any)(this.snapshot)
            });
        } else {
            this.next({
                ...this.snapshot,
                ...(fn as T)
            });
        }
    }

    getState(): T {
        return this.snapshot;
    }

    @Action()
    clearState() {
        this.setState(this.initialStateCache);
    }

    ngOnDestroy() {
        StoreFactory.instance.unregister(this);
        this.cancelUncompleted();
    }

    /**
     * Cancel all uncompleted actions
     */
    cancelUncompleted(scope: 'store' | 'all' = 'store') {
        InternalDispatcher.instance.cancel(this.getStoreInstanceId(), scope);
    }

    /**
     * You can override this method if you want to give your container instance a custom id.
     * The returned id must be unique in the application.
     */
    getStoreInstanceId(): string {
        return this.defaultStoreInstanceId;
    }

    getStoreInstanceName(): string {
        return (this.storeOptions && this.storeOptions.name) || this.getNameByConstructor();
    }

    private getNameByConstructor() {
        return this.constructor.name || /function (.+)\(/.exec(this.constructor + '')[1];
    }

    private createStoreInstanceId(): string {
        const instanceMaxCount = this.getInstanceMaxCount();
        const name = (this.storeOptions && this.storeOptions.name) || this.getNameByConstructor();
        if (!StoreFactory.instance.get(name)) {
            return name;
        }
        let j = 0;
        for (let i = 1; i <= instanceMaxCount - 1; i++) {
            if (!StoreFactory.instance.get(`${name}-${i}`)) {
                j = i;
                break;
            }
        }

        if (j === 0 && isDevMode()) {
            throw new Error(`store '${name}' created more than ${instanceMaxCount}, please check it.`);
        }
        return `${name}-${j}`;
    }

    private getInstanceMaxCount() {
        const instanceMaxCount = this.storeOptions && this.storeOptions.instanceMaxCount;
        if (isNumber(instanceMaxCount)) {
            return instanceMaxCount <= 0 ? Number.MAX_SAFE_INTEGER : instanceMaxCount;
        } else {
            return 20;
        }
    }
}
