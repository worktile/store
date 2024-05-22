import { Component, OnInit, Signal, effect } from '@angular/core';
import { DetailInfo, DetailStore } from './single-entity.store';

@Component({
    selector: 'thy-store-single-entity-example',
    templateUrl: './single-entity.component.html',
    styleUrls: ['./single-entity.component.scss']
})
export class ThyStoreSingleEntityExampleComponent implements OnInit {
    titleState: Signal<string> = this.detailStore.select(DetailStore.titleSelector);

    stateIdState: Signal<string> = this.detailStore.select((state) => {
        return state.entity.state_id;
    });

    entityState: Signal<DetailInfo> = this.detailStore.select((state) => {
        return state.entity;
    });

    constructor(public detailStore: DetailStore) {
        effect(() => {
            console.log(`Entity name is: ${this.titleState()}`);
        });

        effect(() => {
            console.log(`Entity state_id is: ${this.stateIdState()}`);
        });

        effect(() => {
            console.log(`Entity entity is: ${this.entityState()}`);
        });
    }

    ngOnInit(): void {
        this.detailStore.fetchDetail();
    }

    changeState(): void {
        this.detailStore.updateState();
    }

    changeTitle(): void {
        this.detailStore.updateTitle();
    }

    clear(): void {
        this.detailStore.clear();
    }
}
