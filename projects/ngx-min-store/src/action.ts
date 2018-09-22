import { META_KEY } from './types';
import * as helpers from './helpers';
import { from, Observable, Observer } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

export interface DecoratorActionOptions {
    type: string;
    payload?: any;
}

/**
 * Decorates a method with a action information.
 */
export function Action(action?: DecoratorActionOptions | string) {
    return function (target: any, name: string, descriptor: TypedPropertyDescriptor<any>) {
        const metadata = helpers.findAndCreateStoreMetadata(target);

        if (helpers.isFunction(descriptor.value)) {
            const originalFn = descriptor.value;
            return {
                // ...descriptor,
                value: function (...args: any[]) {
                    let result = originalFn(...args);
                    // let result = originalFn.call(target, ...args);
                    result = _dispatch(result);
                    result.subscribe();
                    return result;
                }
            };
        } else {
            throw new Error(`action decorator must be used on function.`);
        }


        // // default use function name as action type
        // if (!action) {
        //     action = {
        //         type: name
        //     };
        // }
        // // support string for type
        // if (typeof action === 'string') {
        //     action = {
        //         type: action
        //     };
        // }
        // const type = action.type;

        // if (!action.type) {
        //     throw new Error(`Action ${action.type} is missing a static "type" property`);
        // }

        // metadata.actions[type] = {
        //     fn: name,
        //     type
        // };
    };
}


function _dispatch(result: any): Observable<any> {

    if (result instanceof Promise) {
        result = from(result);
    }

    if (result instanceof Observable) {
        result = result.pipe(map(r => r));
    } else {
        result = Observable.create((observer: Observer<any>) => {
            observer.next({});
        });
    }
    return result.pipe(shareReplay());
}
