import { Component, OnInit } from '@angular/core';
import { PageDetailStore } from './page.store';
import { PagesStore } from './page-list.store';
import { Observable } from 'rxjs';

@Component({
    selector: 'thy-store-pages-example',
    templateUrl: './pages.component.html',
    styleUrls: ['./pages.component.scss'],
    providers: [PageDetailStore, PagesStore]
})
export class ThyStorePagesExampleComponent implements OnInit {
    constructor(public pagesStore: PagesStore, public pageDetailStore: PageDetailStore) {}

    pageDetail$: Observable<any> = this.pageDetailStore.select(PageDetailStore.detailSelector);

    ngOnInit() {
        this.fetchPages();
        this.fetchPageDetail();
    }

    fetchPages() {
        this.pagesStore.fetchPages();
    }

    fetchPageDetail() {
        this.pageDetailStore.fetchPageDetail();
    }

    updateTitle() {
        this.pageDetailStore.updateTitle();
    }

    updateContent() {
        this.pageDetailStore.updateContent();
    }
}
