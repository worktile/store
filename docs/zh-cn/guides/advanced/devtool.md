---
title: 开发工具
order: 100
---

Store 提供了和`ReduxDevtools`开发工具的集成，只需要根据 isDevMode 设置`ReduxDevtoolsPlugin`即可。

## 安装 redux-devtools 插件
点击 [redux-devtools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) 安装 Chrome 插件。

## 引入 ReduxDevtoolsPlugin 插件
在`AppModule`通过`ThyStoreModule.forRoot`参数`plugins`引入`ReduxDevtoolsPlugin`，一般建议通过`isDevMode()`只在开发环境开启此插件。
```ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThyStoreModule, ReduxDevtoolsPlugin } from '@tethys/store';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        ThyStoreModule.forRoot([], {
            plugins: isDevMode() ? [ReduxDevtoolsPlugin] : []
        })
    ],
    exports: [],
    providers: []
})
export class AppModule {}
```

## 打开调试工具
右击查看元素，选择 Redux 标签页即可查看应用当前的状态，左侧菜单为每次调用的 Action，右侧为应用的当前状态。
![](assets/images/redux-devtools.png)
