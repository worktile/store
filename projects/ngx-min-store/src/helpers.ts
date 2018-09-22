import { StoreMetaInfo, META_KEY } from './types';

export function findAndCreateStoreMetadata(target: any): StoreMetaInfo {
    if (!target.hasOwnProperty(META_KEY)) {
        const defaultMetadata: StoreMetaInfo = {
            actions: {},
            path: null,
            children: [],
            instance: null
        };
        Object.defineProperty(target, META_KEY, { value: defaultMetadata, enumerable: false });
        // target[META_KEY] = defaultMetadata;
    }
    return new Proxy(target, {
        apply: function (target1, thisArg, argumentsList) {
            console.log(`Calculate sum: ${argumentsList}`);
            // expected output: "Calculate sum: 1,2"

            return target1(argumentsList[0], argumentsList[1]) * 10;
        }
    });
    // return target[META_KEY];
}

export function isFunction(value: any) {
    return value && typeof value === 'function';
}
