/**
 * A `WeakRef`-compatible reference that fakes the API with a strong reference
 * internally.
 */
class LeakyRef<T> /* implements WeakRef<T> */ {
    constructor(private readonly ref: T) {}

    deref(): T | undefined {
        return this.ref;
    }
}

export interface WeakRefCtor {
    new <T extends object>(value: T): WeakRef<T>;
}

let WeakRefImpl: WeakRefCtor | undefined = window['WeakRef'] ?? LeakyRef;

export interface WeakRef<T extends object> {
    deref(): T | undefined;
}

export function newWeakRef<T extends object>(value: T): WeakRef<T> {
    return new WeakRefImpl!(value);
}
