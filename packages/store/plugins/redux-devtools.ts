import { Injectable, inject, OnDestroy, NgZone, ɵglobal, Optional, SkipSelf } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SafeAny } from '../inner-types';
import { PluginContext, StorePlugin, StorePluginNextFn } from '../plugin';

const enum ReduxDevtoolsActionType {
    Dispatch = 'DISPATCH',
    Action = 'ACTION'
}

const enum ReduxDevtoolsPayloadType {
    JumpToAction = 'JUMP_TO_ACTION',
    JumpToState = 'JUMP_TO_STATE',
    ToggleAction = 'TOGGLE_ACTION',
    ImportState = 'IMPORT_STATE'
}

interface ReduxDevtoolsAction {
    type: string;
    payload?: SafeAny;
}
/**
 * @internal
 */
interface DevtoolsExtension {
    send(action: ReduxDevtoolsAction, state: object): void;
    subscribe(callback: Function): VoidFunction;
}

@Injectable()
export class ReduxDevtoolsPlugin implements StorePlugin, OnDestroy {
    private devtoolsExtension: DevtoolsExtension | null = null;

    private unsubscribe: VoidFunction | null = null;

    private readonly globalDevtools: { connect(config: any): DevtoolsExtension; disconnect: () => void } =
        ɵglobal['__REDUX_DEVTOOLS_EXTENSION__'] || ɵglobal['devToolsExtension'];

    private ngZone = inject(NgZone);

    constructor(@Optional() @SkipSelf() reduxDevtoolsPlugin: ReduxDevtoolsPlugin) {
        if (!reduxDevtoolsPlugin) {
            this.connect();
        } else {
            this.devtoolsExtension = reduxDevtoolsPlugin.devtoolsExtension;
        }
    }

    handle<T>(ctx: PluginContext<unknown>, next: StorePluginNextFn<T>): Observable<T> {
        return next(ctx).pipe(
            catchError((error) => {
                this.sendToDevTools({ type: ctx.action }, ctx.getAllState());
                throw error;
            }),
            tap(() => {
                this.sendToDevTools({ type: ctx.action }, ctx.getAllState());
            })
        );
    }

    private connect() {
        if (!this.globalDevtools) {
            console.log(`Redux DevTools Extensions for browser are not installed.`);
            console.log(`Chrome Redux DevTools Plugin Download: https://www.chromefor.com/redux-devtools_v2-17-0/`);
            return;
        }

        // The `connect` method adds `message` event listener since it communicates
        // with an extension through `window.postMessage` and message events.
        // We handle only 2 events; thus, we don't want to run many change detections
        // because the extension sends events that we don't have to handle.
        this.devtoolsExtension = this.ngZone.runOutsideAngular(
            () => <DevtoolsExtension>this.globalDevtools.connect({
                    name: `@tethys/store`
                })
        );

        this.unsubscribe = this.devtoolsExtension.subscribe((action) => {
            if (action.type === ReduxDevtoolsActionType.Dispatch || action.type === ReduxDevtoolsActionType.Action) {
                this.ngZone.run(() => {
                    // TODO: add dispatch
                });
            }
        });
    }
    private sendToDevTools(action: ReduxDevtoolsAction, state: object): void {
        if (this.isConnectSuccessful()) {
            this.devtoolsExtension.send(action, state);
        }
    }

    private isConnectSuccessful(): boolean {
        if (!this.devtoolsExtension) {
            return false;
        }
        return true;
    }

    ngOnDestroy(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        if (this.globalDevtools) {
            this.globalDevtools.disconnect();
        }
    }
}
