import { Observable, Observer, BehaviorSubject, from, of, PartialObserver, Subscription } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { META_KEY, StoreMetaInfo } from './types';
import { getSingletonRootStore, RootStore } from './root-store';
import { OnDestroy, isDevMode, Injectable } from '@angular/core';
import { ActionState } from './action-state';
import { Action } from './action';
import { isFunction } from '@tethys/cdk/is';
import { StoreFactory } from './internals/store-factory';
import { InternalDispatcher } from './internals/dispatcher';

/**
 * @dynamic
 */
@Injectable()
export class Store<T = unknown> implements Observer<T>, OnDestroy {
    private initialStateCache: T;

    public state$: BehaviorSubject<T>;

    public reduxToolEnabled = isDevMode();

    private _defaultStoreInstanceId: string;

    constructor(initialState: Partial<T>) {
        this._defaultStoreInstanceId = this.createStoreInstanceId();
        this.state$ = new BehaviorSubject<T>(initialState as T);
        this.initialStateCache = { ...initialState } as T;
        if (this.reduxToolEnabled) {
            const rootStore: RootStore = getSingletonRootStore();
            ActionState.changeAction(`Add-${this._defaultStoreInstanceId}`);
            rootStore.registerStore(this);
            StoreFactory.instance.register(this);
        }
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
        ActionState.changeAction(`${this._defaultStoreInstanceId}-${type}`);
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
        // let result: any = this[actionMeta.fn](this.snapshot, action.payload);
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
        if (this.reduxToolEnabled) {
            const rootStore: RootStore = getSingletonRootStore();
            rootStore.unregisterStore(this);
        }
        StoreFactory.instance.unregister(this);
        this.cancelUncompleted();
    }

    /**
     * Cancel all uncompleted actions
     */
    cancelUncompleted() {
        InternalDispatcher.instance.cancel(this.getStoreInstanceId());
    }

    /**
     * You can override this method if you want to give your container instance a custom id.
     * The returned id must be unique in the application.
     */
    getStoreInstanceId(): string {
        return this._defaultStoreInstanceId;
    }

    private createStoreInstanceId(): string {
        const name = this.constructor.name || /function (.+)\(/.exec(this.constructor + '')[1];
        if (this.reduxToolEnabled) {
            if (!StoreFactory.instance.get(name)) {
                return name;
            }
            let j = 0;
            for (let i = 1; i <= 20; i++) {
                if (!StoreFactory.instance.get(`${name}-${i}`)) {
                    j = i;
                    break;
                }
            }
            if (j === 0) {
                throw new Error(`the store ${name} created more than 20, please check it.`);
            }
            return `${name}-${j}`;
        }
        return name;
    }
}
