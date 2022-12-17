import { ThyStoreModule, ReduxDevtoolsPlugin } from '@tethys/store';
import { environment } from '../environments/environment';

export default {
    imports: [
        ThyStoreModule.forRoot([], {
            plugins: environment.production ? [] : [ReduxDevtoolsPlugin]
        })
    ]
};
