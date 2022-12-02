import { Injectable } from '@angular/core';
import { Store } from '@tethys/store';
// import { Store } from "@tethys/store/form";

interface FormState<T> {
    model: T;
    dirty: boolean;
    status: string;
    errors: {};
}

interface User {
    name: string;
    address: string[];
}

interface UserState {
    user: FormState<User>;
}

@Injectable()
export class UserFormStore extends Store<UserState> {
    constructor() {
        super(
            {
                user: {
                    model: undefined,
                    dirty: false,
                    status: '',
                    errors: {}
                }
            },
            { name: 'new-user' }
        );
    }
}
