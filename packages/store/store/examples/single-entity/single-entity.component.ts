import { Component, OnInit } from '@angular/core';
import { DetailStore } from './single-entity.store';

@Component({
    selector: 'thy-store-single-entity-example',
    templateUrl: './single-entity.component.html',
    styleUrls: ['./single-entity.component.scss']
})
export class ThyStoreSingleEntityExampleComponent implements OnInit {
    constructor(public detailStore: DetailStore) {}

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
