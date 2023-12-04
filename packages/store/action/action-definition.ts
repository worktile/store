import { ACTION_ID_PREFIX } from '../types';
export type ExtractTypeToPayload<T> = T extends [...infer A, never] ? ExtractTypeToPayload<A> : T extends Array<any> ? T : never;

export interface ActionRef<T = any> {
    type: string;
    payload: ExtractTypeToPayload<T>;
}

export type ActionCreator<T = any> = (...payload: ExtractTypeToPayload<T>) => ActionRef<T>;

let internalMaxActionId = 0;

function internalCreateActionId(actionType: string): string {
    const name = `${ACTION_ID_PREFIX}${actionType}_${internalMaxActionId}`;
    internalMaxActionId++;
    return name;
}

export function defineAction<T1 = never, T2 = never, T3 = never, T4 = never>(type: string): ActionCreator<[T1, T2, T3, T4]> {
    const actionId = internalCreateActionId(type);
    function creator(...payload: ExtractTypeToPayload<[T1, T2, T3, T4]>) {
        return Object.defineProperty(
            {
                type: type,
                payload: payload
            },
            'id',
            {
                value: actionId,
                writable: false,
                enumerable: false,
                configurable: false
            }
        );
    }
    creator.prototype.id = actionId;
    return creator;
}
