import { Injectable } from '@angular/core';
import { EntityState, EntityStore, Action, ReferencesIdDictionary, OnCombineRefs } from '@tethys/store';
import { SafeAny } from '@tethys/store/inner-types';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface DetailReferences {
    states?: { _id: string; [key: string]: SafeAny }[];
}

export interface DetailInfo {
    _id: string;
    title?: string;
    state_id?: string;
    [key: string]: any;
}

const responseData = {
    value: {
        _id: '63c8b74c21cccf986012a131',
        title: 'Single entity with reference',
        state_id: 'no-start-state-id'
    },
    references: {
        states: [
            {
                _id: 'no-start-state-id',
                name: '未开始'
            }
        ]
    }
};

export interface DetailState extends EntityState<DetailInfo, DetailReferences> {}

@Injectable({ providedIn: 'root' })
export class DetailStore
    extends EntityStore<DetailState, DetailInfo, DetailReferences>
    implements OnCombineRefs<DetailInfo, DetailReferences>
{
    static titleSelector(state: DetailState) {
        return state.entity?.title;
    }

    constructor() {
        super({});
    }

    onCombineRefs(entity: DetailInfo, referencesIdMap: ReferencesIdDictionary<DetailReferences>, references: DetailReferences): void {
        entity.refs.state = (referencesIdMap.states || {})[entity.state_id];
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
    updateTitle() {
        this.update(this.entity._id, { title: '新的title' });
    }
}
