import { Component, OnInit, Signal, effect, inject } from '@angular/core';
import { DetailInfo, DetailStore } from './single-entity.store';

@Component({
    selector: 'thy-store-single-entity-example',
    templateUrl: './single-entity.component.html',
    styleUrls: ['./single-entity.component.scss'],
    standalone: false
})
export class ThyStoreSingleEntityExampleComponent implements OnInit {
    public detailStore = inject(DetailStore);

    titleState: Signal<string> = this.detailStore.select(DetailStore.titleSelector);

    stateIdState: Signal<string> = this.detailStore.select((state) => {
        return state.entity.state_id;
    });

    entityState: Signal<DetailInfo> = this.detailStore.select((state) => {
        return state.entity;
    });

    constructor() {
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
