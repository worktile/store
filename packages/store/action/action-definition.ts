type ExtractTypeToPayload<T> = T extends [...infer A, never] ? ExtractTypeToPayload<A> : T extends Array<any> ? T : never;

export interface ActionRef<T = any> {
    type: string;
    payload: ExtractTypeToPayload<T>;
}

export type ActionCreator<T = any> = (...payload: ExtractTypeToPayload<T>) => ActionRef<T>;

export function defineAction<T1 = never, T2 = never, T3 = never, T4 = never>(type: string): ActionCreator<[T1, T2, T3, T4]> {
    return (...payload: ExtractTypeToPayload<[T1, T2, T3, T4]>) => ({
        type: type,
        payload: payload
    });
}
