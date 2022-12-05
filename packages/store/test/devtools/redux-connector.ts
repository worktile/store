import { Subject, Subscription } from 'rxjs';
import { ActionContext } from '../../actions-stream';

import { DevtoolsCallStack, MockState } from './symbols';

export class ReduxDevtoolsMockConnector {
    public devtoolsStack: DevtoolsCallStack[] = [];
    public initialState: MockState = null!;
    public currentState: MockState = null!;
    private dispatcher: Subject<ActionContext> = new Subject<ActionContext>();
    private countId = 0;

    public subscribe(fn: Function): () => void {
        const subscription = this.dispatcher.subscribe((e) => fn(e));
        return () => {
            subscription.unsubscribe();
        };
    }

    public init(state: MockState): void {
        this.initialState = JSON.parse(JSON.stringify(state));
        this.devtoolsStack.push({
            id: this.countId,
            type: '@INIT',
            payload: undefined,
            state: undefined!,
            newState: state,
            jumped: false
        });
    }

    public send(action: any, newState?: any): void {
        this.countId++;

        const prevState: MockState =
            this.devtoolsStack.length > 0 ? this.devtoolsStack[this.devtoolsStack.length - 1].newState : this.initialState;

        this.currentState = newState;
        this.devtoolsStack.push({
            id: this.countId,
            type: action.type,
            payload: action.payload,
            state: prevState,
            newState: newState,
            jumped: false
        });
    }

    public jumpToActionById(id: number): void {
        if (!id) {
            return; // can't jump to @INIT
        }

        for (let i = this.devtoolsStack.length - 1, marked = false; i >= 0; i--) {
            const pointer: DevtoolsCallStack = this.devtoolsStack[i];

            if (pointer.id === id) {
                marked = true;

                // this.dispatcher.next({
                //     // id: pointer.id,
                //     action: 'DISPATCH',
                //     payload: { type: 'JUMP_TO_ACTION' },
                //     state: JSON.stringify(pointer.newState),
                //     source: null!
                // });
            }

            pointer.jumped = !marked;
        }
    }

    public disconnect() {}
}
