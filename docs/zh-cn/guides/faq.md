---
title: 常见问题
order: 200
---

## 为什么采用多`Store`
我们认为多`Store`更加符合前端数据管理的思想，每个`Store`定义为一个特性领域，状态和操作应该聚合在一起，缺点就是当组件需要很多`Store`的状态时需要注入多个`Store`，同时需要开发者自己维护`Store`的依赖关系，对于这种复杂的场景我们应该通过合理划分`Store`或者加一些聚合`Store`来进行解决。

## 可变数据和不可变数据如何选择
推荐使用不可变数据，虽然在`Angular`中通过可变数据也是可以正常运行的，但是一旦需要通过`OnPush`模式提高应用程序性能的时候需要大量重构，所以建议一开始所有的数据都是通过不可变数据进行管理，`@tethys/store`底层提供的增删改查都是基于不可变数据的，`@tethys/cdk`类库中提供了一个小型的`immutable`不可变数据操作类库。

```ts
import { produce } from "@tethys/cdk/immutable";
produce(users).add(addUserEntity);
produce(users).remove([1, 2]);
produce(users).update(1, {name: "new-name"});
```

## 哪些产品在使用`@tethys/store`
[Worktile](https://worktile.com/) 和 [PingCode](https://pingcode.com/) 两款 toB 的 Sass 产品都在使用，起初在组件库中的`store`模块，后期单独抽取出来独立为`@tethys/store`，目前通过使用效果来看非常理想，我们的业务对于状态管理要求较高。

