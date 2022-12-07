import { Component, OnInit } from '@angular/core';
import { ActiveItemsStore } from './active.store';

@Component({
    selector: 'thy-store-active-example',
    templateUrl: './active.component.html',
    styleUrls: ['./active.component.scss']
})
export class ThyStoreActiveItemsExampleComponent implements OnInit {
    items$ = this.activeItemsStore.select(ActiveItemsStore.itemsSelector);

    activeId$ = this.activeItemsStore.select(ActiveItemsStore.activeIdSelector);

    activeEntity$ = this.activeItemsStore.activeEntity$;

    constructor(public activeItemsStore: ActiveItemsStore) {}

    ngOnInit(): void {
        this.activeItemsStore.fetchItems();
    }

    setActiveItem(id: number) {
        this.activeItemsStore.setActive(id);
    }

    clearActiveItem() {
        this.activeItemsStore.setActive();
    }
}
