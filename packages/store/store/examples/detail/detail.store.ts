import { Injectable } from '@angular/core';
import { EntityState, EntityStore, Action, ReferencesIdDictionary, OnCombineRefs } from '@tethys/store';
import { SafeAny } from '@tethys/store/inner-types';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
    _id: string;
    name: string;
}

export interface DetailReferences {
    users?: User[];
    states?: { _id: string; [key: string]: SafeAny }[];
    suites?: { _id: string; [key: string]: SafeAny }[];
    library?: any;
}

export interface DetailInfo {
    _id: string;
    title?: string;
    maintenance_uid?: string;
    test_library_id?: string;
    suite_ids?: string[];
    state_id?: string;
    [key: string]: any;
}

const responseData = {
    value: {
        _id: '63c8b74c21cccf986012a131',
        title: '如何实现骨架屏',
        maintenance_uid: 'user2',
        test_library_id: 'test-library-id',
        suite_ids: ['suite-1', 'suite-2'],
        state_id: 'no-start-state-id'
    },
    references: {
        library: [
            {
                name: '提升用户体验',
                _id: 'test-library-id'
            }
        ],
        suites: [
            {
                _id: 'suite-1',
                name: '其他模块'
            },
            {
                _id: 'suite-2',
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
        ]
    }
};

export interface DetailState extends EntityState<DetailInfo, DetailReferences> {}

@Injectable({ providedIn: 'root' })
export class DetailStore
    extends EntityStore<DetailState, DetailInfo, DetailReferences>
    implements OnCombineRefs<DetailInfo, DetailReferences>
{
    constructor() {
        super({});
    }

    onCombineRefs(entity: DetailInfo, referencesIdMap: ReferencesIdDictionary<DetailReferences>, references: DetailReferences): void {
        entity.refs.state = (referencesIdMap.states || {})[entity.state_id];
        entity.refs.test_library = (referencesIdMap.library || {})[entity.test_library_id];
        entity.refs.maintenance = (referencesIdMap.users || {})[entity.maintenance_uid];
        entity.refs.suites = entity?.suite_ids?.map((item) => (referencesIdMap.suites || {})[item]);
    }

    @Action()
    fetchDetail() {
        return of(responseData).pipe(
            tap((data) => {
                this.initializeWithReferences(data.value, data.references);
            })
        );
    }

    @Action()
    updateLibrary() {
        this.updateWithReferences(
            this.entity._id,
            {
                test_library_id: 'update-test-library-id'
            },
            {
                library: [
                    {
                        name: 'update提升用户体验',
                        _id: 'update-test-library-id'
                    }
                ]
            }
        );
    }

    @Action()
    updateState() {
        this.updateWithReferences(
            this.entity._id,
            { state_id: 'success-state-id' },
            {
                states: [
                    {
                        _id: 'success-state-id',
                        name: '完成'
                    }
                ]
            }
        );
    }

    @Action()
    resetDetail() {
        this.updateWithReferences(
            this.entity._id,
            (entity: DetailInfo) => {
                return { ...entity, ...responseData.value };
            },
            {
                ...responseData.references
            }
        );
    }

    @Action()
    updateTitle() {
        this.update(this.entity._id, { title: '新的title' });
    }

    @Action()
    addEntity() {
        this.add({ _id: '123', title: '新的title' });
    }
}
