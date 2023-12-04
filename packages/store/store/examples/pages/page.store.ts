import { Injectable, inject } from '@angular/core';
import { Action, dispatch, Store } from '@tethys/store';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { groupActions, updateContent, updateTitle } from './actions';

interface PageDetailState {
    detail: { _id: string; title: string; content: string };
}

@Injectable()
export class PageDetailStore extends Store<PageDetailState> {
    static detailSelector(state: PageDetailState) {
        return state.detail;
    }

    constructor() {
        super({});
    }

    @Action(groupActions.updateTitle)
    pureUpdateTitle(_id: string, payload: { title: string }) {
        if (_id === this.snapshot.detail._id) {
            this.update({
                detail: {
                    ...this.snapshot.detail,
                    ...payload
                }
            });
        }
    }

    @Action(updateContent)
    pureUpdateContent(_id: string, payload: { content: string }) {
        if (_id === this.snapshot.detail._id) {
            this.update({
                detail: {
                    ...this.snapshot.detail,
                    ...payload
                }
            });
        }
    }

    @Action()
    fetchPageDetail() {
        const data = {
            pageDetail: { _id: '1', title: 'First Page Title', content: 'First Page Detail Content' }
        };
        return of(data).pipe(
            tap((data) => {
                this.update({
                    detail: {
                        ...this.snapshot.detail,
                        ...data.pageDetail
                    }
                });
            })
        );
    }

    @Action()
    updateTitle() {
        return of(true).pipe(
            tap(() => {
                dispatch(groupActions.updateTitle('1', { title: 'New First Page Title' }));
            })
        );
    }

    @Action()
    updateContent() {
        return of(true).pipe(
            tap(() => {
                dispatch(updateContent('1', { content: 'New First Page Content' }));
            })
        );
    }

    @Action()
    resetTitle() {
        return of(true).pipe(
            tap(() => {
                dispatch(updateTitle('1', { title: 'First Page Title' }));
            })
        );
    }
}
