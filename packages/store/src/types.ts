import { InjectionToken } from '@angular/core';

export const META_KEY = '__THY_META__';
export const ROOT_STATE_TOKEN = new InjectionToken<any>('ROOT_STATE_TOKEN');
export const FEATURE_STATE_TOKEN = new InjectionToken<any>('FEATURE_STATE_TOKEN');

export interface Id {
    toString(): string;
}

export interface PaginationInfo {
    count?: number;
    pageCount?: number;
    pageIndex?: number;
    pageSize?: number;
}

// export type Newable<T> = { new (...args: any[]): T };

/**
 * Store options
 */
export interface StoreOptions {
    /**
     * Define name of store, default name is generated according to the class name, e.g. class ZoomStore name is `ZoomStore`
     */
    name?: string;
    /**
     * The max number of instances for the current store, set to 0 means unlimited
     * Note: only throw error in devMode, unlimited in production environment
     * @default 20
     */
    instanceMaxCount?: number;
}
