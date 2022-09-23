---
title: Introduce
order: 10
---

A mini, yet powerful state management library for Angular.

## Why？

We wrote an article before [Does Angular need state management?](https://zhuanlan.zhihu.com/p/45121775), Under the Angular framework, the state of front-end application can be easily managed through the `Service` and `Observable,` but `RxJS` is too abstract and difficult to learn, which makes it difficult for some developers to control `RxJS` and easy modify the state directly in components. In order to restrict the behavior of developers and provide a unified API to simplify business operations, we have encapsulated a small state management class library, It allows ordinary developers to manage the state well.

## Features
- Angular Styled, Store as a Service
- DDD, multi-store model, each store belongs to a domain, state storage and actions are together
- Easy to use API without excessive learning cost

## Model Diagram
![](assets/images/overview-structure.png)

## Logic Diagram
![](assets/images/store-structure.png)

Welcome to contribute: https://github.com/worktile/store
