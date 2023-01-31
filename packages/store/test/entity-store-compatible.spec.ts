import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Action } from '../action';
import { EntityStore, EntityState } from '../entity-store';
import { Store } from '../store';

interface Animal {
    id: number;
    name: string;
}

interface ZoomState extends EntityState<Animal, unknown> {
    name: string;
}

@Injectable()
class ZoomStore extends EntityStore<ZoomState, unknown> {
    fetchAnimals$ = new Subject<Animal[]>();

    completeFetch(animals: Animal[]) {
        this.fetchAnimals$.next(animals);
        this.fetchAnimals$.complete();
    }

    constructor() {
        super({
            entities: [],
            name: ''
        });
    }

    @Action({})
    fetchAnimals() {
        return this.fetchAnimals$.pipe(
            tap((animals) => {
                const snapshot = this.snapshot;
                this.initialize(animals);
                snapshot.name = 'new name';
                this.update(snapshot);
            })
        );
    }

    @Action({})
    fetchAnimalsWithReferences() {
        return this.fetchAnimals$.pipe(
            tap((animals) => {
                const snapshot = this.snapshot;
                this.initializeWithReferences(animals, {});
                snapshot.name = 'new name';
                this.update(snapshot);
            })
        );
    }
}

describe('entity-store-compatible', () => {
    let animals = [{ id: 1, name: 'cat' }];

    let zoomStore: ZoomStore;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ZoomStore]
        });
        animals = [{ id: 1, name: 'cat' }];
        zoomStore = TestBed.inject(ZoomStore);
    });

    it('should set snapshot.name success after initialize', () => {
        zoomStore.fetchAnimals();
        zoomStore.completeFetch(animals);
        const newState = zoomStore.getState();
        expect(newState.entities).toEqual(animals);
        expect(newState.name).toEqual('new name');
    });

    it('should set snapshot.name success after initializeWithReferences', () => {
        zoomStore.fetchAnimalsWithReferences();
        zoomStore.completeFetch(animals);
        const newState = zoomStore.getState();
        expect(newState.entities).toEqual(animals);
        expect(newState.name).toEqual('new name');
    });
});
