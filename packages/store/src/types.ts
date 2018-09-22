
import { InjectionToken } from '@angular/core';

export const META_KEY = '__NGX_MINI_STORE_META__';
export const ROOT_STATE_TOKEN = new InjectionToken<any>('ROOT_STATE_TOKEN');
export const FEATURE_STATE_TOKEN = new InjectionToken<any>('FEATURE_STATE_TOKEN');

export interface Dictionary<T> {
    [key: string]: T;
}

export interface ActionHandlerMetaData {
    originalFn: Function;
    type: string;
    functionName: string;
}

export interface StoreMetaInfo {
    actions: Dictionary<ActionHandlerMetaData>;
    path: string;
    children: any[];
    instance: any;
}
