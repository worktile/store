import { Component, OnInit } from '@angular/core';
import { PageDetailStore } from './page-detail.store';
import { Catalog, CatalogsStore } from './catalogs.store';
import { Observable } from 'rxjs';

@Component({
    selector: 'thy-store-pages-example',
    templateUrl: './pages.component.html',
    styleUrls: ['./pages.component.scss'],
    providers: [PageDetailStore, CatalogsStore]
})
export class ThyStorePagesExampleComponent implements OnInit {
    constructor(public catalogsStore: CatalogsStore, public pageDetailStore: PageDetailStore) {}

    pageDetail$: Observable<any> = this.pageDetailStore.select$(PageDetailStore.detailSelector);

    selectedCatalog: Catalog;

    ngOnInit() {
        this.catalogsStore.fetchCatalogs();
        this.select$({ _id: '1' });
    }

    updateTitle(id: string) {
        this.pageDetailStore.updateTitle(id);
    }

    resetTitle(id: string) {
        this.pageDetailStore.resetTitle(id);
    }

    select(catalog: Catalog) {
        this.selectedCatalog = catalog;
        this.pageDetailStore.fetchPageDetail(catalog._id);
    }
}
