import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, of, Subject, throwError } from 'rxjs';
import {
    filter,
    take,
    shareReplay,
    exhaustMap,
    switchMap,
    takeUntil,
    defaultIfEmpty,
    catchError,
    map,
    mergeMap,
    tap
} from 'rxjs/operators';
import { CancelUncompleted } from '../action';
import { ActionContext, ActionStatus } from '../actions-stream';
import { SafeAny, ActionMetadata } from '../inner-types';
import { PluginContext } from '../plugin';
import { compose, findAndCreateStoreMetadata } from '../utils';
import { StoreFactory } from './store-factory';

@Injectable({
    providedIn: 'root'
})
export class InternalDispatcher {
    private static dispatcher = new InternalDispatcher();

    static get instance() {
        return this.dispatcher;
    }

    private cancel$ = new Subject<{ storeId: string; action: string; cancelUncompleted?: CancelUncompleted }>();

    private actions$ = new Subject<ActionContext>();

    private actionResults$ = new Subject<ActionContext>();

    constructor() {
        this.setupInvokeActions();
    }

    public cancel(storeId: string, action?: string) {
        this.cancel$.next({ storeId: storeId, action: action, cancelUncompleted: 'store' });
    }

    // public dispatch(storeId: string, action: string, originActionFn: () => Observable<unknown> | void) {
    //     const storeInstance = StoreFactory.instance.get(storeId);
    //     const result = compose([
    //         // (ctx, next)=>{
    //         //     return next().pipe(()=>{
    //         //         ctx.state = storeInstance.getState();
    //         //     });
    //         // },
    //         (ctx) => {
    //             this.cancel$.next({ storeId: storeId, action: action });
    //             // this.actions$.next({ storeId: storeId, action: action, status: ActionStatus.Dispatched, originActionFn: originActionFn });
    //             let result = originActionFn();
    //             if (result instanceof Observable) {
    //                 result = result.pipe(
    //                     catchError((error) => {
    //                         return of({ status: ActionStatus.Errored, action: action, error: error });
    //                     }),
    //                     takeUntil(
    //                         this.cancel$.pipe(
    //                             filter((ctx) => {
    //                                 if (ctx.action) {
    //                                     return ctx.storeId === storeId && ctx.action === action;
    //                                 } else {
    //                                     return ctx.storeId === storeId;
    //                                 }
    //                             })
    //                         )
    //                     ),
    //                     shareReplay(),
    //                     exhaustMap((result: ActionContext | any) => {
    //                         if (result && result.status === ActionStatus.Errored) {
    //                             return throwError(result.error);
    //                         } else {
    //                             return of(result);
    //                         }
    //                     }),

    //                 );
    //                 return of(true).pipe(
    //                     switchMap(() => {
    //                         return result as Observable<unknown>;
    //                     })
    //                 );
    //             } else {
    //                 return of(result);
    //             }
    //         }
    //     ])({
    //         state: StoreFactory.instance.get(storeId).getState(),
    //         storeInstance: storeInstance,
    //         action: action
    //     }).pipe(shareReplay());
    //     result.subscribe();
    //     return result;
    // }

    private setupInvokeActions() {
        this.actions$
            .pipe(
                filter((ctx) => ctx.status === ActionStatus.Dispatched),
                mergeMap((ctx) => {
                    try {
                        this.cancel$.next(ctx);
                        const originActionResult = ctx.originActionFn();
                        if (originActionResult instanceof Observable) {
                            const result = originActionResult.pipe(
                                takeUntil(
                                    this.cancel$.pipe(
                                        filter((cancelCtx) => {
                                            if (cancelCtx.cancelUncompleted) {
                                                if (cancelCtx.cancelUncompleted === 'all') {
                                                    return true;
                                                } else if (cancelCtx.cancelUncompleted === 'store') {
                                                    return ctx.storeId === cancelCtx.storeId;
                                                } else {
                                                    return ctx.storeId === cancelCtx.storeId && ctx.action === cancelCtx.action;
                                                }
                                            }
                                            return false;
                                        })
                                    )
                                ),
                                map((result) => {
                                    return {
                                        ...ctx,
                                        status: ActionStatus.Successful,
                                        result: result
                                    };
                                }),
                                defaultIfEmpty(<ActionContext>{
                                    ...ctx,
                                    status: ActionStatus.Canceled
                                }),
                                catchError((error) =>
                                    of(<ActionContext>{
                                        ...ctx,
                                        status: ActionStatus.Errored,
                                        error
                                    })
                                )
                            );
                            return result;
                        } else {
                            return of(<ActionContext>{
                                ...ctx,
                                result: originActionResult,
                                status: ActionStatus.Successful
                            });
                        }
                    } catch (error) {
                        return of(<ActionContext>{
                            ...ctx,
                            status: ActionStatus.Errored,
                            error
                        });
                    }
                })
            )
            .subscribe((ctx) => {
                this.actionResults$.next(ctx);
            });
    }

    public dispatch(storeId: string, action: ActionMetadata, originActionFn: () => Observable<unknown> | void) {
        const storeInstance = StoreFactory.instance.get(storeId);
        const dispatchId = `${action.type}_${new Date().getTime()}`;
        const result$ = compose([
            // (ctx: PluginContext, next) => {
            //     console.log(`dispatching`, ctx);
            //     return next(ctx).pipe(
            //         tap((state) => {
            //             console.log(`new state`, state);
            //         })
            //     );
            // },
            (ctx: PluginContext) => {
                const actionsResult$ = this.getActionResult$(storeId, dispatchId);
                actionsResult$.subscribe((result) => {
                    this.actions$.next(result);
                });
                const actionContext: ActionContext = {
                    storeId: storeId,
                    dispatchId: dispatchId,
                    action: action.type,
                    status: ActionStatus.Dispatched,
                    cancelUncompleted: action.cancelUncompleted,
                    originActionFn: originActionFn
                };
                this.actions$.next(actionContext);
                return actionsResult$.pipe(
                    mergeMap((ctx: ActionContext) => {
                        switch (ctx.status) {
                            case ActionStatus.Successful:
                                return of(ctx.result);
                            case ActionStatus.Errored:
                                return throwError(ctx.error);
                            default:
                                return EMPTY;
                        }
                    }),
                    shareReplay()
                );
            }
        ])({
            state: StoreFactory.instance.get(storeId).getState(),
            storeInstance: storeInstance,
            action: action.type
        }).pipe(shareReplay());

        result$.subscribe();
        return result$;
    }

    private getActionResult$(storeId: string, dispatchId: string): Observable<ActionContext> {
        return this.actionResults$.pipe(
            filter((ctx: ActionContext) => {
                return ctx.storeId === storeId && ctx.dispatchId === dispatchId && ctx.status !== ActionStatus.Dispatched;
            }),
            take(1),
            shareReplay()
        );
    }
}
