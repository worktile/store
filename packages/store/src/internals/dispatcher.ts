import { Injectable } from '@angular/core';
import { EMPTY, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, defaultIfEmpty, filter, map, mergeMap, shareReplay, take, takeUntil } from 'rxjs/operators';
import { CancelUncompleted } from '../action';
import { ActionContext, ActionStatus } from '../actions-stream';
import { ActionMetadata } from '../inner-types';
import { PluginContext } from '../plugin';
import { StorePluginManager } from '../plugin-manager';
import { compose, generateIdWithTime } from '../utils';
import { InternalStoreFactory } from './internal-store-factory';

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

    public cancel(storeId: string, scope: CancelUncompleted, action?: string) {
        this.cancel$.next({ storeId: storeId, action: action, cancelUncompleted: scope });
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
                        if (ctx.originActionResult instanceof Observable) {
                            const result = ctx.originActionResult.pipe(
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
                                catchError((error) => {
                                    return of(<ActionContext>{
                                        ...ctx,
                                        status: ActionStatus.Errored,
                                        error
                                    });
                                })
                            );
                            return result;
                        } else {
                            return of(<ActionContext>{
                                ...ctx,
                                result: ctx.originActionResult,
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
        const storeInstance = InternalStoreFactory.instance.get(storeId);
        const dispatchId = `${action.type}-${generateIdWithTime()}`;
        let returnResult = undefined;
        const result$ = compose([
            ...(StorePluginManager.instance?.rootPluginHandlers || []),
            (ctx: PluginContext) => {
                const originActionResult = originActionFn();
                if (originActionResult instanceof Observable) {
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
                        originActionResult: originActionResult
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
                } else {
                    returnResult = originActionResult;
                    return of(originActionResult).pipe(shareReplay());
                }
            }
        ])({
            state: storeInstance.getState(),
            getState: () => storeInstance.getState(),
            getAllState: () => InternalStoreFactory.instance.getAllState(),
            store: storeInstance,
            action: `${storeInstance.getStoreInstanceId()}@${action.type}`
        }).pipe(shareReplay());
        if (returnResult) {
            return returnResult;
        } else {
            result$.subscribe({
                error: (error: Error) => {
                    // this._errorHandler = this._errorHandler || this._injector.get(ErrorHandler);
                    // this._errorHandler.handleError(error);
                }
            });
            return result$;
        }
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
