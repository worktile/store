import { Directive, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { Store } from '@tethys/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Directive({ selector: '[thyStoreForm]' })
export class StoreFormDirective implements OnInit, OnDestroy {
    @Input('thyStoreForm') store: Store;

    @Input() thyStateKey: string;

    debounce = 100;

    private updating = false;

    private destroy$ = new Subject<void>();

    constructor(private formGroup: FormGroupDirective) {}

    ngOnInit(): void {
        this.formGroup
            .valueChanges!.pipe(
                distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
                this.debounceChange()
            )
            .subscribe(() => {
                this.updateStateWithRawValue(true);
            });

        this.store.select((state) => {
            return state[this.thyStateKey];
        });
    }

    updateStateWithRawValue(withFormStatus: boolean) {
        if (this.updating) return;

        const value = this.formGroup.control.getRawValue();

        let updateState = {
            model: value,
            status: undefined
        };
        if (withFormStatus) {
            updateState.status = this.formGroup.status;
        }

        this.updating = true;

        this.store.update((state) => {
            return {
                [`${this.thyStateKey}`]: {
                    ...state[this.thyStateKey],
                    ...updateState
                }
            };
        });
        this.updating = false;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private debounceChange() {
        const skipDebounceTime = this.formGroup.control.updateOn !== 'change' || this.debounce < 0;

        return skipDebounceTime
            ? (change: Observable<any>) => change.pipe(takeUntil(this.destroy$))
            : (change: Observable<any>) => change.pipe(debounceTime(this.debounce), takeUntil(this.destroy$));
    }

    private get form(): FormGroup {
        return this.formGroup.form;
    }

    // private getStateStream(path: string) {
    //     return this.store.select(state => getValue(state, path)).pipe(takeUntil(this.destroy$));
    // }
}
