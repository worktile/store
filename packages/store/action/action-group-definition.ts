import { ActionCreator, ExtractTypeToPayload, defineAction } from './action-definition';

export const payload = <T1 = never, T2 = never, T3 = never, T4 = never>() => {
    return (...args: ExtractTypeToPayload<[T1, T2, T3, T4]>) => args;
};

type ParamsType<T> = T extends (...args: infer P) => any ? P : never;

export function defineActions<T extends string, A>(
    prefix: T,
    actionsPayload: A
): {
    [K in keyof A]?: ActionCreator<ExtractTypeToPayload<ParamsType<A[K]>>>;
} {
    let result: { [K in keyof A]?: ActionCreator<ExtractTypeToPayload<ParamsType<A[K]>>> } = {};
    for (const key in actionsPayload) {
        const type = `${prefix}_${key}`;
        result[key] = defineAction(type) as ActionCreator;
    }
    return result;
}
