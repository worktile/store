import { Directive, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { Store } from '@tethys/store';
import { produce } from '@tethys/cdk/immutable';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, take, takeUntil } from 'rxjs/operators';

@Directive({ selector: '[thyStoreForm]' })
export class StoreFormDirective implements OnInit, OnDestroy {
    @Input('thyStoreForm') store: Store;

    @Input() thyStatePath: string;

    @Input() thyClearDestroy = true

    @Input() thyDynamic = false

    /**
     * 当表单控件的updateOn属性为change时，使用debounce值来提高性能，如果希望change后store同步反应变化，请将debounce设为-1
     */
    @Input()
    set thyDebounce(debounce: string | number) {
        this._debounce = Number(debounce);
    }

    get debounce(): number{
        return this._debounce
    }

    private _debounce = 100;

    private updating = false;

    private get path(){
        return this.thyStatePath
    }

    private destroy$ = new Subject<void>();

    constructor(
        private formGroup: FormGroupDirective,
        private _cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        // TODO 之后完善FormStore的时候，这里仍需要对表单状态相关操作的响应
        // this.getFormReset$().pipe(
        //         filter(payload => payload.path === this.path)
        //     ).subscribe(payload => {
        //         this.formGroup.reset(payload.value)
        //         this.updateStateWithRawValue(true)
        //         this._cdr.markForCheck();
        //     })

        // 如果是动态表单，意味着用户会根据一些获取到的数据初始化表单控件，此时，无法在store中提前确定表单model的内容，故需要指令初始化时，将组件内的表单内容同步到store中
        if(this.thyDynamic) {
            this.getStateStream(`${this.path}`)
                .pipe(take(1))
                .subscribe(() => {
                    this.store.update(state => {
                        let obj = produce(state).set(`${this.path}.model`, this.form.getRawValue())
                        obj = produce(obj).set(`${this.path}.status`, this.form.status)
                        obj = produce(obj).set(`${this.path}.dirty`, this.form.dirty)
                        return obj
                    })
                });
        }

        this.getStateStream(`${this.path}.model`).subscribe(model => {
            if(this.updating) {
                return
            }
            this.form.patchValue(model)
            this._cdr.markForCheck()
        })
        this.getStateStream(`${this.path}.dirty`).subscribe(dirty => {
            if (this.form.dirty === dirty || typeof dirty !== 'boolean') {
                return;
              }
              if (dirty) {
                this.form.markAsDirty();
              } else {
                this.form.markAsPristine();
              }
              this._cdr.markForCheck();
        })
        // disabled状态源自于status，故不另设disabled属性，保持简洁
        this.getStateStream(`${this.path}.status`).pipe(map(status => status === 'DISABLED')).subscribe(disabled => {
            if (this.form.disabled === disabled || typeof disabled !== 'boolean') {
                return;
            }
            if (disabled) {
                this.form.disable();
            } else {
                this.form.enable();
            }
            this._cdr.markForCheck();
        })

        /**
         * ngOnInit里的这几个部分有顺序要求，从store订阅数据并向formGroup同步的代码必须放置于订阅formGroup之前，从而保证初始化的时候可以将store中的数据准确初始化至formGroup。
         * 如果将下方这个代码放到其他内容之前，则会导致store中dirty的丢失。
         * 因为store中的form初始值会在指令init的时候set至formGroup，formGroup触发valueChanges方法，并在对valueChanges的订阅中将form同步到store，导致store中的dirty初始值被覆盖
         */
        this.formGroup
            .valueChanges!.pipe(
                distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
                this.debounceChange()
            )
            .subscribe(() => {
                this.updateStateWithRawValue();
            });

        this.formGroup
            .statusChanges!.pipe(distinctUntilChanged(), this.debounceChange())
            .subscribe((status: string) => {
                this.store.update(state => {
                    return produce(state).set(`${this.path}.status`, status)
                })
            });
    }

    // 只有当表单reset的时候，才会将formStatus与value一起同步到store中。其他情况，分别处理value与status的变化
    updateStateWithRawValue(withFormStatus = false) {
        if (this.updating) return;

        const value = this.formGroup.control.getRawValue();

        let updateState = {
            model: value,
            status: null,
            dirty: this.formGroup.dirty,
            errors: this.formGroup.errors
        };
        if (withFormStatus) {
            updateState.status = this.formGroup.status;
        }

        this.updating = true;

        this.store.update((state) => {
            let obj = produce(state).set(`${this.path}.model`, updateState.model)
            obj = produce(obj).set(`${this.path}.status`, updateState.status)
            obj = produce(obj).set(`${this.path}.dirty`, updateState.dirty)
            obj = produce(obj).set(`${this.path}.errors`, updateState.errors)
            return obj
        });
        this.updating = false;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        if (this.thyClearDestroy) {
            this.store.update(state => {
                let obj = produce(state).set(`${this.path}.model`, null)
                obj = produce(obj).set(`${this.path}.status`, null)
                obj = produce(obj).set(`${this.path}.dirty`, null)
                obj = produce(obj).set(`${this.path}.errors`, null)
                return obj
            })
          }
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

    private getStateStream(path: string) {
        return this.store.select(state => produce(state).get(path)).pipe(takeUntil(this.destroy$));
    }
}
