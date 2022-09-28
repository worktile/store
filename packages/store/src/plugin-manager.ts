import { Inject, Injectable, Optional, SkipSelf, Type } from '@angular/core';
import { PLUGINS_TOKEN, StorePlugin, StorePluginFn } from './plugin';

@Injectable()
export class StorePluginManager {
    private static pluginManager: StorePluginManager;

    private pluginHandlers: StorePluginFn[] = [];

    static get instance() {
        return this.pluginManager;
    }

    get rootPluginHandlers(): StorePluginFn[] {
        return (this.parentManager && this.parentManager.pluginHandlers) || this.pluginHandlers;
    }

    constructor(
        @Optional()
        @SkipSelf()
        private parentManager: StorePluginManager,
        @Optional()
        @Inject(PLUGINS_TOKEN)
        private plugins: StorePlugin[]
    ) {
        StorePluginManager.pluginManager = this.parentManager || this;
        if (!this.parentManager) {
            this.registerPlugins();
        }
    }

    private registerPlugins(): void {
        const pluginHandlers: StorePluginFn[] = this.getPluginHandlers();
        this.rootPluginHandlers.push(...pluginHandlers);
    }

    private getPluginHandlers(): StorePluginFn[] {
        const plugins: StorePlugin[] = this.plugins || [];
        return plugins.map((plugin: StorePlugin) => (plugin.handle ? plugin.handle.bind(plugin) : plugin) as StorePluginFn);
    }
}
