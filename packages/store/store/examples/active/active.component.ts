import { Component, inject, OnInit } from '@angular/core';
import { ActiveItem, ActiveItemsStore } from './active.store';

@Component({
    selector: 'thy-store-active-example',
    templateUrl: './active.component.html',
    styleUrls: ['./active.component.scss'],
    standalone: false
})
export class ThyStoreActiveItemsExampleComponent implements OnInit {
    public activeItemsStore = inject(ActiveItemsStore);

    items$ = this.activeItemsStore.select$(ActiveItemsStore.itemsSelector);

    activeId$ = this.activeItemsStore.select$(ActiveItemsStore.activeIdSelector);

    activeEntity$ = this.activeItemsStore.activeEntity$;

    ngOnInit(): void {
        this.activeItemsStore.fetchItems();
    }

    setActiveItem(id: number) {
        this.activeItemsStore.setActive(id);
    }

    clearActiveItem() {
        this.activeItemsStore.setActive();
    }

    edit(item: ActiveItem) {
        item.editing = true;
    }

    update(item: ActiveItem, newTitle: string) {
        this.activeItemsStore.updateItem(item, newTitle);
    }

    stopEditing(item: ActiveItem, editedTitle: string) {
        item.title = editedTitle;
        item.editing = false;
    }

    cancelEditing(item: ActiveItem) {
        item.editing = false;
    }
}
