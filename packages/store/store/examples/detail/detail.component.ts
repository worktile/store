import { Component, OnInit } from '@angular/core';
import { DetailStore } from './detail.store';

@Component({
    selector: 'thy-store-detail-example',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss']
})
export class ThyStoreDetailExampleComponent implements OnInit {
    constructor(public detailStore: DetailStore) {}

    ngOnInit(): void {
        this.detailStore.fetchDetail();
    }

    changeState(): void {
        this.detailStore.updateState();
    }

    changeLibrary(): void {
        this.detailStore.updateLibrary();
    }

    reset(): void {
        this.detailStore.resetDetail();
    }

    clear(): void {
        this.detailStore.clear();
    }
}
