import { Inject, Injectable, Optional, InjectionToken } from '@angular/core';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { produce } from '@tethys/cdk/immutable';
import { of, throwError } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { Action } from '../action';
import { Store } from '../store';
import { StoreFactory } from '../store-factory';
import { injectStoreForTest, StoreInitialStateToken } from './inject-store';
import { SafeAny } from '@tethys/store/inner-types';

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

export interface User {
    _id: string;
    name: string;
}

export interface DetailReferences {
    users?: User[];
    states?: { _id: string; [key: string]: SafeAny }[];
}

interface DetailState {
    _id: string;
    [key: string]: SafeAny;
}

@Injectable()
class ZoomStore extends Store<ZoomState> {
    static animalsSelector = (state: ZoomState) => {
        return state.animals;
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

@Injectable()
export class DetailStore extends Store<DetailState, DetailReferences> {
    constructor() {
        super({});
    }

    @Action()
    fetchDetail() {
        const data = {
            value: {
                title: '如何实现骨架屏',
                maintenance_uid: 'user2',
                test_library_id: '5d68c672e514ac452594ba44',
                suite_ids: ['60ecf0c9fe7a7a8d8c2c8ecb', '6368ccf675ec249953b63020'],
                state_id: 'no-start-state-id'
            },
            references: {
                library: [
                    {
                        name: '提升用户体验',
                        _id: '5d68c672e514ac452594ba44'
                    }
                ],
                suites: [
                    {
                        _id: '60ecf0c9fe7a7a8d8c2c8ecb',
                        name: '其他模块'
                    },
                    {
                        _id: '6368ccf675ec249953b63020',
                        name: '模块01'
                    }
                ],
                states: [
                    {
                        _id: 'no-start-state-id',
                        name: '未开始'
                    }
                ],
                users: [
                    { _id: 'user1', name: 'why520crazy' },
                    { _id: 'user2', name: 'peter' }
                ],
                properties: [
                    {
                        key: 'test_library_id',
                        name: '测试库',
                        value_path: 'test_library_id',
                        lookup: 'library'
                    },
                    {
                        key: 'suite_ids',
                        name: '模块',
                        value_path: 'suite_ids',
                        lookup: 'suites'
                    },
                    {
                        key: 'state_id',
                        name: '状态',
                        value_path: 'state_id',
                        lookup: 'states'
                    },
                    {
                        key: 'maintenance_uid',
                        name: '负责人',
                        value_path: 'maintenance_uid',
                        lookup: 'users'
                    }
                ]
            }
        };
        return of(data).pipe(
            tap((data) => {
                this.initializeWithReferences(data.value, data.references, data.references.properties);
            })
        );
    }

    @Action()
    changeStateAndMaintenance() {
        const data = {
            value: {
                state_id: 'success-state-id',
                maintenance_uid: 'user3'
            },
            references: {
                states: [
                    {
                        _id: 'success-state-id',
                        name: '完成'
                    }
                ],
                users: [
                    {
                        _id: 'user3',
                        name: '小李'
                    }
                ]
            }
        };
        return of(data).pipe(
            tap((data) => {
                this.updateWithReferences(data.value, data.references);
            })
        );
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
        });

        it('should get correct data through subscribe select animals stream', () => {
            const animals = createSomeAnimals();
            const foo = { id: 1, name: 'Foo', description: 'This is a foo' };
            store = injectStoreForTest(ZoomStore, {
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
            store = injectStoreForTest(ZoomStore, {
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
        });

        it('should increase', () => {
            expect(store.getState()).toEqual(0);
            store.increase();
            expect(store.getState()).toEqual(1);
        });

        it('should decrease', () => {
            expect(store.getState()).toEqual(0);
            store.decrease();
            expect(store.getState()).toEqual(-1);
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
            store.select(ZoomStore.animalsSelector).subscribe(animalsSpy);
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
            expect(store.getStoreInstanceId()).toEqual('ZoomStore');
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

describe('#storeWithReferences', () => {
    let store: DetailStore;
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [DetailStore]
        });
        store = TestBed.inject(DetailStore);
        store.fetchDetail().subscribe();
    });
    it('should get state with refs when initializeWithReferences', () => {
        expect(store.getState().refs).toEqual({
            test_library_id: {
                name: '提升用户体验',
                _id: '5d68c672e514ac452594ba44'
            },
            suite_ids: [
                {
                    _id: '60ecf0c9fe7a7a8d8c2c8ecb',
                    name: '其他模块'
                },
                {
                    _id: '6368ccf675ec249953b63020',
                    name: '模块01'
                }
            ],
            state_id: {
                _id: 'no-start-state-id',
                name: '未开始'
            },
            maintenance_uid: {
                _id: 'user2',
                name: 'peter'
            }
        });
    });

    it('should get state with newRefs when updateWithReferences', () => {
        store.changeStateAndMaintenance().subscribe();
        expect(store.getState().refs).toEqual({
            test_library_id: {
                name: '提升用户体验',
                _id: '5d68c672e514ac452594ba44'
            },
            suite_ids: [
                {
                    _id: '60ecf0c9fe7a7a8d8c2c8ecb',
                    name: '其他模块'
                },
                {
                    _id: '6368ccf675ec249953b63020',
                    name: '模块01'
                }
            ],
            state_id: {
                _id: 'success-state-id',
                name: '完成'
            },
            maintenance_uid: {
                _id: 'user3',
                name: '小李'
            }
        });
    });
});
