import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { InternalStoreFactory } from '../internals/internal-store-factory';
import { Store } from '../store';

class GardenState {
    flowers: string[];
}
@Injectable()
class GardenStore extends Store<GardenState> {
    constructor() {
        super({ flowers: [] }, { name: 'GardenStore' });
    }
}

describe('store-auto-destroy', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [GardenStore]
        });
    });

    it('should inject store', () => {
        const store = TestBed.inject(GardenStore);
        expect(store).toBeDefined();
        const expectedInstanceIdPattern = /^GardenStore-\d+$/;
        expect(store.getStoreInstanceId()).toMatch(expectedInstanceIdPattern);
    });

    it('should get same id for inject store again', () => {
        const store = TestBed.inject(GardenStore);
        expect(store).toBeDefined();
        const expectedInstanceIdPattern = /^GardenStore-\d+$/;
        expect(store.getStoreInstanceId()).toMatch(expectedInstanceIdPattern);
    });

    it('should store destroy', () => {
        let store = TestBed.inject(GardenStore);
        const storeName = store.getName();
        const storeInstanceId = store.getStoreInstanceId();
        expect(store).toBeDefined();
        expect(InternalStoreFactory.instance.get(storeInstanceId)).toBeTruthy();
        expect(InternalStoreFactory.instance.getStoresByNames(storeName)).toBeTruthy();
        store.ngOnDestroy();
        expect(InternalStoreFactory.instance.get(storeInstanceId)).toBeFalsy();
    });

    it('should weakRef effective', () => {
        InternalStoreFactory.instance['storeInstancesMap'] = new Map<string, WeakRef<Store>>();
        const store = TestBed.inject(GardenStore);
        const storeName = store.getName();
        const storeInstanceId = store.getStoreInstanceId();
        expect(store).toBeDefined();
        expect(InternalStoreFactory.instance.getStoresByNames(storeName)).toBeTruthy();
        expect(InternalStoreFactory.instance['storeInstancesMap'].size).toBe(1);
        spyOn(InternalStoreFactory.instance['storeInstancesMap'].get(storeInstanceId), 'deref').and.returnValue(null);
        expect(InternalStoreFactory.instance.getStoresByNames(storeName)).toEqual([]);
        expect(InternalStoreFactory.instance['storeInstancesMap'].size).toBe(0);
    });
});
