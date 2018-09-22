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
export function Action(action?: DecoratorActionOptions) {
    return function (target: any, name: string, descriptor: TypedPropertyDescriptor<any>) {
        if (helpers.isFunction(descriptor.value)) {
            const originalFn = descriptor.value;
            descriptor.value = function (...args: any[]) {
                let result = originalFn.call(this, ...args);
                result = _dispatch(result);
                result.subscribe();
                return result;
            };

            const metadata = helpers.findAndCreateStoreMetadata(target);
            metadata.actions[name] = {
                originalFn: originalFn,
                type: name,
                functionName: name
            };
        } else {
            throw new Error(`action decorator must be used on function.`);
        }
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
