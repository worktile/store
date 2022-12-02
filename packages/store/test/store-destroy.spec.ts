import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
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
});
