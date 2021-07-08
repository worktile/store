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
            title: 'Examples',
            path: 'examples',
            lib: 'store',
            locales: {
                'zh-cn': {
                    title: '示例'
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
            name: 'store',
            abbrName: 'thy',
            rootDir: './packages/store',
            include: ['src', 'examples'],
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
