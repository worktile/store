import { CancelUncompleted } from './action';

export type SafeAny = any;

export interface ActionMetadata {
    // name: string;
    type: string;
    originalFn: Function;
    cancelUncompleted?: CancelUncompleted;
}

export interface StoreMetaInfo {
    actions: Record<string, ActionMetadata>;
    path: string;
    children: any[];
    instance: any;
}
