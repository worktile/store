import { Injectable } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { InternalStoreFactory } from '../internals/internal-store-factory';
import { Store } from '../store';

class GardenState {
    flowers: string[];
}
@Injectable()
class GardenStore extends Store<GardenState> {
    constructor() {
        super({
            flowers: []
        });
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
        expect(store.getStoreInstanceId()).toBe('GardenStore');
    });

    it('should get same id for inject store again', () => {
        const store = TestBed.inject(GardenStore);
        expect(store).toBeDefined();
        expect(store.getStoreInstanceId()).toBe('GardenStore');
    });

    it('should store destroy', fakeAsync(() => {
        let store = TestBed.inject(GardenStore);
        const storeName = store.getName();
        expect(store).toBeDefined();
        expect(InternalStoreFactory.instance.get(storeName)).toBeTruthy();
        expect(InternalStoreFactory.instance.getStoresByNames(storeName)).toBeTruthy();
        store.ngOnDestroy();
        expect(InternalStoreFactory.instance.get(storeName)).toBeFalsy();
        let mockStore = {
            getStoreInstanceId: () => {
                return 'mockStore';
            }
        } as any;
        InternalStoreFactory.instance.register(mockStore as any);
        expect(InternalStoreFactory.instance['storeInstancesMap'].size).toBe(1);
        spyOn(InternalStoreFactory.instance['storeInstancesMap'].get('mockStore'), 'deref').and.returnValue(null);
        expect(InternalStoreFactory.instance.get('mockStore')).toBeFalsy();
        expect(InternalStoreFactory.instance['storeInstancesMap'].size).toBe(0);
    }));
});
