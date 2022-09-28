import { ReduxDevtoolsMockConnector } from './redux-connector';

export function createReduxDevtoolsExtension(connector: ReduxDevtoolsMockConnector): void {
    Object.defineProperty(window, '__REDUX_DEVTOOLS_EXTENSION__', {
        writable: true,
        configurable: true,
        value: {
            connect(): ReduxDevtoolsMockConnector {
                return connector;
            },
            disconnect() {
                connector.disconnect();
            }
        }
    });
}

export function clearReduxDevtoolsExtension() {
    Object.defineProperty(window, '__REDUX_DEVTOOLS_EXTENSION__', {
        value: undefined
    });
}
