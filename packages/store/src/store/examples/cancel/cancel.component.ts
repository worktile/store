import { Component, OnInit, OnDestroy } from '@angular/core';
import { ItemsStore } from './items.store';
import { takeUntil, finalize, switchMap, catchError } from 'rxjs/operators';
import { MonoTypeOperatorFunction, of, Subject, Observable } from 'rxjs';

@Component({
    selector: 'thy-store-cancel',
    templateUrl: './cancel.component.html',
    styleUrls: ['./cancel.component.scss'],
    providers: [ItemsStore]
})
export class ThyStoreSoleExampleComponent implements OnInit, OnDestroy {
    destroy$ = new Subject<void>();

    loadingDone = false;

    messages: string[] = [];

    start$ = new Subject<void>();

    constructor(public itemsStore: ItemsStore) {}

    ngOnInit(): void {
        this.fetch();
        // this.itemsStore.hello();
        // this.setup();
        // this.start$.next();
    }

    private setup() {
        this.start$
            .pipe(
                switchMap(() => {
                    this.loadingDone = false;
                    console.log(`fetchItems`);
                    return this.itemsStore.fetchItems().pipe(
                        finalize(() => {
                            console.log(`finalize`);
                            this.loadingDone = true;
                        }),
                        catchError(() => {
                            return of([]);
                        })
                    );
                    return of(true).pipe(
                        switchMap(() => {
                            console.log(`fetchItems`);
                            this.loadingDone = false;
                            return this.itemsStore.fetchItems();
                        }),
                        finalize(() => {
                            console.log(`finalize`);
                            this.loadingDone = true;
                        }),
                        catchError((error) => {
                            console.log(error);
                            return of([]);
                        })
                    );
                }),
                takeUntil(this.destroy$)
            )
            .subscribe({
                next: (value) => {
                    // this.loadingDone = true;
                    this.messages.push(`Items fetched ${new Date()}`);
                }
            });
    }

    fetch() {
        // this.start$.next();
        // return;
        this.loadingDone = false;
        this.itemsStore
            .fetchItems()
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => {
                    this.loadingDone = true;
                })
                // loadingDone(() => {
                //     this.loadingDone = true;
                // })
            )
            .subscribe({
                next: (result) => {
                    this.messages.push(`Items fetched ${new Date()}`);
                },
                error: (error: Error) => {
                    console.log(error);
                },
                complete: () => {
                    console.log('complete!');
                }
            });
    }

    cancel() {
        this.itemsStore.cancelUncompleted();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}

export function loadingDone<T>(callback: () => void): MonoTypeOperatorFunction<T> {
    return (source: Observable<T>) => {
        return new Observable((observer) => {
            const onNext = (value: T) => {
                callback();
                observer.next(value);
            };
            const onError = (error: Error) => {
                callback();
                observer.error(error);
            };
            const onComplete = () => observer.complete();
            return source.subscribe(onNext, onError, onComplete);
        });
    };
}
