import { Observable } from 'rxjs';

/**
 * Status of a dispatched action
 */
export const enum ActionStatus {
    Dispatched = 'DISPATCHED',
    Successful = 'SUCCESSFUL',
    Canceled = 'CANCELED',
    Errored = 'ERRORED'
}

export interface ActionContext<T = unknown> {
    status: ActionStatus;
    storeId: string;
    action: string;
    result?: T;
    error?: Error;
    originActionFn?: () => Observable<unknown> | void;
}
