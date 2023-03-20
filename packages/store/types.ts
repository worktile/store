import { InjectionToken } from '@angular/core';
import { Id as CDKId } from '@tethys/cdk';
import { MergeReferencesStrategy } from './references';

export const META_KEY = '__THY_META__';
export const ROOT_STORES_TOKEN = new InjectionToken<any>('ROOT_STORES_TOKEN');
export const FEATURE_STORES_TOKEN = new InjectionToken<any>('FEATURE_STORES_TOKEN');

export type Id = CDKId;

export interface PaginationInfo {
    count?: number;
    pageCount?: number;
    pageIndex?: number;
    pageSize?: number;
}

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
    mergeReferencesStrategy?: MergeReferencesStrategy;
}

export type UpdateStatePredicate<State, NewState extends Partial<State> = Partial<State>> = (state: State) => NewState | void;
