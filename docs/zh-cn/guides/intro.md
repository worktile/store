---
title: 介绍
order: 10
---

一个小巧且强大的 Angular 状态管理类库。

## 为什么？
之前我们写过一篇 [Angular 真的需要状态管理么？](https://zhuanlan.zhihu.com/p/45121775) 的文章，在 Angular 框架下，通过 Service 和 Observable 组合可以满足任何场景的状态管理，但是 RxJS 太过于抽象和难学，所以就导致部分开发人无法驾驭好 RxJS，容易在组件中直接修改状态，为了约束开发者的行为，同时提供统一的 API 简化业务操作，所以我们封装了一个小型的状态管理类库，让 RxJS 非精通的开发人员也能更好的管理好状态。

## 特性
- 完美结合 Angular 的设计理念，Store 即服务
- 领域驱动，多 Store，每个 Store 属于一个领域，状态存储和操作聚合
- 简单易上手的 API，无需过多学习成本

欢迎参与贡献：https://github.com/tethys-org/store
