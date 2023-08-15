# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

# [16.0.0-next.0](https://github.com/worktile/store/compare/v15.1.0...v16.0.0-next.0) (2023-08-15)


### Features

* upgrade ng to 16 ([#126](https://github.com/worktile/store/issues/126)) ([c5afdda](https://github.com/worktile/store/commit/c5afddadcc7f333f6152c7e47b2b46759a92062b))



# [15.1.0](https://github.com/worktile/store/compare/v15.0.0...v15.1.0) (2023-07-08)


### Bug Fixes

* add compatible for WeakRef ([518a5bc](https://github.com/worktile/store/commit/518a5bcc011923d1a2c6b60c76d944b46811d2a7))
* fix readme link ([d1d9706](https://github.com/worktile/store/commit/d1d970676ee74627c4622e2bc22bb1ced02be965))


### Features

* develop form plugin ([a048249](https://github.com/worktile/store/commit/a0482499a4dbc0c6890b7b996d3d7e521d1477eb))
* **store:** support auto unregister store #INFR-6873 ([#110](https://github.com/worktile/store/issues/110)) ([648cb85](https://github.com/worktile/store/commit/648cb85a31cccdb6bcf0dedec626c9d04f838ecb)), closes [#INFR-6873](https://github.com/worktile/store/issues/INFR-6873)
* support Object type entity with references in EntityStore ([#116](https://github.com/worktile/store/issues/116)) ([2314b45](https://github.com/worktile/store/commit/2314b459ce15c75fef2fb76972d0c3166af31409))
* support references builder #INFR-6930 ([#111](https://github.com/worktile/store/issues/111)) ([1369689](https://github.com/worktile/store/commit/1369689ece75f472b46a6a7fb31cc8a55ac3c906)), closes [#INFR-6930](https://github.com/worktile/store/issues/INFR-6930)



# [15.0.0](https://github.com/worktile/store/compare/v15.0.0-next.0...v15.0.0) (2023-03-09)

### Features

* upgrade ng to 15 ([#103](https://github.com/worktile/store/issues/103)) ([43d2245](https://github.com/worktile/store/commit/43d224538a7af335d2b91dd46710c6adc0c849fc))


# [15.0.0-next.0](https://github.com/worktile/store/compare/v14.2.0...v15.0.0-next.0) (2023-02-02)


### Features

* upgrade ng to 15 ([#103](https://github.com/worktile/store/issues/103)) ([43d2245](https://github.com/worktile/store/commit/43d224538a7af335d2b91dd46710c6adc0c849fc))



# [14.2.0](https://github.com/worktile/store/compare/v14.1.1...v14.2.0) (2023-02-01)


### Features

* add update to Store instead of setState, mark setState as deprecated ([#101](https://github.com/worktile/store/issues/101)) ([d9bf41f](https://github.com/worktile/store/commit/d9bf41f9583e3c9ef92577984b750540cbc78156))
* use json prase and json stringfy to deep clone an initialState, to avoid object reference ([be6efe2](https://github.com/worktile/store/commit/be6efe24de85f22fd9162ed44ac2727e84be03f0))



## [14.1.1](https://github.com/worktile/store/compare/v14.1.0...v14.1.1) (2023-01-17)


### Features

* **store:** add options with strategy param for mergeReferences ([#95](https://github.com/worktile/store/issues/95)) ([06aedee](https://github.com/worktile/store/commit/06aedee27eeb870b519507ae877dd812a772bbfb))



# [14.1.0](https://github.com/worktile/store/compare/v14.1.0-next.3...v14.1.0) (2022-12-30)



# [14.1.0-next.3](https://github.com/worktile/store/compare/v14.1.0-next.2...v14.1.0-next.3) (2022-12-08)



# [14.1.0-next.2](https://github.com/worktile/store/compare/v14.1.0-next.1...v14.1.0-next.2) (2022-12-05)


### Features

* add compatible for entity-store use mutable data for snapshot ([f0e641d](https://github.com/worktile/store/commit/f0e641deecdb085146584529642acf9efd044491))



# [14.1.0-next.1](https://github.com/tethys-org/mini-store/compare/v14.1.0-next.0...v14.1.0-next.1) (2022-11-29)


### Bug Fixes

* rename StoreFactoryService to StoreFactory ([626c193](https://github.com/tethys-org/mini-store/commit/626c193731d49a02fb4788629998eb3518333cb2))



# [14.1.0-next.0](https://github.com/tethys-org/mini-store/compare/v14.0.4...v14.1.0-next.0) (2022-11-29)


### Features

* add plugin and refactor ReduxDevtoolsPlugin ([3192f46](https://github.com/tethys-org/mini-store/commit/3192f46eb9faf1dcd59b54877698cf61334c0ddb))
* entityStore support active ([#77](https://github.com/tethys-org/mini-store/issues/77)) ([6ecd967](https://github.com/tethys-org/mini-store/commit/6ecd967408fb1fa95608fd561f8b8defe2da9757))
* public storeFactory and add getStores ([#79](https://github.com/tethys-org/mini-store/issues/79)) ([fb2bb0b](https://github.com/tethys-org/mini-store/commit/fb2bb0b9a1df1bca48787e1da075c590a7ea06ae))



## [14.0.4](https://github.com/tethys-org/mini-store/compare/v14.0.3...v14.0.4) (2022-11-03)


### Bug Fixes

* entityStore initialState type change to TState ([c700d00](https://github.com/tethys-org/mini-store/commit/c700d00ddfa2afbe45f7bad70ce1f95cd1dbf871))



## [14.0.3](https://github.com/tethys-org/mini-store/compare/v14.0.2...v14.0.3) (2022-09-22)


### Bug Fixes

* directly return value when invoke action without observable ([#54](https://github.com/tethys-org/mini-store/issues/54)) ([b78a865](https://github.com/tethys-org/mini-store/commit/b78a865496413e56b648c53b00a00f57911cf298))


### Features

* add instanceMaxCount to StoreOptions for custom max instance count ([#55](https://github.com/tethys-org/mini-store/issues/55)) ([9f8040a](https://github.com/tethys-org/mini-store/commit/9f8040af192dccadc7fc38e964583360d6f00995))
* set store custom name via constructor options ([#52](https://github.com/tethys-org/mini-store/issues/52)) ([e48b0c5](https://github.com/tethys-org/mini-store/commit/e48b0c5c898f9c509d402b0377dc3e714a388926))



## [14.0.2](https://github.com/tethys-org/mini-store/compare/v14.0.1...v14.0.2) (2022-09-21)


### Bug Fixes

* throw error when store instance count > 20 only in devMode ([9062eb5](https://github.com/tethys-org/mini-store/commit/9062eb5f65b851fa9a753ef3403d01a3d5e9d54e))



## [14.0.1](https://github.com/worktile/store/compare/v14.0.0...v14.0.1) (2022-09-15)


### Features

* support add entity by current page size ([#48](https://github.com/worktile/store/issues/48)) ([a7555b0](https://github.com/worktile/store/commit/a7555b05ba63b46f3995f6f95f6e9efe067bf5d4))



# [14.0.0](https://github.com/tethys-org/mini-store/compare/v14.0.0-next.0...v14.0.0) (2022-08-23)



# [14.0.0-next.0](https://github.com/tethys-org/mini-store/compare/v13.0.4...v14.0.0-next.0) (2022-08-16)


### Features

* add cancel uncompleted action [#41](https://github.com/tethys-org/mini-store/issues/41) ([e7d244c](https://github.com/tethys-org/mini-store/commit/e7d244c1069847fdf0fbfe4fe3f14facfac449ee))



## [13.0.4](https://github.com/tethys-org/mini-store/compare/v13.0.3...v13.0.4) (2022-05-23)



## [13.0.3](https://github.com/tethys-org/mini-store/compare/v13.0.2...v13.0.3) (2022-05-20)



## [13.0.2](https://github.com/tethys-org/mini-store/compare/v13.0.1...v13.0.2) (2022-05-20)



## [13.0.1](https://github.com/tethys-org/mini-store/compare/v13.0.0...v13.0.1) (2022-05-20)



# [13.0.0](https://github.com/tethys-org/mini-store/compare/v12.0.0...v13.0.0) (2022-05-17)


### Features

* upgrade to angular 13 ([#35](https://github.com/tethys-org/mini-store/issues/35)) ([f49da24](https://github.com/tethys-org/mini-store/commit/f49da24b2c20a681029ab8d0f338187f25fdd30b))



# [12.0.0](https://github.com/tethys-org/mini-store/compare/v11.0.0...v12.0.0) (2022-05-17)



# [11.0.0](https://github.com/tethys-org/mini-store/compare/v0.0.1...v11.0.0) (2021-10-28)


### Bug Fixes

* add [@dynamic](https://github.com/dynamic) to Store for fix build error use Partial ([a9ee64c](https://github.com/tethys-org/mini-store/commit/a9ee64c8ccc75fae8eadce566394df9b6b9237fd))


### Features

* add docs for store ([0e89eef](https://github.com/tethys-org/mini-store/commit/0e89eefcba79ddcea9f5fc6ed3f68408f365118c))
* **entity-store:** add and addWithReferences support afterId ([938397a](https://github.com/tethys-org/mini-store/commit/938397a04d8d1bc2ccd2aec25db903b3e35e58e9))



## 0.0.1 (2021-07-06)


### Features

* initial mini-store to @tethys/store ([0cc98de](https://github.com/tethys-org/mini-store/commit/0cc98dea347a8efe1f616029d77de785bb8c5adf))
