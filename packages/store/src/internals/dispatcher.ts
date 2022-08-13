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
import { ActionContext, ActionStatus } from '../actions-stream';
import { SafeAny } from '../inner-types';
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

    private cancel$ = new Subject<{ storeId: string; action: string }>();

    private actions$ = new Subject<ActionContext>();

    private actionResults$ = new Subject<ActionContext>();

    constructor() {}

    public cancel(storeId: string, action?: string) {
        this.cancel$.next({ storeId: storeId, action: action });
    }

    public dispatch(storeId: string, action: string, originActionFn: () => Observable<unknown> | void) {
        const storeInstance = StoreFactory.instance.get(storeId);
        const result = compose([
            // (ctx,next)=>{
            //     return next().pipe(()=>{
            //         ctx.state = storeInstance.getState();
            //     });
            // },
            (ctx) => {
                this.cancel$.next({ storeId: storeId, action: action });
                // this.actions$.next({ storeId: storeId, action: action, status: ActionStatus.Dispatched, originActionFn: originActionFn });
                let result = originActionFn();
                if (result instanceof Observable) {
                    result = result.pipe(
                        catchError((error) => {
                            return of({ status: ActionStatus.Errored, action: action, error: error });
                        }),
                        shareReplay(),
                        exhaustMap((result: ActionContext | any) => {
                            if (result && result.status === ActionStatus.Errored) {
                                return throwError(result.error);
                            } else {
                                return of(result);
                            }
                        }),
                        takeUntil(
                            this.cancel$.pipe(
                                filter((ctx) => {
                                    if (ctx.action) {
                                        return ctx.storeId === storeId && ctx.action === action;
                                    } else {
                                        return ctx.storeId === storeId;
                                    }
                                })
                            )
                        )
                    );
                    return of(true).pipe(
                        switchMap(() => {
                            return result as Observable<unknown>;
                        })
                    );
                } else {
                    return of(result);
                }
            }
        ])({
            state: StoreFactory.instance.get(storeId).getState(),
            storeInstance: storeInstance,
            action: action
        }).pipe(shareReplay());
        result.subscribe();
        return result;
    }

    // private setupInvokeAction() {
    //     const dispatched$ = new Subject<ActionContext>();
    //     this.actions$
    //         .pipe(
    //             filter((ctx) => ctx.status === ActionStatus.Dispatched),
    //             mergeMap((ctx) => {
    //                 try {
    //                     this.actionResults$.next(ctx);
    //                     dispatched$.next(ctx);
    //                     const originActionResult = ctx.originActionFn();
    //                     if (originActionResult instanceof Observable) {
    //                         return originActionResult.pipe(
    //                             takeUntil(dispatched$.pipe(filter((ctx) => ctx.status === ActionStatus.Dispatched))),
    //                             map((result) => {
    //                                 return { storeId: ctx.storeId, action: ctx.action, status: ActionStatus.Successful, result: result };
    //                             }),
    //                             defaultIfEmpty(<ActionContext>{ storeId: ctx.storeId, action: ctx.action, status: ActionStatus.Canceled }),
    //                             catchError((error) =>
    //                                 of(<ActionContext>{ storeId: ctx.storeId, action: ctx.action, status: ActionStatus.Errored, error })
    //                             )
    //                         );
    //                     } else {
    //                         return of(<ActionContext>{
    //                             storeId: ctx.storeId,
    //                             action: ctx.action,
    //                             result: originActionResult,
    //                             status: ActionStatus.Successful
    //                         });
    //                     }
    //                 } catch (error) {
    //                     return of(<ActionContext>{ storeId: ctx.storeId, action: ctx.action, status: ActionStatus.Errored, error });
    //                 }
    //             })
    //         )
    //         .subscribe((ctx) => {
    //             this.actionResults$.next(ctx);
    //         });
    // }

    // private dispatch(storeId: string, action: string, originActionFn: () => Observable<unknown> | void) {
    //     const storeInstance = StoreFactory.instance.get(storeId);
    //     const result$ = compose([
    //         // (ctx: PluginContext, next) => {
    //         //     console.log(`dispatching`, ctx);
    //         //     return next(ctx).pipe(
    //         //         tap((state) => {
    //         //             console.log(`new state`, state);
    //         //         })
    //         //     );
    //         // },
    //         (ctx1: PluginContext) => {
    //             const actionsResult$ = this.getActionResult$(storeId, action);
    //             this.actions$.next({ storeId: storeId, action: action, status: ActionStatus.Dispatched, originActionFn: originActionFn });
    //             return actionsResult$.pipe(
    //                 switchMap((ctx: ActionContext) => {
    //                     console.log(`exhaustMap`, ctx);
    //                     this.actions$.next(ctx);
    //                     switch (ctx.status) {
    //                         case ActionStatus.Successful:
    //                             return of(ctx.result);
    //                         case ActionStatus.Errored:
    //                             return throwError(ctx.error);
    //                         default:
    //                             return EMPTY;
    //                     }
    //                 }),
    //                 shareReplay()
    //             );
    //         }
    //     ])({
    //         state: StoreFactory.instance.get(storeId).getState(),
    //         storeInstance: storeInstance,
    //         action: action
    //     }).pipe(shareReplay());

    //     result$.subscribe();
    //     return result$;
    // }

    // private getActionResult$(storeId: string, action: string): Observable<ActionContext> {
    //     return this.actionResults$.pipe(
    //         filter((ctx: ActionContext) => ctx.storeId === storeId && ctx.action === action),
    //         take(1),
    //         shareReplay()
    //     );
    // }
}
