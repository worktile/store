import { ActionCreator, ExtractTypeToPayload, defineAction } from './action-definition';

const payloadSymbol = '__payloadSymbol';

type PayloadRef = { [payloadSymbol]: true };

type ExtractActionCreators<T> = { [key in keyof T]?: ActionCreator<T[key] extends { payload: infer P } ? P : T[key]> };

export function payload<T1 = never, T2 = never, T3 = never, T4 = never>() {
    return null as unknown as PayloadRef & { payload: ExtractTypeToPayload<[T1, T2, T3, T4]> };
}

export function defineActions<T extends Record<string, PayloadRef>>(groupName: string, actions: T) {
    let result: ExtractActionCreators<T> = {};
    for (const key in actions) {
        const type = `${groupName}_${key}`;
        result[key] = defineAction(type) as ActionCreator;
    }
    return result;
}
