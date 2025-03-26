import { Component, Injectable } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { ThyStoreModule, Store } from '../index';

class StringSelectState {
    baz: string;
    boo: string;
}

@Injectable()
class StringSelectStore extends Store<StringSelectState> {
    constructor() {
        super({
            baz: 'Hello',
            boo: 'Worktile'
        });
    }
}

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'my-component-0',
    template: '',
    standalone: false
})
class StringSelectComponent {
    // @Select('counter') state: Observable<StateModel>;
    // @Select('counter.boo') subState: Observable<SubStateModel>;
    // @Select('counter.boo.baz') subSubState: Observable<SubSubStateModel>;

    state: Observable<StringSelectState>;

    subState: Observable<string>;

    constructor(store: StringSelectStore) {
        this.state = store.select$((state) => {
            return state;
        }) as Observable<StringSelectState>;

        this.subState = store.select$((state: StringSelectState) => {
            return state.baz;
        });
    }
}

describe('select', () => {
    it('should select the correct state using string', waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [ThyStoreModule.forRoot([StringSelectStore])],
            declarations: [StringSelectComponent]
        });

        const comp = TestBed.createComponent(StringSelectComponent);

        comp.componentInstance.state.subscribe((state) => {
            expect(state.baz).toBe('Hello');
            expect(state.boo).toBe('Worktile');
        });

        comp.componentInstance.subState.subscribe((state) => {
            expect(state).toBe('Hello');
        });
    }));
});
