import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { TodosStore } from './items.store';
import { takeUntil, finalize, switchMap, catchError } from 'rxjs/operators';
import { MonoTypeOperatorFunction, of, Subject, Observable } from 'rxjs';

@Component({
    selector: 'thy-store-cancellation-example',
    templateUrl: './cancellation.component.html',
    styleUrls: ['./cancellation.component.scss'],
    providers: [TodosStore],
    standalone: false
})
export class ThyStoreCancellationExampleComponent implements OnInit {
    public todosStore = inject(TodosStore);
    destroy$ = new Subject<void>();

    loadingDone = false;

    messages: string[] = [];

    todos$ = this.todosStore.select$((state) => {
        return state.items;
    });

    constructor() {}

    ngOnInit(): void {
        this.fetchItems();
    }

    fetchItems() {
        this.loadingDone = false;
        this.todosStore
            .fetchItems()
            .pipe(
                finalize(() => {
                    this.loadingDone = true;
                })
            )
            .subscribe({
                next: (result) => {
                    console.log(`next`, result);
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
        this.todosStore.cancelUncompleted();
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
