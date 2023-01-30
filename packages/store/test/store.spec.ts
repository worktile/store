import { Injectable } from '@angular/core';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { produce } from '@tethys/cdk/immutable';
import { of, throwError } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { Action } from '../action';
import { Store } from '../store';
import { StoreFactory } from '../store-factory';

interface Animal {
    id: number;
    name: string;
}

interface FooEntity {
    id: number;
    name: string;
    description: string;
}

class ZoomState {
    animals: Animal[];
    foo: FooEntity;
}

@Injectable()
class ZoomStore extends Store<ZoomState> {
    static animalsSelector = (state: ZoomState) => {
        return state.animals;
    };

    constructor(
        initialState: Partial<ZoomState> = {
            animals: [],
            foo: null
        }
    ) {
        super(initialState);
    }

    @Action()
    addAnimal(animal: Animal) {
        return of(animal).pipe(
            tap(() => {
                this.setState({
                    animals: produce(this.getState().animals).add(animal)
                });
            })
        );
    }

    @Action()
    removeAnimal(id: number) {
        this.setState({
            animals: produce(this.getState().animals).remove(id as any)
        });
    }

    @Action()
    addAnimalWithError(animal: Animal, executeFn: () => void) {
        return of(animal).pipe(
            tap(() => {
                executeFn();
                throw new Error(`add animal failed`);
            })
        );
    }

    @Action()
    onError() {
        return of(true).pipe(
            mergeMap(() => {
                return throwError(new Error('this is a test error'));
            })
        );
    }

    @Action()
    onErrorDirectly() {
        throw new Error('this is a directly test error');
    }

    @Action()
    pureAddWithReturnValue(animal: Animal) {
        this.setState({
            animals: produce(this.getState().animals).add(animal)
        });
        return animal;
    }
}

describe('#store', () => {
    let store: ZoomStore;
    function createSomeAnimals(): Animal[] {
        return ['cat', 'dog', 'chicken', 'duck'].map((name, index) => {
            return {
                name: name,
                id: index + 1
            };
        });
    }

    afterEach(() => {
        store && store.ngOnDestroy();
    });

    describe('#initialize', () => {
        it('should get initial state value is null with initialize', () => {
            store = new ZoomStore(null);
            expect(store.getState()).toEqual(null);
        });

        it('should get initial state value is empty with initialize', () => {
            store = new ZoomStore({
                animals: [],
                foo: null
            });
            expect(store.getState()).toEqual({
                animals: [],
                foo: null
            });
        });

        it('should get initial state value has data with initialize', () => {
            const animals = createSomeAnimals();
            const foo = { id: 1, name: 'Foo', description: 'This is a foo' };
            store = new ZoomStore({
                animals: animals,
                foo: foo
            });
            expect(store.getState()).toEqual({
                animals: animals,
                foo: foo
            });
        });

        it('should get correct data through subscribe select animals stream', () => {
            const animals = createSomeAnimals();
            const foo = { id: 1, name: 'Foo', description: 'This is a foo' };
            store = new ZoomStore({
                animals: animals,
                foo: foo
            });
            const animalsSpy = jasmine.createSpy('animals spy');
            store.select(ZoomStore.animalsSelector).subscribe(animalsSpy);
            expect(animalsSpy).toHaveBeenCalled();
            expect(animalsSpy).toHaveBeenCalledWith(animals);
        });
    });

    describe('#state', () => {
        it('should get correct state value', () => {
            const animals = createSomeAnimals();
            const foo = { id: 1, name: 'foo name', description: 'foo description' };
            store = new ZoomStore({
                animals: animals,
                foo: foo
            });
            expect(store.getState()).toEqual({
                animals: animals,
                foo: foo
            });
        });

        it('should deliver whole state value to setState function success', () => {
            const animals = createSomeAnimals();
            const foo = { id: 1, name: 'foo name', description: 'foo description' };
            store = new ZoomStore({
                animals: animals,
                foo: foo
            });
            const setStateSpy = jasmine.createSpy('setState spy');
            store.setState(setStateSpy);
            expect(setStateSpy).toHaveBeenCalledWith({
                animals: animals,
                foo: foo
            });
        });

        it('should set state success through set new partial state object', () => {
            const animals = createSomeAnimals();
            const newFoo = { id: 100, name: 'new foo name', description: 'new foo description' };
            store = new ZoomStore({
                animals: animals,
                foo: null
            });
            store.setState({
                foo: newFoo
            });
            expect(store.getState()).toEqual({
                animals: animals,
                foo: newFoo
            });
        });

        it('should set state success through invoke setState function', () => {
            const animals = createSomeAnimals();
            const newFoo = { id: 100, name: 'new foo name', description: 'new foo description' };
            const addAnimalMonster = { id: 100, name: 'monster' };
            store = new ZoomStore({
                animals: animals,
                foo: null
            });
            store.setState((state) => {
                return {
                    foo: newFoo,
                    animals: [...state.animals, addAnimalMonster]
                };
            });
            expect(store.getState()).toEqual({
                animals: [...animals, addAnimalMonster],
                foo: newFoo
            });
        });

        it('should set state success through invoke setState function which return partial state object', () => {
            const animals = createSomeAnimals();
            const newFoo = { id: 100, name: 'new foo name', description: 'new foo description' };
            store = new ZoomStore({
                animals: animals,
                foo: null
            });
            store.setState((state) => {
                return {
                    foo: newFoo
                };
            });
            expect(store.getState()).toEqual({
                animals: animals,
                foo: newFoo
            });
        });

        it('should clear state success', () => {
            const animals = createSomeAnimals();
            const foo = { id: 1, name: 'foo name', description: 'foo description' };
            const newFoo = { id: 10, name: 'new foo name', description: 'new foo description' };
            store = new ZoomStore({
                animals: animals,
                foo: foo
            });
            store.setState({
                animals: [{ id: 100, name: 'new' }],
                foo: newFoo
            });
            expect(store.getState()).toEqual({
                animals: [{ id: 100, name: 'new' }],
                foo: newFoo
            });
            store.clearState();
            expect(store.getState()).toEqual({
                animals: animals,
                foo: foo
            });
        });

        it('should clear state success after only change an animal name', () => {
            const animals = createSomeAnimals();
            const _animals = createSomeAnimals();
            const foo = { id: 1, name: 'foo name', description: 'foo description' };
            store = new ZoomStore({
                animals: animals,
                foo: foo
            });
            store.setState(state => {
                const catIndex = state.animals.findIndex(animal => animal.name === 'cat')
                state.animals[catIndex] = { name: 'cat', id: 100 }
                state.animals = [...state.animals]
                return state
            });
            expect(store.getState().animals.find(animal => animal.name === 'cat').id).toEqual(100);
            store.clearState();
            expect(store.getState()).toEqual({
                animals: _animals,
                foo: foo
            });
        })

        it('should get correct snapshot', () => {
            const animals = createSomeAnimals();
            const foo = { id: 1, name: 'foo name', description: 'foo description' };
            const newFoo = { id: 10, name: 'new foo name', description: 'new foo description' };
            store = new ZoomStore({
                animals: animals,
                foo: foo
            });
            expect(store.snapshot).toEqual({
                animals: animals,
                foo: foo
            });
            store.setState({
                animals: [{ id: 100, name: 'new' }],
                foo: newFoo
            });
            expect(store.snapshot).toEqual({
                animals: [{ id: 100, name: 'new' }],
                foo: newFoo
            });
        });
    });

    describe('#action', () => {
        it('should auto subscribe action result stream when invoke action', () => {
            const animals = createSomeAnimals();
            const addAnimalMonster = { id: 100, name: 'monster' };
            store = new ZoomStore({
                animals: animals
            });
            const animalsSpy = jasmine.createSpy('animals selector spy');
            store.select(ZoomStore.animalsSelector).subscribe(animalsSpy);
            expect(animalsSpy).toHaveBeenCalledTimes(1);
            store.addAnimal(addAnimalMonster).subscribe();
            expect(animalsSpy).toHaveBeenCalledTimes(2);
            expect(animalsSpy).toHaveBeenCalledWith([...animals, addAnimalMonster]);
        });

        it('should get correct value when subscribe action result stream by invoke action', () => {
            const animals = createSomeAnimals();
            const addAnimalMonster = { id: 100, name: 'monster' };
            store = new ZoomStore({
                animals: animals
            });
            const animalsSpy = jasmine.createSpy('animals selector spy');
            const addAnimalSpy = jasmine.createSpy('add animal next spy');
            store.select(ZoomStore.animalsSelector).subscribe(animalsSpy);
            expect(animalsSpy).toHaveBeenCalledTimes(1);
            store.addAnimal(addAnimalMonster).subscribe(addAnimalSpy);
            expect(animalsSpy).toHaveBeenCalledTimes(2);
            expect(animalsSpy).toHaveBeenCalledWith([...animals, addAnimalMonster]);
            expect(addAnimalSpy).toHaveBeenCalledTimes(1);
            expect(addAnimalSpy).toHaveBeenCalledWith(addAnimalMonster);
        });

        it('should return value when invoke action without observable', () => {
            const animals = createSomeAnimals();
            const addAnimalMonster = { id: 100, name: 'monster' };
            store = new ZoomStore({
                animals: animals
            });
            const result = store.pureAddWithReturnValue(addAnimalMonster);
            expect(result).toBe(addAnimalMonster);
            expect(store.snapshot.animals).toEqual([...animals, addAnimalMonster]);
        });
    });

    describe('#getStoreInstanceId', () => {
        it('should get correct InstanceId', () => {
            store = new ZoomStore({});
            expect(store.getStoreInstanceId()).toEqual('ZoomStore');
            store.ngOnDestroy();
        });
    });

    describe('#getStoreInstanceName', () => {
        it('should get correct InstanceName', () => {
            store = new ZoomStore({});
            expect(store.getName()).toEqual('ZoomStore');
            store.ngOnDestroy();
        });
    });

    describe('#error', () => {
        it('should throw error', fakeAsync(() => {
            store = new ZoomStore();
            const successSpy = jasmine.createSpy('success spy');
            const errorSpy = jasmine.createSpy('error spy');
            const completeSpy = jasmine.createSpy('complete spy');
            store.onError().subscribe(successSpy, errorSpy, completeSpy);
            expect(successSpy).toHaveBeenCalledTimes(0);
            expect(errorSpy).toHaveBeenCalledTimes(1);
        }));

        it('should throw error directly', fakeAsync(() => {
            store = new ZoomStore();
            expect(() => {
                store.onErrorDirectly();
            }).toThrowError('this is a directly test error');
        }));

        it('should call once action when action throw error', () => {
            store = new ZoomStore({});
            const executeSpy = jasmine.createSpy('execute spy in action');
            const successSpy = jasmine.createSpy('success spy');
            const errorSpy = jasmine.createSpy('error spy');
            store.addAnimalWithError({ id: 100, name: '' }, executeSpy).subscribe(successSpy, errorSpy);
            expect(executeSpy).toHaveBeenCalledTimes(1);
            expect(successSpy).toHaveBeenCalledTimes(0);
            expect(errorSpy).toHaveBeenCalledTimes(1);
            expect(errorSpy).toHaveBeenCalledWith(new Error(`add animal failed`));
        });
    });

    describe('#storeFactory', () => {
        it('should get stores by name', () => {
            store = new ZoomStore({});
            const storeFactory = TestBed.inject(StoreFactory);
            const stores = storeFactory.getStores('ZoomStore');
            expect(stores[0]).toEqual(store);
        });
    });
});
