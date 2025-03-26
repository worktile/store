import { ChangeDetectionStrategy, Component, Injectable } from '@angular/core';
import {
    FormBuilder,
    FormControlStatus,
    FormGroup,
    FormControl,
    ReactiveFormsModule,
    ValidationErrors,
    AbstractControl
} from '@angular/forms';
import { Store } from '../store';
import { FormModelState, createFormModel } from '../form/form-store';
import { Action } from '../action';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { StoreFormDirective } from '../form';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { produce } from '@tethys/cdk';

@Injectable()
class TestStore extends Store<{ obj: { form: FormModelState<{ value: string | null }> } }> {
    constructor() {
        super({
            obj: {
                form: createFormModel(
                    { value: 'test' },
                    {
                        dirty: true,
                        status: null,
                        errors: {}
                    }
                )
            }
        });
    }

    @Action()
    setFormValue(value: string | null): void {
        this.update((state) => {
            let form = state.obj.form;
            form = {
                ...form,
                model: { value }
            };
            state.obj.form = form;
            return state;
        });
    }

    changeFormStatus(status: FormControlStatus | null): void {
        this.update((state) => {
            let obj = produce(state).set('obj.form.status', status);
            return obj;
        });
    }
}

@Component({
    selector: 'thy-test-form',
    template: `
        <form [formGroup]="form" [thyStoreForm]="store" thyStatePath="obj.form" thyDebounce="-1" [thyClearDestroy]="true">
            <input type="text" formControlName="value" />
        </form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
class TestFormPluginComponent {
    public form: FormGroup;
    constructor(
        public store: TestStore,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            value: new FormControl()
        });
    }

    setFormValue(value: string | null) {
        this.form.patchValue({ value });
    }
}

@Component({
    selector: 'thy-test-form-required',
    template: `
        <form [formGroup]="form" [thyStoreForm]="store" thyStatePath="obj.form" thyDebounce="-1" [thyClearDestroy]="true">
            <input type="text" formControlName="value" />
        </form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
class TestFormRequiredPluginComponent {
    public form: FormGroup;
    constructor(
        public store: TestStore,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            value: this.fb.control(null, this.cantBeNull)
        });
    }

    setFormValue(value: string | null) {
        this.form.patchValue({ value });
    }

    cantBeNull(control: AbstractControl<any, any>): ValidationErrors {
        if (control.value === null) {
            return {
                cantBeNull: true
            };
        }
        return null;
    }
}

@Component({
    selector: 'thy-test-debounce-form',
    template: `
        <form [formGroup]="form" [thyStoreForm]="store" thyStatePath="obj.form" [thyClearDestroy]="true">
            <input type="text" formControlName="value" />
        </form>
    `,
    standalone: false
})
class TestDebounceFormPluginComponent {
    public form: FormGroup;
    constructor(
        public store: TestStore,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            value: new FormControl()
        });
    }

    setFormValue(value: string | null) {
        this.form.patchValue({ value });
    }
}

describe('form directive', () => {
    it('should sync model and dirty from store to component when init', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            declarations: [TestFormPluginComponent, StoreFormDirective],
            imports: [CommonModule, ReactiveFormsModule],
            providers: [TestStore]
        });
        const store = TestBed.inject(TestStore);
        const formFixture = TestBed.createComponent(TestFormPluginComponent);
        formFixture.detectChanges();
        const input = formFixture.debugElement.query(By.css('form input')).nativeElement;
        expect(input.value).toBe('test');
        expect(formFixture.componentInstance.form.dirty).toBe(true);
    });

    it("should get new value and 'dirty' status in component synchronal", () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            declarations: [TestFormPluginComponent, StoreFormDirective],
            imports: [CommonModule, ReactiveFormsModule],
            providers: [TestStore]
        });
        const store = TestBed.inject(TestStore);
        const formFixture = TestBed.createComponent(TestFormPluginComponent);
        formFixture.detectChanges();
        const input = formFixture.debugElement.query(By.css('form input')).nativeElement;
        expect(formFixture.componentInstance.form.dirty).toBe(true);
        store.update((state) => {
            let obj = produce(state).set('obj.form.model', { value: 'is not dirty' });
            obj = produce(obj).set('obj.form.dirty', false);
            return obj;
        });
        expect(formFixture.componentInstance.form.dirty).toBe(false);
        expect(input.value).toBe('is not dirty');
    });

    it('should get new value in store synchronal when ui change', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            declarations: [TestFormPluginComponent, StoreFormDirective],
            imports: [CommonModule, ReactiveFormsModule],
            providers: [TestStore]
        });
        const store = TestBed.inject(TestStore);
        const formFixture = TestBed.createComponent(TestFormPluginComponent);
        formFixture.detectChanges();
        const input = formFixture.debugElement.query(By.css('form input')).nativeElement;
        input.value = 'new input';
        input.dispatchEvent(new KeyboardEvent('input'));
        expect(store.snapshot.obj.form.model).toEqual({ value: 'new input' });
    });

    it('should react in dom and store when developer set formControl value in component', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            declarations: [TestFormPluginComponent, StoreFormDirective],
            imports: [CommonModule, ReactiveFormsModule],
            providers: [TestStore]
        });
        const store = TestBed.inject(TestStore);
        const formFixture = TestBed.createComponent(TestFormPluginComponent);
        formFixture.detectChanges();
        const input = formFixture.debugElement.query(By.css('form input')).nativeElement;
        formFixture.componentInstance.setFormValue('new form value');
        expect(input.value).toBe('new form value');
        expect(store.snapshot.obj.form.model).toEqual({ value: 'new form value' });
    });

    it('should get new value in store asynchronous when ui change', fakeAsync(() => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            declarations: [TestDebounceFormPluginComponent, StoreFormDirective],
            imports: [CommonModule, ReactiveFormsModule],
            providers: [TestStore]
        });
        const store = TestBed.inject(TestStore);
        const formDebounceFixture = TestBed.createComponent(TestDebounceFormPluginComponent);
        formDebounceFixture.detectChanges();
        const input = formDebounceFixture.debugElement.query(By.css('form input')).nativeElement;
        input.value = 'new input';
        input.dispatchEvent(new KeyboardEvent('input'));
        expect(store.snapshot.obj.form.model).toEqual({ value: 'test' });
        tick(100);
        expect(store.snapshot.obj.form.model).toEqual({ value: 'new input' });
    }));

    it('should clear form in store when thyClearDestroy is true', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            declarations: [TestFormPluginComponent, StoreFormDirective],
            imports: [CommonModule, ReactiveFormsModule],
            providers: [TestStore]
        });
        const store = TestBed.inject(TestStore);
        const formFixture = TestBed.createComponent(TestFormPluginComponent);
        formFixture.detectChanges();
        const input = formFixture.debugElement.query(By.css('form input')).nativeElement;
        expect(input.value).toBe('test');
        expect(formFixture.componentInstance.form.dirty).toBe(true);
        formFixture.destroy();
        expect(store.snapshot.obj.form).toEqual({
            model: null,
            errors: null,
            dirty: null,
            status: null
        });
    });

    it('should be invalid when form model value is null', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            declarations: [TestFormRequiredPluginComponent, StoreFormDirective],
            imports: [CommonModule, ReactiveFormsModule],
            providers: [TestStore]
        });
        const store = TestBed.inject(TestStore);
        const formFixture = TestBed.createComponent(TestFormRequiredPluginComponent);
        formFixture.detectChanges();
        store.setFormValue(null);
        expect(store.snapshot.obj.form.status).toBe('INVALID');
    });

    // it("should be null when reset with null", () => {
    //   TestBed.resetTestingModule()
    //   TestBed.configureTestingModule({
    //     declarations: [
    //       TestFormPluginComponent,
    //       StoreFormDirective
    //     ],
    //     imports: [ CommonModule, ReactiveFormsModule ],
    //     providers: [ TestStore ],
    //   })
    //   const store = TestBed.inject(TestStore)
    //   const formFixture = TestBed.createComponent(TestFormPluginComponent)
    //   formFixture.detectChanges()
    //   const input = formFixture.debugElement.query(By.css("form input")).nativeElement;
    //   expect(input.value).toBe("test")
    //   store.resetForm('obj.form',{ value: null })
    //   expect(store.snapshot.obj.form.model).toEqual({ value: null })
    //   expect(input.value).toBe("")
    //   expect(formFixture.componentInstance.form.getRawValue()).toEqual({ value: null })
    // })
});
