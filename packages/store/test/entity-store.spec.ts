import { Inject, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { produce } from '@tethys/cdk/immutable';
import { EntityState, EntityStore, EntityStoreOptions } from '../entity-store';
import { injectStoreForTest, StoreInitialStateToken, StoreOptionsToken } from './inject-store';

describe('Store: EntityStore', () => {
    interface TaskInfo {
        _id: string;
        name: string;
    }

    interface TasksState extends EntityState<TaskInfo> {}

    interface TaskDetailState extends EntityState<TaskInfo> {}

    @Injectable()
    class TasksEntityStore extends EntityStore<TasksState, TaskInfo> {
        constructor(
            @Inject(StoreInitialStateToken) initialState?: TasksState,
            @Inject(StoreOptionsToken) options?: EntityStoreOptions<TaskInfo>
        ) {
            super(initialState, options);
        }
    }

    @Injectable()
    class TaskDetailStore extends EntityStore<TaskDetailState, TaskInfo> {
        constructor(
            @Inject(StoreInitialStateToken) initialState?: TaskDetailState,
            @Inject(StoreOptionsToken) options?: EntityStoreOptions<TaskInfo>
        ) {
            super(initialState, options);
        }
    }

    const initialTasks = [
        { _id: '1', name: 'task 1' },
        { _id: '2', name: 'task 2' }
    ];

    const initialTaskDetail: TaskInfo = { _id: '1', name: 'task 1' };

    interface UserInfo {
        uid?: string;
        name?: string;
    }

    interface UsersState extends EntityState<UserInfo> {}

    @Injectable()
    class UsersEntityStore extends EntityStore<UsersState, UserInfo> {
        constructor(@Inject(StoreInitialStateToken) initialState?: UsersState) {
            super(initialState, {
                idKey: 'uid'
            });
        }
    }

    const initialUsers = [
        { uid: 'user-1', name: 'user name-1' },
        { uid: 'user-2', name: 'user name-2' }
    ];

    describe('EntityStore: EntityStore with entities', () => {
        it('should get store default value', () => {
            const taskEntityStore = injectStoreForTest(TasksEntityStore);
            const state = taskEntityStore.snapshot;
            expect(state.pagination).toEqual(undefined);
            expect(state.entities).toEqual([]);

            expect(taskEntityStore.trackBy(0, { _id: '111', name: 'name1' })).toEqual('111');
        });

        it('should get initialize data when call store initialize', () => {
            const taskEntityStore = injectStoreForTest(TasksEntityStore);
            taskEntityStore.initialize([...initialTasks], {
                pageIndex: 2,
                pageSize: 20,
                pageCount: 20
            });
            const state = taskEntityStore.snapshot;
            expect(state.entities).toEqual([
                { _id: '1', name: 'task 1' },
                { _id: '2', name: 'task 2' }
            ]);
            expect(state.pagination).toEqual({
                pageIndex: 2,
                pageSize: 20,
                pageCount: 20
            });
        });

        describe('add', () => {
            let tasksEntityStore: TasksEntityStore;

            beforeEach(() => {
                tasksEntityStore = injectStoreForTest(TasksEntityStore, {
                    entities: [...initialTasks],
                    pagination: {
                        pageIndex: 1,
                        pageSize: 10,
                        count: initialTasks.length
                    }
                });
            });

            it('should task success for append', () => {
                const addEntity = {
                    _id: '3',
                    name: 'task 3'
                };
                tasksEntityStore.add(addEntity);
                const state = tasksEntityStore.snapshot;
                expect(state.entities).toEqual([...initialTasks, addEntity]);
            });

            it('should add task success for prepend=true', () => {
                const addEntity = {
                    _id: '3',
                    name: 'task 3'
                };
                tasksEntityStore.add(addEntity, {
                    prepend: true
                });
                const state = tasksEntityStore.snapshot;
                expect(state.entities).toEqual([addEntity, ...initialTasks]);
            });

            it('should add task 3 success to afterId', () => {
                const addEntity = {
                    _id: '3',
                    name: 'task 3'
                };
                tasksEntityStore.add(addEntity, {
                    afterId: '1'
                });
                const state = tasksEntityStore.snapshot;
                expect(state.entities).toEqual([
                    { _id: '1', name: 'task 1' },
                    {
                        _id: '3',
                        name: 'task 3'
                    },
                    { _id: '2', name: 'task 2' }
                ]);
            });

            it('should add task success for addByPagination=true', () => {
                const addEntities = [
                    {
                        _id: '3',
                        name: 'task 3'
                    },
                    {
                        _id: '4',
                        name: 'task 4'
                    },
                    {
                        _id: '5',
                        name: 'task 5'
                    },
                    {
                        _id: '6',
                        name: 'task 6'
                    },
                    {
                        _id: '7',
                        name: 'task 7'
                    },
                    {
                        _id: '8',
                        name: 'task 8'
                    },
                    {
                        _id: '9',
                        name: 'task 9'
                    },
                    {
                        _id: '10',
                        name: 'task 10'
                    },
                    {
                        _id: '11',
                        name: 'task 11'
                    }
                ];
                tasksEntityStore.add(addEntities, {
                    addByPagination: true
                });
                const state = tasksEntityStore.snapshot;
                const finalAddEntities = addEntities.slice(0, 8);
                expect(state.entities).toEqual([...initialTasks, ...finalAddEntities]);
            });
            it('should not add task when initialTasks length equal page size and addByPagination=true', () => {
                tasksEntityStore.initialize([...initialTasks], {
                    pageIndex: 1,
                    pageSize: 2,
                    count: initialTasks.length
                });
                const addEntities = [
                    {
                        _id: '3',
                        name: 'task 3'
                    }
                ];
                tasksEntityStore.add(addEntities, {
                    addByPagination: true
                });
                const state = tasksEntityStore.snapshot;

                expect(state.entities).toEqual([...initialTasks]);
            });
        });

        describe('remove', () => {
            let tasksEntityStore: TasksEntityStore;

            beforeEach(() => {
                tasksEntityStore = injectStoreForTest(TasksEntityStore, {
                    entities: [...initialTasks],
                    pagination: {
                        pageCount: 1,
                        pageIndex: 1,
                        pageSize: 10,
                        count: 2
                    }
                });
            });

            it(`remove by id`, () => {
                const state = tasksEntityStore.snapshot;
                const originalEntities = state.entities;
                expect(state.pagination).toEqual({
                    pageCount: 1,
                    pageIndex: 1,
                    pageSize: 10,
                    count: 2
                });
                tasksEntityStore.remove('1');
                expect(state.pagination).toEqual({
                    pageCount: 1,
                    pageIndex: 1,
                    pageSize: 10,
                    count: 1
                });
                expect(state.entities).toEqual(
                    initialTasks.filter((item) => {
                        return item._id !== '1';
                    })
                );
                expect(originalEntities === state.entities).toEqual(false, 'new state is immutable');
            });

            it(`remove by ids`, () => {
                tasksEntityStore.remove(['1', '2']);
                const state = tasksEntityStore.snapshot;
                expect(state.entities).toEqual([]);
            });

            it(`remove by predicate`, () => {
                tasksEntityStore.remove((entity) => {
                    return entity._id === '1';
                });
                const state = tasksEntityStore.snapshot;
                expect(state.entities).toEqual([
                    {
                        _id: '2',
                        name: 'task 2'
                    }
                ]);
            });

            it(`remove triggered pagination changed`, () => {
                const userEntities = [];
                for (let index = 0; index < 11; index++) {
                    userEntities.push({
                        _id: `${index + 1}`,
                        name: `${index + 1} name`
                    });
                }
                tasksEntityStore = injectStoreForTest(TasksEntityStore, {
                    entities: userEntities,
                    pagination: {
                        pageCount: 2,
                        pageIndex: 1,
                        pageSize: 10,
                        count: 11
                    }
                });
                const state = tasksEntityStore.snapshot;
                const originalPagination = state.pagination;
                expect(state.pagination).toEqual({
                    pageCount: 2,
                    pageIndex: 1,
                    pageSize: 10,
                    count: 11
                });
                tasksEntityStore.remove('1');
                expect(state.pagination).toEqual({
                    pageCount: 1,
                    pageIndex: 1,
                    pageSize: 10,
                    count: 10
                });
                expect(originalPagination === state.pagination).toEqual(false, 'new pagination is immutable');
            });

            it(`remove user by custom idKey uid`, () => {
                const userStore = injectStoreForTest(UsersEntityStore, {
                    entities: initialUsers
                });
                const state = userStore.snapshot;
                expect(state.entities).toEqual([...initialUsers]);
                userStore.remove('user-1');
                expect(state.entities).toEqual([{ uid: 'user-2', name: 'user name-2' }]);
            });
        });

        describe('update', () => {
            let tasksEntityStore: TasksEntityStore;

            beforeEach(() => {
                tasksEntityStore = injectStoreForTest(TasksEntityStore, {
                    entities: [...initialTasks],
                    pagination: null
                });
            });

            it(`update by id`, () => {
                const originalEntities = tasksEntityStore.snapshot.entities;
                tasksEntityStore.update('1', {
                    name: 'new 1 user'
                });
                const state = tasksEntityStore.snapshot;
                const entity = state.entities.find((item) => {
                    return item._id === '1';
                });
                expect(entity).toEqual({
                    _id: '1',
                    name: 'new 1 user'
                });
                expect(originalEntities === state.entities).toEqual(false, 'new state is immutable');
            });

            it(`update by ids`, () => {
                tasksEntityStore.update(['1', '2'], {
                    name: 'new 1 user'
                });
                const state = tasksEntityStore.snapshot;

                expect(state.entities).toEqual([
                    {
                        _id: '1',
                        name: 'new 1 user'
                    },
                    {
                        _id: '2',
                        name: 'new 1 user'
                    }
                ]);
            });

            it(`update by id and newStateFn`, () => {
                tasksEntityStore.update('1', (task) => {
                    return {
                        ...task,
                        name: 'new task name'
                    };
                });
                const state = tasksEntityStore.snapshot;
                const entity = state.entities.find((item) => {
                    return item._id === '1';
                });
                expect(entity).toEqual({
                    _id: '1',
                    name: 'new task name'
                });
            });

            it(`update user by custom idKey uid`, () => {
                const userStore = injectStoreForTest(UsersEntityStore, {
                    entities: initialUsers
                });
                const state = userStore.snapshot;
                expect(state.entities).toEqual([...initialUsers]);
                userStore.update('user-1', {
                    name: 'new user1 name'
                });
                expect(state.entities).toEqual([
                    { uid: 'user-1', name: 'new user1 name' },
                    { uid: 'user-2', name: 'user name-2' }
                ]);
            });

            it('should update whole state by partial state', () => {
                tasksEntityStore.update({
                    entities: produce(tasksEntityStore.getState().entities).update('1', { name: 'new task name' })
                });
                const entity = tasksEntityStore.getState().entities.find((item) => {
                    return item._id === '1';
                });
                expect(entity).toEqual({
                    _id: '1',
                    name: 'new task name'
                });
            });

            it('should update whole state by predicate function', () => {
                tasksEntityStore.update((state) => {
                    return {
                        entities: produce(state.entities).update('1', { name: 'new task name' })
                    };
                });
                const entity = tasksEntityStore.getState().entities.find((item) => {
                    return item._id === '1';
                });
                expect(entity).toEqual({
                    _id: '1',
                    name: 'new task name'
                });
            });
        });

        describe('clear', () => {
            it('should clear entities and pagination', () => {
                const tasksEntityStore = injectStoreForTest(TasksEntityStore, {
                    entities: [...initialTasks],
                    pagination: { pageIndex: 1, count: 100, pageSize: 20 }
                });
                expect(tasksEntityStore.snapshot.entities).toEqual(initialTasks);
                expect(tasksEntityStore.snapshot.pagination).toEqual({
                    pageIndex: 1,
                    count: 100,
                    pageSize: 20
                });
                tasksEntityStore.clear();
                expect(tasksEntityStore.snapshot.entities).toEqual([]);
                expect(tasksEntityStore.snapshot.pagination).toEqual(null);
            });

            it('should clear pagination', () => {
                const tasksEntityStore = injectStoreForTest(TasksEntityStore, {
                    entities: [...initialTasks],
                    pagination: { pageIndex: 1, count: 100, pageSize: 20 }
                });
                expect(tasksEntityStore.snapshot.entities).toEqual(initialTasks);
                expect(tasksEntityStore.snapshot.pagination).toEqual({
                    pageIndex: 1,
                    count: 100,
                    pageSize: 20
                });
                tasksEntityStore.clearPagination();
                expect(tasksEntityStore.snapshot.entities).toEqual(initialTasks);
                expect(tasksEntityStore.snapshot.pagination).toEqual(null);
            });
        });

        describe('constructor', () => {
            it('should merge default options', () => {
                const store = injectStoreForTest(
                    TasksEntityStore,
                    {
                        entities: [...initialTasks]
                    },
                    {}
                );
                expect(store['options']).toEqual({
                    idKey: '_id'
                });
            });

            it('should throw error when idKey is empty', () => {
                const assertIdKeyError = function (idKeyValue: string) {
                    expect(() => {
                        return injectStoreForTest(
                            TasksEntityStore,
                            {
                                entities: [...initialTasks]
                            },
                            {
                                idKey: idKeyValue as any
                            }
                        );
                    }).toThrowError('idKey is required in EntityStore');
                };
                assertIdKeyError(undefined);
                assertIdKeyError(null);
                assertIdKeyError('');
            });
        });

        describe('active', () => {
            it('should set active and get id', () => {
                const tasksEntityStore = injectStoreForTest(TasksEntityStore, {
                    entities: [...initialTasks]
                });
                expect(tasksEntityStore.activeId).toEqual(null);
                tasksEntityStore.setActive('1');
                expect(tasksEntityStore.activeId).toEqual('1');
                tasksEntityStore.activeId$.subscribe((id) => {
                    expect(id).toEqual('1');
                });
            });

            it('should get entity', async () => {
                const tasksEntityStore = injectStoreForTest(TasksEntityStore, {
                    entities: [...initialTasks]
                });

                tasksEntityStore.setActive('1');
                expect(tasksEntityStore.activeEntity).toEqual({ _id: '1', name: 'task 1' });
                tasksEntityStore.activeEntity$.subscribe((id) => {
                    expect(id).toEqual({ _id: '1', name: 'task 1' });
                });
            });

            it('should clear active id and entity', () => {
                const tasksEntityStore = injectStoreForTest(TasksEntityStore, {
                    entities: [...initialTasks]
                });
                tasksEntityStore.setActive('1');
                tasksEntityStore.setActive(null);
                expect(tasksEntityStore.activeId).toEqual(null);
                tasksEntityStore.activeId$.subscribe((id) => {
                    expect(id).toEqual(null);
                });
                expect(tasksEntityStore.activeEntity).toEqual(null);
                tasksEntityStore.activeEntity$.subscribe((entity) => {
                    expect(entity).toEqual(null);
                });
            });
        });
    });

    describe('EntityStore: EntityStore with entity', () => {
        it('should get initialize data when call store initialize', () => {
            const taskDetailStore = injectStoreForTest(TaskDetailStore);
            taskDetailStore.initialize(initialTaskDetail);
            const state = taskDetailStore.snapshot;
            expect(state.entity).toEqual({ _id: '1', name: 'task 1' });
        });

        it('should update by id', () => {
            const taskDetailStore = injectStoreForTest(TaskDetailStore);
            taskDetailStore.initialize(initialTaskDetail);
            taskDetailStore.update(taskDetailStore.entity._id, { name: 'task 1 new' });
            expect(taskDetailStore.entity).toEqual({ _id: '1', name: 'task 1 new' });
        });

        it('should update whole entity by predicate state', () => {
            const taskDetailStore = injectStoreForTest(TaskDetailStore);
            taskDetailStore.initialize(initialTaskDetail);
            taskDetailStore.update({ entity: { _id: '1', name: 'task 1 new' } });
            expect(taskDetailStore.entity).toEqual({ _id: '1', name: 'task 1 new' });
        });

        it('should update whole entity by predicate function', () => {
            const taskDetailStore = injectStoreForTest(TaskDetailStore);
            taskDetailStore.initialize(initialTaskDetail);
            taskDetailStore.update((state) => {
                return {
                    entity: { ...state.entity, name: 'task 1 new' }
                };
            });
            expect(taskDetailStore.entity).toEqual({ _id: '1', name: 'task 1 new' });
        });

        it(`should throw an error when add or remove`, () => {
            const taskDetailStore = injectStoreForTest(TaskDetailStore);
            taskDetailStore.initialize(initialTaskDetail);
            expect(() => {
                taskDetailStore.add({ _id: '3', name: 'task-3-new' });
                throw new Error('Error');
            }).toThrow();

            expect(() => {
                taskDetailStore.remove('1');
                throw new Error('Error');
            }).toThrow();
        });

        it('should set active and get id', () => {
            const taskDetailStore = injectStoreForTest(TaskDetailStore);
            taskDetailStore.initialize(initialTaskDetail);
            expect(taskDetailStore.activeId).toEqual(null);
            taskDetailStore.setActive('1');
            expect(taskDetailStore.activeId).toEqual('1');
            taskDetailStore.activeId$.subscribe((id) => {
                expect(id).toEqual('1');
            });
        });
    });
});
