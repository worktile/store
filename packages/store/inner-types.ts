import { CancelUncompleted } from './action';
import { META_KEY } from './types';

export type SafeAny = any;

export interface ActionMetadata {
    // name: string;
    type: string;
    originalFn?: Function;
    cancelUncompleted?: CancelUncompleted;
}

export interface StoreMetaInfo {
    actions: Record<string, ActionMetadata>;
    path: string | null;
    children: any[];
    instance: any;
}

export type MetaHost = {
    [META_KEY]?: StoreMetaInfo;
};
