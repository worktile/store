import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { UserFormStore } from './form.store';

@Component({
    selector: 'thy-store-form-example',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss'],
    providers: [UserFormStore],
    standalone: false
})
export class ThyStoreFormExampleComponent implements OnInit {
    newUserForm = new FormGroup({
        name: new FormControl()
    });

    constructor(public userFormStore: UserFormStore) {}

    // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
    ngOnInit(): void {}

    onSubmit() {
        debugger;
    }
}
