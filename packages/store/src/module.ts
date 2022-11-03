import { NgModule, ModuleWithProviders, Type, Injector, NgModuleRef } from '@angular/core';
import { ROOT_STORES_TOKEN, FEATURE_STORES_TOKEN } from './types';
import { Store } from './store';
import { clearInjector, setInjector } from './internals/static-injector';
import { PLUGINS_TOKEN, StorePlugin } from './plugin';
import { StorePluginManager } from './plugin-manager';

@NgModule()
export class ThyRootStoreModule {
    constructor(ngModuleRef: NgModuleRef<any>, private storePluginManager: StorePluginManager) {
        setInjector(ngModuleRef.injector);
        ngModuleRef.onDestroy(clearInjector);
    }
}

@NgModule()
export class ThyFeatureStoreModule {
    constructor(private storePluginManager: StorePluginManager) {}
}

@NgModule({})
export class ThyStoreModule {
    static forRoot(
        stores: Type<Store>[] = [],
        options?: {
            plugins: Type<StorePlugin>[];
        }
    ): ModuleWithProviders<ThyRootStoreModule> {
        const pluginProviders = (options?.plugins || []).map((PluginClass) => {
            return {
                provide: PLUGINS_TOKEN,
                useClass: PluginClass,
                multi: true
            };
        });
        return {
            ngModule: ThyRootStoreModule,
            providers: [
                ...stores,
                {
                    provide: ROOT_STORES_TOKEN,
                    useValue: stores
                },
                ...pluginProviders,
                StorePluginManager
            ]
        };
    }

    static forFeature(stores: Type<Store>[] = []): ModuleWithProviders<ThyFeatureStoreModule> {
        return {
            ngModule: ThyFeatureStoreModule,
            providers: [
                ...stores,
                {
                    provide: FEATURE_STORES_TOKEN,
                    multi: true,
                    useValue: stores
                },
                StorePluginManager
            ]
        };
    }
}
