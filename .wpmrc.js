module.exports = {
    allowBranch: ['master', 'v0.*', 'release-*', 'release-auto-*'],
    bumpFiles: [
        'package.json',
        './packages/store/package.json',
        {
            filename: './packages/store/src/version.ts',
            type: 'code'
        }
    ],
    skip: {
        confirm: true
    },
    commitAll: true,
    hooks: {
        prepublish: 'pnpm build',
        postreleaseBranch: 'git add .'
    }
};
