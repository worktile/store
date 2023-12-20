import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { Action } from '../../action';
import { ThyStoreModule } from '../../module';
import { Store } from '../../store';
import { ReduxDevtoolsPlugin } from '../../plugins/redux-devtools';
import { clearReduxDevtoolsExtension, createReduxDevtoolsExtension } from './create-redux-devtools';
import { ReduxDevtoolsMockConnector } from './redux-connector';

@Injectable()
class CounterStore extends Store<{ count: number }> {
    constructor() {
        super({ count: 0 }, { name: 'counter' });
    }
    @Action()
    increment() {
        this.update((state) => {
            return { count: state.count + 1 };
        });
    }

    @Action()
    decrement(value: number = 1) {
        this.update((state) => {
            return { count: state.count - value };
        });
    }
}

describe('redux-devtools', () => {
    describe('connect', () => {
        let devtools: ReduxDevtoolsMockConnector;

        beforeEach(() => {
            devtools = new ReduxDevtoolsMockConnector();
            createReduxDevtoolsExtension(devtools);
            TestBed.configureTestingModule({
                imports: [ThyStoreModule.forRoot([CounterStore], { plugins: [ReduxDevtoolsPlugin] })],
                providers: []
            });
        });

        afterEach(() => {
            clearReduxDevtoolsExtension();
        });

        it('should catch actions correctly', () => {
            const counterStore = TestBed.inject(CounterStore);
            expect(devtools.currentState[`${counterStore.getStoreInstanceId()}`]).toEqual({ count: 0 });
            expect(devtools.devtoolsStack).toEqual([
                {
                    id: 1,
                    type: jasmine.stringMatching(/^counter-\d+@INIT$/),
                    payload: undefined,
                    state: null,
                    newState: jasmine.objectContaining({ [`${counterStore.getStoreInstanceId()}`]: { count: 0 } }),
                    jumped: false
                }
            ]);
            counterStore.increment();
            expect(devtools.currentState[`${counterStore.getStoreInstanceId()}`]).toEqual({ count: 1 });
            expect(devtools.devtoolsStack).toEqual([
                {
                    id: 1,
                    type: jasmine.stringMatching(/^counter-\d+@INIT$/),
                    payload: undefined,
                    state: null,
                    newState: jasmine.objectContaining({ [`${counterStore.getStoreInstanceId()}`]: { count: 0 } }),
                    jumped: false
                },
                {
                    id: 2,
                    type: jasmine.stringMatching(/^counter-\d+@increment$/),
                    payload: undefined,
                    state: jasmine.objectContaining({ [`${counterStore.getStoreInstanceId()}`]: { count: 0 } }),
                    newState: jasmine.objectContaining({ [`${counterStore.getStoreInstanceId()}`]: { count: 1 } }),
                    jumped: false
                }
            ]);
            counterStore.increment();
            expect(devtools.currentState[`${counterStore.getStoreInstanceId()}`]).toEqual({ count: 2 });
            counterStore.decrement(2);
            expect(devtools.currentState[`${counterStore.getStoreInstanceId()}`]).toEqual({ count: 0 });

            expect(devtools.devtoolsStack).toEqual([
                {
                    id: 1,
                    type: jasmine.stringMatching(/^counter-\d+@INIT$/),
                    payload: undefined,
                    state: null,
                    newState: jasmine.objectContaining({ [`${counterStore.getStoreInstanceId()}`]: { count: 0 } }),
                    jumped: false
                },
                {
                    id: 2,
                    type: jasmine.stringMatching(/^counter-\d+@increment$/),
                    payload: undefined,
                    state: jasmine.objectContaining({ [`${counterStore.getStoreInstanceId()}`]: { count: 0 } }),
                    newState: jasmine.objectContaining({ [`${counterStore.getStoreInstanceId()}`]: { count: 1 } }),
                    jumped: false
                },
                {
                    id: 3,
                    type: jasmine.stringMatching(/^counter-\d+@increment$/),
                    payload: undefined,
                    state: jasmine.objectContaining({ [`${counterStore.getStoreInstanceId()}`]: { count: 1 } }),
                    newState: jasmine.objectContaining({ [`${counterStore.getStoreInstanceId()}`]: { count: 2 } }),
                    jumped: false
                },
                {
                    id: 4,
                    type: jasmine.stringMatching(/^counter-\d+@decrement$/),
                    payload: undefined,
                    state: jasmine.objectContaining({ [`${counterStore.getStoreInstanceId()}`]: { count: 2 } }),
                    newState: jasmine.objectContaining({ [`${counterStore.getStoreInstanceId()}`]: { count: 0 } }),
                    jumped: false
                }
            ]);
        });
    });

    it('should not connect successful', () => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [ReduxDevtoolsPlugin]
        });
        const reduxDevtoolsPlugin = TestBed.inject(ReduxDevtoolsPlugin);
        expect(reduxDevtoolsPlugin['isConnectSuccessful']()).toBe(false);
    });
});
