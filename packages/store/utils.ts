import { SafeAny, StoreMetaInfo } from './inner-types';
import { META_KEY } from './types';

export function findAndCreateStoreMetadata(target: Object): StoreMetaInfo {
    if (!target.hasOwnProperty(META_KEY)) {
        const defaultMetadata: StoreMetaInfo = {
            actions: {},
            path: null,
            children: [],
            instance: null
        };
        target[META_KEY] = defaultMetadata;
    }
    return target[META_KEY];
}

export function keyBy<T>(array: T[], key: T extends object ? keyof T : never): { [key: string]: T } {
    const result: { [key: string]: T } = {};
    array.forEach((item) => {
        const keyValue = item[key];
        (result as any)[keyValue] = item;
    });
    return result;
}

export function indexKeyBy<T>(array: T[], key: T extends object ? keyof T : never): { [key: string]: number } {
    const result: { [key: string]: number } = {};
    array.forEach((item, index) => {
        const keyValue = item[key];
        (result as any)[keyValue] = index;
    });
    return result;
}

export function coerceArray<T>(value: T | T[]): T[] {
    return Array.isArray(value) ? value : [value];
}

export type StateFn = (...args: SafeAny[]) => SafeAny;

export const compose =
    (funcs: StateFn[]) =>
    (...args: SafeAny[]) => {
        const current = funcs.shift()!;
        return current(...args, (...nextArgs: SafeAny[]) => compose(funcs)(...nextArgs));
    };

// generate a unique id
export function generateIdWithTime(): string {
    return `${new Date().getTime()}-${Math.random().toString(36).substring(2)}`;
}

/**
 * Get a deeply nested value. Example:
 *
 *    getObjectValue({ foo: bar: [] }, 'foo.bar') //=> []
 *
 */
export function getObjectValue<T>(obj: T, prop: string): any {
    prop.split('.').reduce((previousValue: SafeAny, part: string) => previousValue && previousValue[part], obj);
}

/**
 * Set a deeply nested value. Example:
 *
 *   setObjectValue({ foo: { bar: { eat: false } } },
 *      'foo.bar.eat', true) //=> { foo: { bar: { eat: true } } }
 *
 * While it traverses it also creates new objects from top down.
 *
 */
export function setObjectValue<T>(obj: T, prop: string, value: SafeAny) {
    obj = { ...obj };

    const split = prop.split('.');
    const lastIndex = split.length - 1;

    split.reduce((previousValue, part, index) => {
        if (index === lastIndex) {
            previousValue[part] = value;
        } else {
            previousValue[part] = Array.isArray(previousValue[part]) ? previousValue[part].slice() : { ...previousValue[part] };
        }

        return previousValue && previousValue[part];
    }, obj);

    return obj;
}
