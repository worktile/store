import { Id, produce, ProducerOptions } from '@tethys/cdk/immutable';
import { isFunction } from '@tethys/cdk/is';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Action } from './action';
import {
    buildReferencesKeyBy,
    mergeReferences,
    MergeReferencesStrategy,
    ReferenceArrayExtractAllowKeys,
    ReferencesIdDictionary
} from './references';
import { Store } from './store';
import { PaginationInfo, StoreOptions, UpdateStatePredicate } from './types';
import { coerceArray } from './utils';

export interface EntityStoreOptions<TEntity = unknown, TReferences = unknown> extends ProducerOptions<TEntity>, StoreOptions {
    referencesIdKeys?: ReferenceArrayExtractAllowKeys<TReferences>;
    mergeReferencesStrategy?: MergeReferencesStrategy;
}

export interface EntityAddOptions {
    prepend?: boolean;
    afterId?: Id;
    // 如果是最后追加，自动跳转到最后一页
    autoGotoLastPage?: boolean;
    // 根据分页数量追加
    addByPagination?: boolean;
}

export interface ActiveState {
    activeId?: Id;
}

export interface EntityState<TEntity, TReferences = unknown> extends ActiveState {
    pagination?: PaginationInfo;
    entities: TEntity[];
    references?: TReferences;
}

export class EntityStore<TState extends EntityState<TEntity, TReferences>, TEntity, TReferences = unknown> extends Store<TState> {
    protected options: EntityStoreOptions<TEntity, TReferences>;

    protected internalReferencesIdMap: ReferencesIdDictionary<TReferences>;

    get referencesMap() {
        return this.internalReferencesIdMap;
    }

    get entities() {
        return this.snapshot.entities;
    }

    entities$ = this.select((state) => {
        return state.entities;
    });

    get activeId(): Id | null {
        return this.snapshot.activeId || null;
    }

    activeId$: Observable<Id | null> = this.select((state) => {
        return state.activeId || null;
    });

    get activeEntity(): TEntity | null {
        return this.snapshot.activeId ? this.getEntityById(this.snapshot.activeId) : null;
    }

    activeEntity$: Observable<TEntity | null> = this.select((state) => {
        return state.activeId;
    }).pipe(
        map((id) => {
            return id ? this.getEntityById(id) : null;
        }),
        shareReplay()
    );

    entitiesWithRefs$ = this.entities$.pipe(
        map((entities) => {
            if (!entities) {
                return entities;
            }
            return entities.map((entity) => {
                const newEntity = { ...entity };

                if (this['onCombineRefs']) {
                    if (!newEntity['refs']) {
                        newEntity['refs'] = {};
                    }
                    this['onCombineRefs'](newEntity, this.internalReferencesIdMap, this.snapshot.references);
                } else {
                    throw new Error(`onCombineRefs is not empty`);
                }
                return newEntity;
            });
        })
    );

    private resetPagination(pagination: PaginationInfo, count: number) {
        pagination.count = count;
        // 向上取整 21 / 20 = 1.05 = 2 pageCount is 2
        const pageCount = Math.ceil(pagination.count / pagination.pageSize);
        pagination.pageCount = pageCount;
        this.snapshot.pagination = { ...pagination };
    }

    private increasePagination(amount: number) {
        const pagination = this.snapshot.pagination;
        this.resetPagination(pagination, pagination.count + amount);
    }

    private decreasePagination(amount: number) {
        const pagination = this.snapshot.pagination;
        if (pagination) {
            this.resetPagination(pagination, pagination.count - amount);
        }
    }

    private buildReferencesIdMap() {
        if (this.snapshot.references) {
            this.internalReferencesIdMap = buildReferencesKeyBy(this.snapshot.references, this.options.referencesIdKeys);
        }
    }

    constructor(
        initialState: TState = {
            entities: [] as TEntity[]
        } as TState,
        options: EntityStoreOptions<TEntity, TReferences> = {
            idKey: '_id'
        } as EntityStoreOptions<TEntity, TReferences>
    ) {
        super(initialState, options);
        this.options = { idKey: '_id', ...options } as EntityStoreOptions<TEntity, TReferences>;
        if (!this.options.idKey) {
            throw new Error(`idKey is required in EntityStore`);
        }
        this.buildReferencesIdMap();
    }

    /**
     *
     * Replace current collection with provided collection
     *
     * @example
     * this.store.initialize([Entity, Entity], pagination: PaginationInfo);
     *
     */
    initialize(entities: TEntity[], pagination?: PaginationInfo) {
        this.snapshot.entities = entities || [];
        this.snapshot.pagination = pagination;
        this.next({ ...this.snapshot });
    }

    /**
     *
     * Replace current collection with provided collection with references
     *
     * @example
     * this.store.initializeWithReferences([Entity, Entity], references: TReferences, pagination: PaginationInfo);
     *
     */
    initializeWithReferences(entities: TEntity[], references: TReferences, pagination?: PaginationInfo) {
        this.snapshot.references = references;
        this.buildReferencesIdMap();
        this.snapshot.entities = entities || [];
        this.snapshot.pagination = pagination;
        this.next({ ...this.snapshot });
    }

    /**
     * Add entity or entities for internal
     * @param entity
     * @param references
     * @param addOptions
     */
    private addInternal(entity: TEntity | TEntity[], references?: Partial<TReferences>, addOptions?: EntityAddOptions) {
        const addEntities = coerceArray(entity);
        if (addEntities.length === 0) {
            return;
        }
        const state = this.snapshot;
        let finalAddEntities = addEntities;

        if (addOptions?.addByPagination && state.pagination) {
            finalAddEntities = addEntities.slice(0, state.pagination.pageSize - state.entities.length);
        }

        state.entities = produce(state.entities).add(finalAddEntities, addOptions);

        if (state.references) {
            mergeReferences(state.references, references, this.options.referencesIdKeys, {
                strategy: this.options.mergeReferencesStrategy
            });
            this.buildReferencesIdMap();
        }
        if (state.pagination) {
            this.increasePagination(addEntities.length);

            if (addOptions && !addOptions.prepend && addOptions.autoGotoLastPage) {
                state.pagination.pageIndex = state.pagination.pageCount;
            }
        }

        this.next({ ...state });
    }

    /**
     * Add an entity or entities to the store.
     *
     * @example
     * this.store.add(Entity);
     * this.store.add([Entity, Entity]);
     * this.store.add(Entity, { prepend: true });
     */
    add(entity: TEntity | TEntity[], addOptions?: EntityAddOptions) {
        this.addInternal(entity, undefined, addOptions);
    }

    /**
     * Add an entity or entities to the store with references.
     *
     * @example
     * this.store.addWithReferences(Entity, EntityReferences);
     * this.store.addWithReferences([Entity, Entity], EntityReferences);
     * this.store.addWithReferences(Entity, EntityReferences, { prepend: true });
     */
    addWithReferences(entity: TEntity | TEntity[], references: Partial<TReferences>, addOptions?: EntityAddOptions) {
        this.addInternal(entity, references, addOptions);
    }

    /**
     *
     * Update an entity or entities in the store.
     *
     * @example
     * this.store.update(3, {
     *   name: 'New Name'
     * }, references);
     *
     *  this.store.update(3, entity => {
     *    return {
     *      ...entity,
     *      name: 'New Name'
     *    }
     *  }, references);
     *
     * this.store.update([1,2,3], {
     *   name: 'New Name'
     * }, references);
     */
    private updateInternal(
        idsOrFn: Id | Id[] | null,
        // | Partial<TState>
        // | ((state: Readonly<TState>) => Partial<TState>)
        // | ((entity: Readonly<TEntity>) => boolean),
        newStateOrFn: ((entity: Readonly<TEntity>) => Partial<TEntity>) | Partial<TEntity>,
        references?: TReferences
    ): void {
        const ids = coerceArray(idsOrFn);

        const state = this.snapshot;
        for (let i = 0; i < state.entities.length; i++) {
            const oldEntity = state.entities[i];
            if (ids.includes(oldEntity[this.options.idKey] as any)) {
                const newState = isFunction(newStateOrFn) ? (newStateOrFn as any)(oldEntity) : newStateOrFn;
                state.entities[i] = { ...(oldEntity as any), ...newState };
            }
        }
        state.entities = [...state.entities];
        if (state.references) {
            mergeReferences(state.references, references, this.options.referencesIdKeys, {
                strategy: this.options.mergeReferencesStrategy
            });
            this.buildReferencesIdMap();
        }
        this.next(state);
    }

    /**
     *
     * Update an entity or entities in the store with references.
     *
     * @example
     * this.store.update(3, {
     *   name: 'New Name'
     * }, references);
     *
     *  this.store.update(3, entity => {
     *    return {
     *      ...entity,
     *      name: 'New Name'
     *    }
     *  }, references);
     *
     * this.store.update([1,2,3], {
     *   name: 'New Name'
     * }, references);
     */
    update(state: Partial<TState>): void;
    update(predicate: UpdateStatePredicate<TState>): void;
    update(ids: Id | Id[] | null, newStateOrFn: Partial<TEntity>): void;
    update(ids: Id | Id[] | null, newStateOrFn: UpdateStatePredicate<TEntity>): void;
    update(
        idsOrFnOrState: Id | Id[] | null | Partial<TState> | UpdateStatePredicate<TState>,
        newStateOrFn?: UpdateStatePredicate<TEntity> | Partial<TEntity>
    ): void {
        if (!newStateOrFn) {
            super.update(idsOrFnOrState as Partial<TState>);
            return;
        }
        this.updateInternal(idsOrFnOrState as Id | Id[] | null, newStateOrFn as Partial<TEntity>, undefined);
    }

    /**
     *
     * Update an entity or entities in the store with references.
     *
     * @example
     * this.store.updateWithReferences(3, {
     *   name: 'New Name'
     * }, references);
     *
     *  this.store.updateWithReferences(3, entity => {
     *    return {
     *      ...entity,
     *      name: 'New Name'
     *    }
     *  }, references);
     *
     * this.store.updateWithReferences([1,2,3], {
     *   name: 'New Name'
     * }, references);
     */
    updateWithReferences(
        idsOrFn: Id | Id[] | null,
        newStateOrFn: ((entity: Readonly<TEntity>) => Partial<TEntity>) | Partial<TEntity>,
        references: TReferences
    ): void {
        this.updateInternal(idsOrFn, newStateOrFn, references);
    }

    /**
     *
     * Remove one or more entities from the store:
     *
     * @example
     * this.store.remove(5);
     * this.store.remove([1,2,3]);
     * this.store.remove(entity => entity.id === 1);
     */
    remove(id: Id | Id[]): void;
    remove(predicate: (entity: Readonly<TEntity>) => boolean): void;
    remove(idsOrFn?: Id | Id[] | ((entity: Readonly<TEntity>) => boolean)): void {
        const state = this.snapshot;
        const originalLength = state.entities.length;
        state.entities = produce(state.entities, this.options).remove(idsOrFn as Id | Id[]);
        this.decreasePagination(originalLength - state.entities.length);
        this.next(state);
    }

    trackBy = (_index: number, entity: TEntity) => {
        return entity[this.options.idKey];
    };

    clearPagination() {
        const state = this.snapshot;
        state.pagination = null;
        this.next(state);
    }

    clear() {
        const state = this.snapshot;
        state.entities = [];
        state.pagination = null;
        state.references = null;
        this.next(state);
    }

    private getEntityById(id: Id): TEntity | null {
        const entity = this.snapshot.entities.find((entity) => {
            return (entity[this.options.idKey] as any) === id;
        });
        return entity ? entity : null;
    }

    @Action()
    setActive(id: Id | null = null): void {
        this.update({
            ...this.snapshot,
            activeId: id
        });
    }
}
