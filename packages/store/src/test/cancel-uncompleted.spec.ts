import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { produce } from '@tethys/cdk';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Action } from '../action';
import { Store } from '../store';

interface Animal {
    id: number;
    name: string;
}

class ZoomState {
    animals: Animal[];
}

@Injectable()
class ZoomStore extends Store<ZoomState> {
    fetchAnimals$ = new Subject<Animal[]>();

    completeFetch(animals: Animal[]) {
        this.fetchAnimals$.next(animals);
        this.fetchAnimals$.complete();
    }

    constructor() {
        super({
            animals: []
        });
    }

    @Action({ cancelUncompleted: 'self' })
    fetchAnimalsWithCancelSelf() {
        return this.fetchAnimals$.pipe(
            tap((animals) => {
                this.setState({
                    animals: animals
                });
            })
        );
    }

    @Action({ cancelUncompleted: 'store' })
    fetchAnimalsWithCancelStore() {
        return this.fetchAnimals$.pipe(
            tap((animals) => {
                this.setState({
                    animals: animals
                });
            })
        );
    }

    @Action({ cancelUncompleted: 'all' })
    fetchAnimalsWithCancelAll() {
        return this.fetchAnimals$.pipe(
            tap((animals) => {
                this.setState({
                    animals: animals
                });
            })
        );
    }

    @Action({ cancelUncompleted: false })
    fetchAnimals() {
        return this.fetchAnimals$.pipe(
            tap((animals) => {
                this.setState({
                    animals: animals
                });
            })
        );
    }
}

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

    fetchFlowers$ = new Subject<string[]>();

    completeFetch(flowers: string[]) {
        this.fetchFlowers$.next();
        this.fetchFlowers$.complete();
    }

    @Action()
    fetchFlowers() {
        return this.fetchFlowers$.pipe(
            tap((flowers) => {
                this.setState({
                    flowers: flowers
                });
            })
        );
    }
}

describe('cancel-uncompleted', () => {
    let animals = [{ id: 1, name: 'cat' }];

    let zoomStore: ZoomStore;
    let gardenStore: GardenStore;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ZoomStore, GardenStore]
        });
        animals = [{ id: 1, name: 'cat' }];
        zoomStore = TestBed.inject(ZoomStore);
        gardenStore = TestBed.inject(GardenStore);
    });

    afterEach(() => {
        zoomStore.ngOnDestroy();
        gardenStore.ngOnDestroy();
    });

    it('should call action without cancel', () => {
        const firstSpy = jasmine.createSpy('first subscribe');
        const secondSpy = jasmine.createSpy('second subscribe');
        zoomStore.fetchAnimals().subscribe(firstSpy);
        zoomStore.fetchAnimals().subscribe(secondSpy);
        zoomStore.completeFetch(animals);
        expect(firstSpy).toHaveBeenCalled();
        expect(firstSpy).toHaveBeenCalledWith(animals);
        expect(secondSpy).toHaveBeenCalled();
        expect(secondSpy).toHaveBeenCalledWith(animals);
    });

    it('should cancel action for "self"', () => {
        const firstSpy = jasmine.createSpy('first subscribe');
        const secondSpy = jasmine.createSpy('second subscribe');
        const thirdSpy = jasmine.createSpy('third subscribe');
        zoomStore.fetchAnimals().subscribe(firstSpy);
        zoomStore.fetchAnimalsWithCancelSelf().subscribe(secondSpy);
        zoomStore.fetchAnimalsWithCancelSelf().subscribe(thirdSpy);
        zoomStore.completeFetch(animals);
        expect(firstSpy).toHaveBeenCalled();
        expect(firstSpy).toHaveBeenCalledWith(animals);
        expect(secondSpy).not.toHaveBeenCalled();
        expect(thirdSpy).toHaveBeenCalled();
        expect(thirdSpy).toHaveBeenCalledWith(animals);
    });

    it('should cancel actions for "store"', () => {
        const firstSpy = jasmine.createSpy('first subscribe');
        const secondSpy = jasmine.createSpy('second subscribe');
        zoomStore.fetchAnimals().subscribe(firstSpy);
        zoomStore.fetchAnimalsWithCancelStore().subscribe(secondSpy);
        zoomStore.completeFetch(animals);
        expect(firstSpy).not.toHaveBeenCalled();
        expect(secondSpy).toHaveBeenCalled();
        expect(secondSpy).toHaveBeenCalledWith(animals);
    });

    it('should cancel actions for "all"', () => {
        const firstSpy = jasmine.createSpy('first subscribe');
        const secondSpy = jasmine.createSpy('second subscribe');
        const thirdSpy = jasmine.createSpy('third subscribe');
        gardenStore.fetchFlowers().subscribe(firstSpy);
        zoomStore.fetchAnimals().subscribe(secondSpy);

        zoomStore.fetchAnimalsWithCancelAll().subscribe(thirdSpy);
        gardenStore.completeFetch(['rose']);
        zoomStore.completeFetch(animals);
        expect(firstSpy).not.toHaveBeenCalled();
        expect(secondSpy).not.toHaveBeenCalled();
        expect(thirdSpy).toHaveBeenCalled();
        expect(thirdSpy).toHaveBeenCalledWith(animals);
    });

    it('should cancel store actions invoke store.cancelUncompleted', () => {
        const firstSpy = jasmine.createSpy('first subscribe');
        const secondSpy = jasmine.createSpy('second subscribe');
        zoomStore.fetchAnimals().subscribe(firstSpy);
        zoomStore.fetchAnimalsWithCancelStore().subscribe(secondSpy);
        zoomStore.cancelUncompleted();
        zoomStore.completeFetch(animals);
        expect(firstSpy).not.toHaveBeenCalled();
        expect(secondSpy).not.toHaveBeenCalled();
    });
});
