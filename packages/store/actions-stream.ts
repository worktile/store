import { Observable } from 'rxjs';
import { CancelUncompleted } from './action';
import { SafeAny } from './inner-types';

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
    // 每次 dispatch 的唯一 ID，根据 Action + 时间戳生成
    dispatchId?: string;
    cancelUncompleted?: CancelUncompleted;
    result?: T;
    error?: Error;
    originActionResult?: SafeAny;
}
