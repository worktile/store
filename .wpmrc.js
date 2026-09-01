module.exports = {
    allowBranch: ['master', 'v0.*', 'release-*', 'release-auto-*'],
    bumpFiles: [
        'package.json',
        'pnpm-lock.yaml',
        './packages/store/package.json',
        {
            filename: './packages/store/src/version.ts',
            type: 'code'
        }
    ],
    skip: {
        changelog: true,
        confirm: true
    },
    commitAll: true,
    hooks: {
        prepublish: 'pnpm build',
        postreleaseBranch: 'git add .'
    }
};
