import { StoreMetaInfo, META_KEY } from './types';

export function findAndCreateStoreMetadata(target: any): StoreMetaInfo {
    if (!target.hasOwnProperty(META_KEY)) {
        const defaultMetadata: StoreMetaInfo = {
            actions: {},
            path: null,
            children: [],
            instance: null
        };
        // target[META_KEY] = defaultMetadata;
        Object.defineProperty(target, META_KEY, { value: defaultMetadata, enumerable: false });
    }
    return target[META_KEY];
}

export function isFunction(value: any) {
    return value && typeof value === 'function';
}

export function isString(value: any) {
    return value && typeof value === 'string';
}

export function getSelectorFn(selector: any) {
    if (isFunction(selector)) {
        return selector;
    } else if (isString(selector)) {
        return fastPropGetter(selector.split('.'));
    } else {
        throw new Error(`this selector(${selector}) is not support.`);
    }
}
export function fastPropGetter(paths: string[]): (x: any) => any {
    const segments = paths;
    let seg = 'state.' + segments[0];
    let i = 0;
    const l = segments.length;

    let expr = seg;
    while (++i < l) {
        expr = expr + ' && ' + (seg = seg + '.' + segments[i]);
    }

    const fn = new Function('state', 'return ' + expr + ';');

    return <(x: any) => any>fn;
}

