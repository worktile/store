import { ActionCreator, ExtractTypeToPayload, defineAction } from './action-definition';

export const payload = <T1 = never, T2 = never, T3 = never, T4 = never>(...args: ExtractTypeToPayload<[T1, T2, T3, T4]>) => args;

type ReturnType<T> = T extends (...args: any[]) => infer P ? P : never;

export function defineActions<T extends string, A>(
    prefix: T,
    actionsPayload: A
): {
    [K in keyof A]?: ActionCreator<ExtractTypeToPayload<ReturnType<A[K]>>>;
} {
    let result: { [K in keyof A]?: ActionCreator<ExtractTypeToPayload<ReturnType<A[K]>>> } = {};
    for (const key in actionsPayload) {
        const type = `${prefix}_${key}`;
        result[key] = defineAction(type) as ActionCreator;
    }
    return result;
}
