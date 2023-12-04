import { Injectable } from '@angular/core';
import { Action, dispatch, Store, defineAction, EntityState, EntityStore, defineActions, payload } from '@tethys/store';
import { TestBed } from '@angular/core/testing';
import { produce } from '@tethys/cdk';

const updateTitle = defineAction<string, { title: string }>('updateTitle');

const updateContent = defineAction<string, { content: string }>('updateContent');

const upvote = defineAction<string>('like page');

const likePage = defineAction<string>('like page');

const commentActions = defineActions('PAGE', {
    add: payload<string, { _id: string, content: string }>,
    delete: payload<string, string>
});

interface Page {
    _id: string;
    title: string;
    voteCount?: number;
    commentCount?: number;
}

interface PageDetailState {
    detail: { _id: string; title: string; content: string; like?: boolean; comments?: { _id: string; content: string }[] };
}

const pageDetail = { _id: '1', title: 'First Page Title', content: 'First Page Detail Content', comments: [] };

const pageList = [
    { _id: '1', title: 'First Page Title' },
    { _id: '2', title: 'Second Page Title' },
    { _id: '3', title: 'Third Page Title' },
    { _id: '4', title: 'Fourth Page Title' }
];

const detailTitleChangeSpy = jasmine.createSpy('detail title change');

const listTitleChangeSpy = jasmine.createSpy('list title change');

const detailContentChangeSpy = jasmine.createSpy('detail content change');

const likePageSpy = jasmine.createSpy('like page');

const upvoteSpy = jasmine.createSpy('upvote');

const detailAddCommentSpy = jasmine.createSpy('detail add comment');

const listAddCommentSpy = jasmine.createSpy('list add comment');

@Injectable({ providedIn: 'root' })
export class PageDetailStore extends Store<PageDetailState> {
    static detailSelector(state: PageDetailState) {
        return state.detail;
    }

    constructor() {
        super({ detail: pageDetail });
    }

    @Action(updateTitle)
    pureUpdateTitle(_id: string, payload: { title: string }) {
        detailTitleChangeSpy(_id, payload);
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
        detailContentChangeSpy(_id, payload);
        if (_id === this.snapshot.detail._id) {
            this.update({
                detail: {
                    ...this.snapshot.detail,
                    ...payload
                }
            });
        }
    }

    @Action(commentActions.add)
    pureAddComment(_id: string, payload: { _id: string; content: string }) {
        detailAddCommentSpy(_id, payload)
        this.update({
            detail: {
                ...this.snapshot.detail,
                comments: produce(this.snapshot.detail.comments).add(payload)
            }
        });
    }

    @Action(likePage)
    pureGiveALike(_id: string) {
        likePageSpy(_id);
    }

    dispatchUpdateTitle(id: string, payload: { title: string }) {
        dispatch(updateTitle(id, { title: payload.title }));
    }

    dispatchUpdateContent(_id: string, payload: { content: string }) {
        dispatch(updateContent(_id, payload));
    }

    dispatchAddComment(_id: string, payload: { _id: string; content: string }) {
        dispatch(commentActions.add(_id, payload));
    }
}

interface PagesState extends EntityState<Page> {}

@Injectable({ providedIn: 'root' })
export class PagesStore extends EntityStore<PagesState, Page> {
    constructor() {
        super({ entities: pageList });
    }

    @Action(updateTitle)
    pureUpdateTitle(_id: string, payload: { title: string }) {
        this.update(_id, { title: payload.title });
        listTitleChangeSpy(_id, payload);
    }

    @Action(upvote)
    pureUpvote(_id: string) {
        upvoteSpy(_id);
        this.update(_id, (entity) => ({
            ...entity,
            voteCount: (entity.voteCount || 0) + 1
        }));
    }

    @Action(commentActions.add)
    pureAddComment(_id: string) {
        listAddCommentSpy(_id)
        this.update(_id, (entity) => ({
            ...entity,
            commentCount: (entity.commentCount || 0) + 1
        }));
    }

    dispatchUpvote(id: string) {
        dispatch(upvote(id));
    }
}

describe('#dispatchActions', () => {
    let detailStore: PageDetailStore;
    let listStore: PagesStore;

    describe('#initialize', () => {
        it('should get initial state value', () => {
            detailStore = TestBed.inject(PageDetailStore);
            expect(detailStore.getState()).toEqual({ detail: pageDetail });
            listStore = TestBed.inject(PagesStore);
            expect(listStore.getState()).toEqual({ entities: pageList });
        });
    });

    describe('#dispatch action', () => {
        it('should action functions invoke when dispatch', () => {
            detailStore = TestBed.inject(PageDetailStore);
            listStore = TestBed.inject(PagesStore);
            detailStore.dispatchUpdateTitle('1', { title: 'New First Page Title' });
            expect(detailTitleChangeSpy).toHaveBeenCalledWith('1', { title: 'New First Page Title' });
            expect(listTitleChangeSpy).toHaveBeenCalledWith('1', { title: 'New First Page Title' });
            expect(detailContentChangeSpy).not.toHaveBeenCalled();
            detailStore.dispatchUpdateContent('1', { content: 'New First Page Content' });
            expect(detailContentChangeSpy).toHaveBeenCalledWith('1', { content: 'New First Page Content' });
        });

        it('should get correct value when dispatch action', () => {
            detailStore = TestBed.inject(PageDetailStore);
            listStore = TestBed.inject(PagesStore);
            detailStore.dispatchUpdateTitle('1', { title: 'New First Page Title' });
            expect(detailStore.snapshot.detail.title).toEqual('New First Page Title');
            const entity = listStore.snapshot.entities.find((item) => item._id === '1');
            expect(entity.title).toEqual('New First Page Title');
        });

        it('should invoke correct function when action with same type', () => {
            detailStore = TestBed.inject(PageDetailStore);
            listStore = TestBed.inject(PagesStore);
            listStore.dispatchUpvote('1');
            expect(upvoteSpy).toHaveBeenCalledWith('1');
            expect(likePageSpy).not.toHaveBeenCalled();
            const entity = listStore.snapshot.entities.find((item) => item._id === '1');
            expect(entity.voteCount).toEqual(1);
        });
    });

    describe('#dispatch group action', () => {
        it('should action functions invoke when dispatch', () => {
            detailStore = TestBed.inject(PageDetailStore);
            listStore = TestBed.inject(PagesStore);
            detailStore.dispatchAddComment('1', { _id: 'comment_1', content: 'A New Comment' });
            expect(detailAddCommentSpy).toHaveBeenCalledWith('1', { _id: 'comment_1', content: 'A New Comment' });
            expect(listAddCommentSpy).toHaveBeenCalledWith('1');
            expect(detailStore.snapshot.detail.comments[0]).toEqual({ _id: 'comment_1', content: 'A New Comment' });
            const entity = listStore.snapshot.entities.find((item) => item._id === '1');
            expect(entity.commentCount).toEqual(1);
        });
    });
});
