import { Injectable, InjectionToken, StaticProvider } from '@angular/core';
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

@Injectable()
class GardenStoreWithUnlimitedCount extends Store<GardenState> {
    constructor() {
        super(undefined, { instanceMaxCount: 0 });
    }
}

@Injectable()
class GardenStoreWithCustomLimitedCount extends Store<GardenState> {
    constructor() {
        super(undefined, { instanceMaxCount: 50, name: 'GardenStoreWithCustomLimitedCount' });
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
        const expectedInstanceIdPattern = /^garden-\d+$/;
        expect(store.getStoreInstanceId()).toMatch(expectedInstanceIdPattern);
    });

    it(`should set entity store name with options's name`, () => {
        const store = TestBed.inject(GardensStore);
        expect(store).toBeDefined();
        const expectedInstanceIdPattern = /^gardens-\d+$/;
        expect(store.getStoreInstanceId()).toMatch(expectedInstanceIdPattern);
    });

    it('should throw errors when store instance count > 20', () => {
        const destroy = createStores(20, GardenStore);
        expect(() => {
            TestBed.inject(GardenStore);
        }).toThrowError(`store 'garden' created more than 20, please check it.`);
        destroy();
    });

    it('should create store instance by custom limited count, instanceMaxCount = 50', () => {
        const destroy = createStores(50, GardenStoreWithCustomLimitedCount);
        expect(() => {
            TestBed.inject(GardenStoreWithCustomLimitedCount);
        }).toThrowError(`store 'GardenStoreWithCustomLimitedCount' created more than 50, please check it.`);
        destroy();
    });

    it('should create store instance without limited count, instanceMaxCount = 0', () => {
        const destroy = createStores(500, GardenStoreWithUnlimitedCount);
        destroy();
        expect(true).toBe(true);
    });

    function createStores(count: number, store: { new (...args: any[]): Store }) {
        const stores: Store[] = [];
        TestBed.resetTestingModule();
        const TOKEN = new InjectionToken('token');
        TestBed.configureTestingModule({
            providers: [
                GardenStore,
                GardensStore,
                GardenStoreWithCustomLimitedCount,
                {
                    provide: TOKEN,
                    useFactory: () => {
                        for (let i = 0; i < count; i++) {
                            stores.push(new store());
                        }
                        return stores;
                    }
                }
            ]
        });

        TestBed.inject(TOKEN);

        return () => {
            stores.forEach((store) => {
                store.ngOnDestroy();
            });
        };
    }
});
