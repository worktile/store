module.exports = {
    allowBranch: ['master', 'v0.*', 'release-auto-*', 'v*-next'],
    bumpFiles: [
        'package.json',
        'package-lock.json',
        './packages/store/package.json',
        {
            filename: './packages/store/src/version.ts',
            type: 'code'
        }
    ],
    skip: {},
    commitAll: true,
    hooks: {
        prepublish: 'yarn build',
        postreleaseBranch: 'git add .'
    }
};
