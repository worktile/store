/**
 * @type {import('@docgeni/template').DocgeniConfig}
 */
module.exports = {
    mode: 'full',
    title: '@tethys/store',
    logoUrl: 'https://cdn.pingcode.com/open-sources/docgeni/logo.png',
    docsDir: 'docs',
    repoUrl: 'https://github.com/tethys-org/store',
    navs: [
        null,
        {
            title: 'Components',
            path: 'components',
            lib: '@tethys/store',
            locales: {
                'zh-cn': {
                    title: '组件'
                }
            }
        },
        {
            title: 'GitHub',
            path: 'https://github.com/docgeni/docgeni-template',
            isExternal: true
        }
    ],
    libs: [
        {
            name: '@tethys/store',
            rootDir: './packages/store',
            include: ['src'],
            exclude: '',
            categories: []
        }
    ],
    defaultLocale: 'en-us',
    locales: [
        {
            key: 'en-us',
            name: 'EN'
        },
        {
            key: 'zh-cn',
            name: '中文'
        }
    ]
};
