import { Component, OnInit } from '@angular/core';
import { AnotherItemsStore } from './another.store';
import { Item, ItemsStore } from './items.store';
import { StoreDispatcher } from './store.dispatcher';

@Component({
    selector: 'thy-store-get-stores-example',
    templateUrl: './get-stores.component.html',
    styleUrls: ['./get-stores.component.scss']
})
export class ThyStoreGetStoresExampleComponent implements OnInit {
    items$ = this.itemsStore.select(ItemsStore.itemsSelector);

    anotherItems$ = this.anotherItemsStore.select(AnotherItemsStore.itemsSelector);

    newItemText: string;

    constructor(public itemsStore: ItemsStore, public anotherItemsStore: AnotherItemsStore, private storeDispatcher: StoreDispatcher) {}

    ngOnInit(): void {
        this.itemsStore.fetchItems().subscribe();
        this.anotherItemsStore.fetchItems().subscribe();
    }

    addItem() {
        this.storeDispatcher.addItem(this.newItemText).subscribe(() => {
            this.newItemText = '';
        });
    }

    editItem(item: Item) {
        item.editing = true;
    }

    remove(item: Item) {
        this.storeDispatcher.removeItem(item).subscribe();
    }

    update(item: Item, newTitle: string) {
        this.storeDispatcher.updateItem(item, newTitle).subscribe(() => {
            this.newItemText = '';
        });
    }

    stopEditing(item: Item, editedTitle: string) {
        item.title = editedTitle;
        item.editing = false;
    }

    cancelEditing(item: Item) {
        item.editing = false;
    }
}
