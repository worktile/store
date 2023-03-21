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
        this.detailStore.updateWithReferences(
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

    addUsers(): void {
        this.detailStore.updateWithReferences(
            {
                properties: {
                    canyuren: ['user1', 'user2', 'user3', 'user4']
                }
            },
            {
                users: [
                    {
                        _id: 'user3',
                        name: '小李'
                    },
                    {
                        _id: 'user4',
                        name: '小焕'
                    }
                ]
            }
        );
    }

    reset(): void {
        this.detailStore.updateWithReferences({
            state_id: 'no-start-state-id',
            properties: {
                canyuren: ['user1', 'user2']
            }
        });
    }
}
