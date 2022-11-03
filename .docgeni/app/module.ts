import { isDevMode } from '@angular/core';
import { ThyStoreModule, ReduxDevtoolsPlugin } from '@tethys/store';

export default {
    imports: [
        ThyStoreModule.forRoot([], {
            plugins: isDevMode() ? [ReduxDevtoolsPlugin] : []
        })
    ]
};
