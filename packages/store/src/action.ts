import { findAndCreateStoreMetadata } from './utils';
import { InternalDispatcher } from './internals/dispatcher';
import { ActionState } from './action-state';
// import { Observable, of, throwError } from 'rxjs';
// import { catchError, exhaustMap, shareReplay} from 'rxjs/operators';
// import { ActionContext, ActionStatus } from './actions-stream';

export type CancelUncompleted = false | 'self' | 'store' | 'all';

export interface DecoratorActionOptions {
    /**
     * Cancel uncompleted actions
     * self: only cancel current action
     * store: cancel all actions in the store
     * all: cancel all actions
     */
    cancelUncompleted?: CancelUncompleted;
    type?: string;
    payload?: any;
}

/**
 * Decorates a method with a action information.
 */
export function Action(action?: DecoratorActionOptions | string) {
    return function (target: Object, name: string, descriptor: TypedPropertyDescriptor<any>) {
        const metadata = findAndCreateStoreMetadata(target);

        // default use function name as action type
        if (!action) {
            action = {
                type: name
            };
        }
        // support string for type
        if (typeof action === 'string') {
            action = {
                type: action
            };
        }
        if (!action.type) {
            action.type = name;
        }
        const type = action.type;

        if (!type) {
            throw new Error(`Action ${type} is missing a static "type" property`);
        }

        const originalFn = descriptor.value;
        metadata.actions[type] = {
            originalFn: originalFn,
            type,
            cancelUncompleted: action.cancelUncompleted
        };

        descriptor.value = function (...args: any[]) {
            const storeId = this.getStoreInstanceId();
            return InternalDispatcher.instance.dispatch(storeId, metadata.actions[type], () => {
                ActionState.changeAction(`${target.constructor.name}-${name}`);
                return originalFn.call(this, ...args);
            });

            // ActionState.changeAction(`${target.constructor.name}-${name}`);
            // let result = originalFn.call(this, ...args);
            // if (result instanceof Observable) {
            //     result = result.pipe(
            //         catchError((error) => {
            //             return of({ status: ActionStatus.Errored, action: action, error: error });
            //         }),
            //         // shareReplay(),
            //         exhaustMap((result: ActionContext | any) => {
            //             if (result && result.status === ActionStatus.Errored) {
            //                 return throwError(result.error);
            //             } else {
            //                 return of(result);
            //             }
            //         }),
            //         shareReplay()
            //     );
            //     result.subscribe();
            // }
            // return result;
        };
    };
}
