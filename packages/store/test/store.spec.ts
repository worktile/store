import { Component, Inject, Injectable, Optional, effect } from '@angular/core';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { produce } from '@tethys/cdk/immutable';
import { of, throwError } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { Action } from '../action';
import { Store } from '../store';
import { StoreFactory } from '../store-factory';
import { injectStoreForTest, StoreInitialStateToken } from './inject-store';

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

    static fooNameSelector = (state: ZoomState) => {
        return state.foo?.name;
    };

    static fooDescriptionSelector = (state: ZoomState) => {
        return state.foo?.description;
    };

    constructor(
        @Optional()
        @Inject(StoreInitialStateToken)
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
                this.update({
                    animals: produce(this.getState().animals).add(animal)
                });
            })
        );
    }

    @Action()
    removeAnimal(id: number) {
        this.update({
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

@Component({
    selector: 'thy-test-zoom',
    template: ``,
    standalone: false
})
class TesZoomComponent {
    fooNameStateSpy = jasmine.createSpy('foo name spy');
    fooNameState = this.store.select(ZoomStore.fooNameSelector);

    fooDescriptionStateSpy = jasmine.createSpy('foo description spy');
    fooDescriptionState = this.store.select(ZoomStore.fooDescriptionSelector);

    constructor(public store: ZoomStore) {
        effect(() => {
            this.fooNameStateSpy(this.fooNameState());
        });

        effect(() => {
            this.fooDescriptionStateSpy(this.fooDescriptionState());
        });
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

    describe('#initialize', () => {
        it('should get initial state value is null with initialize', () => {
            store = injectStoreForTest(ZoomStore, null);
            expect(store.getState()).toEqual(null);
            expect(store.state()).toEqual(null);
        });

        it('should get initial state value is empty with initialize', () => {
            store = injectStoreForTest(ZoomStore, {
                animals: [],
                foo: null
            });
            expect(store.getState()).toEqual({
                animals: [],
                foo: null
            });
            expect(store.state()).toEqual({
                animals: [],
                foo: null
            });
        });

        it('should get initial state value has data with initialize', () => {
            const animals = createSomeAnimals();
            const foo = { id: 1, name: 'Foo', description: 'This is a foo' };
            store = injectStoreForTest(ZoomStore, {
                animals: animals,
                foo: foo
            });
            expect(store.getState()).toEqual({
                animals: animals,
                foo: foo
            });
            expect(store.state()).toEqual({
                animals: animals,
                foo: foo
            });
        });

        it('should get correct data through subscribe select animals stream', () => {
            const animals = createSomeAnimals();
            const foo = { id: 1, name: 'Foo', description: 'This is a foo' };
            store = injectStoreForTest(ZoomStore, {
                animals: animals,
                foo: foo
            });
            const animalsSpy = jasmine.createSpy('animals spy');
            store.select$(ZoomStore.animalsSelector).subscribe(animalsSpy);
            expect(animalsSpy).toHaveBeenCalled();
            expect(animalsSpy).toHaveBeenCalledWith(animals);
        });

        it('should get correct data through select animals state', () => {
            const animals = createSomeAnimals();
            const foo = { id: 1, name: 'Foo', description: 'This is a foo' };
            store = injectStoreForTest(ZoomStore, {
                animals: animals,
                foo: foo
            });
            const animalsState = store.select(ZoomStore.animalsSelector);
            expect(animalsState()).toEqual(animals);
        });

        it('should effect fooNameState and not effect fooDescriptionState', () => {
            const animals = createSomeAnimals();
            const foo = { id: 1, name: 'Foo', description: 'This is a foo' };
            const newFoo = { ...foo, name: 'new foo name' };

            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                declarations: [TesZoomComponent],
                providers: [ZoomStore, { provide: StoreInitialStateToken, useValue: { animals: animals, foo: foo } }]
            });

            const store = TestBed.inject(ZoomStore);

            const fixture = TestBed.createComponent(TesZoomComponent);
            const component = fixture.componentInstance;

            fixture.detectChanges();

            expect(component.fooNameStateSpy).toHaveBeenCalledTimes(1);
            expect(component.fooNameStateSpy).toHaveBeenCalledWith(foo.name);
            expect(component.fooDescriptionStateSpy).toHaveBeenCalledTimes(1);

            store.update({ foo: newFoo });
            fixture.detectChanges();

            expect(component.fooNameStateSpy).toHaveBeenCalledTimes(2);
            expect(component.fooNameStateSpy).toHaveBeenCalledWith(newFoo.name);
            expect(component.fooDescriptionStateSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('#state', () => {
        it('should get correct state value', () => {
            const animals = createSomeAnimals();
            const foo = { id: 1, name: 'foo name', description: 'foo description' };
            store = injectStoreForTest(ZoomStore, {
                animals: animals,
                foo: foo
            });
            expect(store.getState()).toEqual({
                animals: animals,
                foo: foo
            });
            expect(store.state()).toEqual({
                animals: animals,
                foo: foo
            });
        });

        it('should deliver whole state value to setState function success', () => {
            const animals = createSomeAnimals();
            const foo = { id: 1, name: 'foo name', description: 'foo description' };
            store = injectStoreForTest(ZoomStore, {
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

        it('should update state success through set new partial state object', () => {
            const animals = createSomeAnimals();
            const newFoo = { id: 100, name: 'new foo name', description: 'new foo description' };
            store = injectStoreForTest(ZoomStore, {
                animals: animals,
                foo: null
            });
            store.update({
                foo: newFoo
            });
            expect(store.getState()).toEqual({
                animals: animals,
                foo: newFoo
            });
            expect(store.state()).toEqual({
                animals: animals,
                foo: newFoo
            });
        });

        it('should update state success through invoke update function', () => {
            const animals = createSomeAnimals();
            const newFoo = { id: 100, name: 'new foo name', description: 'new foo description' };
            const addAnimalMonster = { id: 100, name: 'monster' };
            store = injectStoreForTest(ZoomStore, {
                animals: animals,
                foo: null
            });
            store.update((state) => {
                return {
                    foo: newFoo,
                    animals: [...state.animals, addAnimalMonster]
                };
            });
            expect(store.getState()).toEqual({
                animals: [...animals, addAnimalMonster],
                foo: newFoo
            });
            expect(store.state()).toEqual({
                animals: [...animals, addAnimalMonster],
                foo: newFoo
            });
        });

        it('should update state success through invoke update function which return partial state object', () => {
            const animals = createSomeAnimals();
            const newFoo = { id: 100, name: 'new foo name', description: 'new foo description' };
            store = injectStoreForTest(ZoomStore, {
                animals: animals,
                foo: null
            });
            store.update((state) => {
                return {
                    foo: newFoo
                };
            });
            expect(store.getState()).toEqual({
                animals: animals,
                foo: newFoo
            });
            expect(store.state()).toEqual({
                animals: animals,
                foo: newFoo
            });
        });

        describe('deprecated setState ', () => {
            it('should set state success through set new partial state object', () => {
                const animals = createSomeAnimals();
                const newFoo = { id: 100, name: 'new foo name', description: 'new foo description' };
                store = injectStoreForTest(ZoomStore, {
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
                store = injectStoreForTest(ZoomStore, {
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
                store = injectStoreForTest(ZoomStore, {
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
        });

        it('should clear state success', () => {
            const animals = createSomeAnimals();
            const foo = { id: 1, name: 'foo name', description: 'foo description' };
            const newFoo = { id: 10, name: 'new foo name', description: 'new foo description' };
            store = injectStoreForTest(ZoomStore, {
                animals: animals,
                foo: foo
            });
            store.update({
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
            expect(store.state()).toEqual({
                animals: animals,
                foo: foo
            });
        });

        it('should clear state success after only change an animal name', () => {
            const animals = createSomeAnimals();
            const foo = { id: 1, name: 'foo name', description: 'foo description' };
            store = injectStoreForTest(ZoomStore, {
                animals: animals,
                foo: foo
            });
            store.setState((state) => {
                state.foo.name = 'new foo name';
                return {
                    animals: [...state.animals, { id: 100, name: 'new cat' }],
                    foo: foo
                };
            });
            expect(store.getState().animals.find((animal) => animal.id === 100).name).toEqual('new cat');
            expect(store.getState().foo.name).toEqual('new foo name');
            store.clearState();
            expect(store.getState()).toEqual({
                animals: animals,
                foo: { id: 1, name: 'foo name', description: 'foo description' }
            });
        });

        it('should get correct snapshot', () => {
            const animals = createSomeAnimals();
            const foo = { id: 1, name: 'foo name', description: 'foo description' };
            const newFoo = { id: 10, name: 'new foo name', description: 'new foo description' };
            store = injectStoreForTest(ZoomStore, {
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

    describe('#value-type-state', () => {
        @Injectable()
        class CounterStore extends Store<number> {
            constructor() {
                super(0);
            }

            @Action()
            increase() {
                this.update(this.snapshot + 1);
            }

            @Action()
            decrease() {
                this.update(this.snapshot - 1);
            }
        }

        let store: CounterStore;

        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [CounterStore]
            });
            store = TestBed.inject(CounterStore);
        });

        it('should get initial state', () => {
            expect(store.getState()).toEqual(0);
            expect(store.state()).toEqual(0);
        });

        it('should increase', () => {
            expect(store.getState()).toEqual(0);
            store.increase();
            expect(store.getState()).toEqual(1);
            expect(store.state()).toEqual(1);
        });

        it('should decrease', () => {
            expect(store.getState()).toEqual(0);
            store.decrease();
            expect(store.getState()).toEqual(-1);
            expect(store.state()).toEqual(-1);
        });
    });

    describe('#action', () => {
        it('should auto subscribe action result stream when invoke action', () => {
            const animals = createSomeAnimals();
            const addAnimalMonster = { id: 100, name: 'monster' };
            store = injectStoreForTest(ZoomStore, {
                animals: animals
            });
            const animalsSpy = jasmine.createSpy('animals selector spy');
            store.select$(ZoomStore.animalsSelector).subscribe(animalsSpy);
            expect(animalsSpy).toHaveBeenCalledTimes(1);
            store.addAnimal(addAnimalMonster).subscribe();
            expect(animalsSpy).toHaveBeenCalledTimes(2);
            expect(animalsSpy).toHaveBeenCalledWith([...animals, addAnimalMonster]);
        });

        it('should get correct value when subscribe action result stream by invoke action', () => {
            const animals = createSomeAnimals();
            const addAnimalMonster = { id: 100, name: 'monster' };
            store = injectStoreForTest(ZoomStore, {
                animals: animals
            });
            const animalsSpy = jasmine.createSpy('animals selector spy');
            const addAnimalSpy = jasmine.createSpy('add animal next spy');
            store.select$(ZoomStore.animalsSelector).subscribe(animalsSpy);
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
            store = injectStoreForTest(ZoomStore, {
                animals: animals
            });
            const result = store.pureAddWithReturnValue(addAnimalMonster);
            expect(result).toBe(addAnimalMonster);
            expect(store.snapshot.animals).toEqual([...animals, addAnimalMonster]);
        });
    });

    describe('#getStoreInstanceId', () => {
        it('should get correct InstanceId', () => {
            store = injectStoreForTest(ZoomStore, {});
            const expectedInstanceIdPattern = /^ZoomStore-\d+$/;
            expect(store.getStoreInstanceId()).toMatch(expectedInstanceIdPattern);
        });
    });

    describe('#getStoreInstanceName', () => {
        it('should get correct InstanceName', () => {
            store = injectStoreForTest(ZoomStore, {});
            expect(store.getName()).toEqual('ZoomStore');
        });
    });

    describe('#error', () => {
        it('should throw error', fakeAsync(() => {
            store = injectStoreForTest(ZoomStore);
            const successSpy = jasmine.createSpy('success spy');
            const errorSpy = jasmine.createSpy('error spy');
            const completeSpy = jasmine.createSpy('complete spy');
            store.onError().subscribe(successSpy, errorSpy, completeSpy);
            expect(successSpy).toHaveBeenCalledTimes(0);
            expect(errorSpy).toHaveBeenCalledTimes(1);
        }));

        it('should throw error directly', fakeAsync(() => {
            store = injectStoreForTest(ZoomStore);
            expect(() => {
                store.onErrorDirectly();
            }).toThrowError('this is a directly test error');
        }));

        it('should call once action when action throw error', () => {
            store = injectStoreForTest(ZoomStore, {});
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
            store = injectStoreForTest(ZoomStore, {});
            const storeFactory = TestBed.inject(StoreFactory);
            const stores = storeFactory.getStores('ZoomStore');
            expect(stores[0]).toEqual(store);
        });
    });
});
