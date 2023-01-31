import { InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';

export const StoreInitialStateToken = new InjectionToken('StoreInitialStateToken');
export const StoreOptionsToken = new InjectionToken('StoreOptionsToken');

export function injectStoreForTest<TState, T extends new (...args: any) => any, O>(
    storeClassic: T,
    initialState?: Partial<TState>,
    options?: O
): InstanceType<T> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
        providers: [
            { provide: StoreInitialStateToken, useValue: initialState },
            { provide: StoreOptionsToken, useValue: options },
            storeClassic
        ]
    });
    return TestBed.inject(storeClassic);
}
