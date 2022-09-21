import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EntityState, EntityStore } from '../entity-store';
import { Store } from '../store';

interface GardenState {
    flowers: string[];
}
@Injectable()
class GardenStore extends Store<GardenState> {
    constructor() {
        super(undefined, { name: 'garden' });
    }
}

interface GardensState extends EntityState<string> {}

@Injectable()
class GardensStore extends EntityStore<GardensState, string> {
    constructor() {
        super(undefined, { name: 'gardens' });
    }
}

describe('store-with-options', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [GardenStore, GardensStore]
        });
    });

    it(`should set store name with options's name`, () => {
        const store = TestBed.inject(GardenStore);
        expect(store).toBeDefined();
        expect(store.getStoreInstanceId()).toBe('garden');
    });

    it(`should set entity store name with options's name`, () => {
        const store = TestBed.inject(GardensStore);
        expect(store).toBeDefined();
        expect(store.getStoreInstanceId()).toBe('gardens');
    });
});
